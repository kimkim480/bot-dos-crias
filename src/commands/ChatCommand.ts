import { update } from '../utils/mongodb';
import { Command } from '../types';

export class ChatCommand implements Command {
  async execute(guildId: string, channelId: string): Promise<void> {
    await update(guildId, {
      gptChannelId: channelId,
    });
  }
}
