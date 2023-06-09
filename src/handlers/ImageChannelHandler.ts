import { Message, MessageCreateOptions } from 'discord.js';
import { ChannelHandler } from '../types';
import { logger } from '../utils';
import { Configuration, OpenAIApi } from 'openai';

const { OPENAI_API_KEY = '' } = process.env;

export class ImageChannelHandler implements ChannelHandler {
  private readonly openAI;
  private readonly userMessage: Message;
  constructor(message: Message) {
    this.userMessage = message;
    this.openAI = new OpenAIApi(
      new Configuration({
        apiKey: OPENAI_API_KEY,
      })
    );
  }
  async handle(): Promise<void> {
    await this.callImageGPT(this.userMessage);
  }

  private async callImageGPT(message: Message) {
    await message.channel.send({
      content: 'Aguarde enquanto o GPT processa a sua imagem',
    });

    try {
      const image = await this.openAI.createImage({
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
}
