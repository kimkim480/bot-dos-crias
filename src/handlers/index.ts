import { ChannelHandler, GuildDocument } from '../types';
import { GptChannelHandler } from './GptChannelHandler';
import { ImageChannelHandler } from './ImageChannelHandler';
import { Message } from 'discord.js';

export function createChannelHandlers(
  clientGuild: Required<GuildDocument>, // Required<Guild>
  message: Message
): Record<string, ChannelHandler> {
  return {
    [clientGuild.gptChannelId]: new GptChannelHandler(true, message),
    [clientGuild.gpt4ChannelId]: new GptChannelHandler(false, message),
    [clientGuild.imageChannelId]: new ImageChannelHandler(),
  };
}
