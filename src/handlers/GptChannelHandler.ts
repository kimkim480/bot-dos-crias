import { ChannelHandler } from '../types';
import { Message } from 'discord.js';
import { callChatGPT } from '../functions/openai';

export class GptChannelHandler implements ChannelHandler {
  private readonly isGPT3: boolean;
  constructor(isGPT3: boolean) {
    this.isGPT3 = isGPT3;
  }
  async handle(message: Message): Promise<void> {
    await callChatGPT(message, this.isGPT3);
  }
}
