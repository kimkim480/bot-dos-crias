import { Command } from '../types';
import { mongoDB } from '../utils';

export class ImageCommand implements Command {
  async execute(guildId: string, channelId: string): Promise<void> {
    await mongoDB.update(guildId, {
      imageChannelId: channelId,
    });
  }
}
