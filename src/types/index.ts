import { Message } from 'discord.js';
import { HydratedDocument } from 'mongoose';

export type Guild = {
  _id?: string;
  guildId: string;
  gptChannelId?: string;
  gpt4ChannelId?: string;
  imageChannelId?: string;
};

export type GuildDocument = HydratedDocument<Guild>;
export interface Command {
  execute(guildId: string, channelId: string): Promise<void>;
}

export interface ChannelHandler {
  handle(message: Message): Promise<void>;
}

export interface loggerOptions {
  color?: number;
  footer?: string;
  title?: string;
}
