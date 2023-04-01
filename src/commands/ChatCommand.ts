import { update } from '../utils/mongodb';
import { Command } from '../types';

export class ChatCommand implements Command {
  private readonly isGPT3: boolean;
  constructor(isGPT3: boolean) {
    this.isGPT3 = isGPT3;
  }
  async execute(guildId: string, channelId: string): Promise<void> {
    if (this.isGPT3) {
      await update(guildId, {
        gptChannelId: channelId,
      });
    } else {
      await update(guildId, {
        gpt4ChannelId: channelId,
      });
    }
  }
}
