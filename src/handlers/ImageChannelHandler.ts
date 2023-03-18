import { Message } from 'discord.js';
import { ChannelHandler } from '../types';
import { callImageGPT } from '../functions/openai';

export class ImageChannelHandler implements ChannelHandler {
  async handle(message: Message): Promise<void> {
    await callImageGPT(message);
  }
}
