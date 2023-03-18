import { Command } from '../types';
import { update } from '../utils/mongodb';

export class ImageCommand implements Command {
  async execute(guildId: string, channelId: string): Promise<void> {
    await update(guildId, {
      imageChannelId: channelId,
    });
  }
}
