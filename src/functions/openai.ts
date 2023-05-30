import { Configuration, OpenAIApi } from 'openai';
import { AttachmentBuilder, Message, MessageCreateOptions } from 'discord.js';
import { getAnexo, logger, splitString } from '../utils/tools';

const { OPENAI_API_KEY = '' } = process.env;

const configuration = new Configuration({
  apiKey: OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);
// TODO: Adicionar comando para configurar o `splitMessage`
export async function callChatGPT(message: Message, isGPT3: boolean, splitMessage = false) {
  await message.channel.sendTyping();
  await message.channel.send({
    content: 'Bot dos Crias está processando sua mensagem',
  });

  try {
    const model = isGPT3 ? 'gpt-3.5-turbo' : 'gpt-4';
    const max_tokens = isGPT3 ? 3000 : 1000;
    const temperature = 0.2;

    const system_prompt = `
    You are an assistant made for the purpose of helping user with code.
    You can answer about any subject that the user asks, but your mainly goal is answer about code/programming.
    
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

      attachmentContent = await getAnexo(url);
    }

    await message.channel.sendTyping();
    const completion = await openai.createChatCompletion({
      max_tokens,
      messages: [
        { role: 'system', content: system_prompt },
        { role: 'user', content: `${message.content}\n${attachmentContent}` },
      ],
      model,
      temperature,
    });

    const content = completion.data.choices[0].message?.content;

    if (!content) {
      return await message.reply({
        content: 'Algo deu errado',
      });
    }

    const billing = isGPT3
      ? ((completion.data.usage?.total_tokens || 0) * 0.002) / 1000
      : ((completion.data.usage?.prompt_tokens || 0) * 0.03 + (completion.data.usage?.completion_tokens || 0) * 0.06) /
        1000;

    await logger(
      `Model: \n${model}\n\n Max_tokens: \n${completion.data.usage?.total_tokens}\n\n Billing: \n${billing}\n\n`,
      {
        title: 'Billing',
        color: 0x1f8b4c,
      }
    );

    const match = message.content.match(/--save=([^ ]+)/);
    let file;

    if (match) {
      const value = match[1];
      file = new AttachmentBuilder(Buffer.from(content), { name: `message.${value}` });
    }

    if (splitMessage) {
      const contentArray = splitString(content);

      let lastMassage;
      for (const item of contentArray) {
        await message.channel.sendTyping();
        lastMassage = await message.reply({
          content: item,
        });
      }

      if (lastMassage) {
        file && lastMassage.edit({ files: [file] });
      }
    } else {
      if (content.length <= 2000) {
        await message.reply({
          content,
          files: file && [file],
        });
      } else {
        const newFile = new AttachmentBuilder(Buffer.from(content), { name: `message-${new Date().toISOString()}.md` });
        const files = file ? [newFile, file] : [newFile];

        await message.channel.sendTyping();
        await message.reply({
          files,
        });
      }
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
export async function callImageGPT(message: Message) {
  await message.channel.send({
    content: 'Aguarde enquanto o GPT processa a sua imagem',
  });

  try {
    const image = await openai.createImage({
      prompt: message.content,
    });

    console.log(image.data.data[0].url);

    const messageOptions: MessageCreateOptions = {
      content: image.data.data[0].url,
    };

    await message.channel.send(messageOptions);
  } catch (error: any) {
    if (error.response) {
      await message.channel.send({
        content: `${error.response.status} - ${JSON.stringify(error.response.data)}`,
      });
    } else {
      await logger(error.message, { title: 'Error', color: 0x992d22 });
    }
  }
}
