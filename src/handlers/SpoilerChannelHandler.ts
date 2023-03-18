import { ChannelHandler } from '../types';
import { Message } from 'discord.js';
import { messageToSpoiler } from '../functions/spoiler';

export class SpoilerChannelHandler implements ChannelHandler {
  async handle(message: Message): Promise<void> {
    await messageToSpoiler(message);
  }
}
