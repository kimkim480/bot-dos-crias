import { Message } from 'discord.js';
import { HydratedDocument } from 'mongoose';

export type Guild = {
  _id?: string;
  guildId: string;
  gptChannelId?: string;
  spoilerChannelId?: string;
  imageChannelId?: string;
};

export type GuildDocument = HydratedDocument<Guild>;
export interface Command {
  execute(guildId: string, channelId: string): Promise<void>;
}

export interface ChannelHandler {
  handle(message: Message): Promise<void>;
}
