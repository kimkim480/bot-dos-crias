import { ChannelHandler } from '../types';
import { AttachmentBuilder, Message } from 'discord.js';
import { getAttachment, getBilling, logger, splitString } from '../utils';
import { Configuration, OpenAIApi } from 'openai';

const { OPENAI_API_KEY = '' } = process.env;

export class GptChannelHandler implements ChannelHandler {
  private readonly isGPT3: boolean; // TODO: This is only needed for now because of the getBilling function
  // private readonly maxTokens: number;
  private readonly model: string;
  private readonly openAI;
  private readonly userMessage: Message;

  constructor(isGPT3: boolean, message: Message) {
    this.isGPT3 = isGPT3;

    this.model = isGPT3 ? 'gpt-3.5-turbo' : 'gpt-4';

    // this.maxTokens = isGPT3 ? 4096 : 16384;

    this.openAI = new OpenAIApi(
      new Configuration({
        apiKey: OPENAI_API_KEY,
      }),
    );

    this.userMessage = message;
  }

  async handle(): Promise<void> {
    await this.callChatGPT(this.userMessage);
  }

  // TODO: Let the user defines whether to splitMessage or not
  private async callChatGPT(message: Message, splitMessage = false) {
    await message.channel.sendTyping();
    await message.channel.send({
      content: 'Bot dos Crias está processando sua mensagem',
    });

    try {
      // temperature will be a number between 0 and 1 (0.1..0.9)
      const temperature = Number((Math.random() * 0.8 + 0.1).toFixed(1));

      const systemPrompt = `
    You are Bot dos Crias, an assistant made for the purpose of helping user with code.
    
    - Your mainly goal is answer about code/programming.
    - Always give an explanation and example of what is being asked.
    - If your response has a piece of code, put it into markdown of that language. Example: \`\`\`ts your code \`\`\`.
    - If necessary use Discord Text Formatting to make your message more clear and comprehensive.
    - If you've been asked to convert/format or do some data transformation DO IT! Don't show any code, but the result!!
    `;

      const attachment = message.attachments.first();
      let attachmentContent = '';

      if (attachment) {
        const { url, contentType } = attachment;

        if (!contentType?.includes('text/plain')) {
          await message.channel.send({
            content: 'No momento só tenho suporte para arquivos txt',
          });

          return;
        }

        attachmentContent = await getAttachment(url);
      }

      const completion = await this.openAI.createChatCompletion({
        // max_tokens: this.maxTokens,
        messages: [
          { role: 'system', content: systemPrompt },
          {
            role: 'user',
            content: `${message.content}\n${attachmentContent}`,
            name: message.author.username
              .split(' ')[0]
              .normalize('NFD')
              .replace(/[\u0300-\u036f]/g, ''),
          },
        ],
        model: this.model,
        temperature,
      });

      const completionResponse = completion.data.choices[0].message?.content;

      if (!completionResponse) {
        return message.reply({
          content: 'Algo deu errado',
        });
      }

      const billing = getBilling(this.isGPT3, {
        promptTokens: completion.data.usage?.prompt_tokens || 0,
        completionTokens: completion.data.usage?.completion_tokens || 0,
        totalTokens: completion.data.usage?.total_tokens || 0,
      });

      await logger(
        `Temperature: \n${temperature}\n\n Model: \n${this.model}\n\n Max_tokens: \n${completion.data.usage?.total_tokens}\n\n Billing: \n${billing}\n\n`,
        {
          title: 'Billing',
          color: 0x1f8b4c,
        },
      );

      let lastMessage;
      if (splitMessage) {
        const contentArray = splitString(completionResponse);

        for (const item of contentArray) {
          await message.channel.sendTyping();
          lastMessage = await message.reply({
            content: item,
          });
        }
      } else {
        // 2000 is the Discord max characters
        if (completionResponse.length <= 2000) {
          await message.channel.sendTyping();
          lastMessage = await message.reply({
            content: completionResponse,
          });
        } else {
          const newFile = new AttachmentBuilder(Buffer.from(completionResponse), {
            name: `message-${new Date().toISOString()}.md`,
          });

          await message.channel.sendTyping();
          lastMessage = await message.reply({
            files: [newFile],
          });
        }
      }

      if (lastMessage) {
        lastMessage.react('💾');
        lastMessage.react('🔄');

        const collector = lastMessage.createReactionCollector({ time: 300_000 });

        collector.on('collect', async (reaction, user) => {
          console.log(`Collected ${reaction.emoji.name} from ${user.tag}`);

          if (user.bot) {
            return;
          }

          if (reaction.emoji.name === '💾') {
            const newFile = new AttachmentBuilder(Buffer.from(completionResponse), {
              name: `message-${new Date().toISOString()}.md`,
            });
            await user.send({ content: 'Aqui está seu arquivo!', files: [newFile] });
          }

          if (reaction.emoji.name === '🔄' && user.id === this.userMessage.author.id) {
            // If responses were always the same or similar then I should consider randomize temperature and pass it as a parameter
            await this.callChatGPT(this.userMessage);
          }

          if (reaction.emoji.name === '🔄' && user.id !== this.userMessage.author.id) {
            await reaction.message.channel.send({
              content: `${user} apenas o autor da mensagem pode gerar uma nova resposta`,
            });
          }
        });
      }

      return;
    } catch (error: any) {
      if (error.response) {
        if (error.response.data.error?.code?.includes('context_length_exceeded')) {
          await message.channel.send({
            content: 'O tamanho da mensagem está acima do suportado pelo GPT-3.5',
          });
        } else {
          await message.channel.send({
            content: `${error.response.status} - ${error.response.data.error?.message}`,
          });
        }
      } else {
        await logger(error.message, { title: 'Error', color: 0x992d22 });
      }
    }
  }
}
