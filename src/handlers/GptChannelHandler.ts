import { ChannelHandler } from '../types';
import { Message } from 'discord.js';
import { callChatGPT } from '../functions/openai';

export class GptChannelHandler implements ChannelHandler {
  async handle(message: Message): Promise<void> {
    await callChatGPT(message);
  }
}
