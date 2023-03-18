import { ChannelHandler, GuildDocument } from '../types';
import { SpoilerChannelHandler } from './SpoilerChannelHandler';
import { GptChannelHandler } from './GptChannelHandler';
import { ImageChannelHandler } from './ImageChannelHandler';

export function createChannelHandlers(
  clientGuild: Required<GuildDocument> // Required<Guild>
): Record<string, ChannelHandler> {
  return {
    [clientGuild.spoilerChannelId]: new SpoilerChannelHandler(),
    [clientGuild.gptChannelId]: new GptChannelHandler(),
    [clientGuild.imageChannelId]: new ImageChannelHandler(),
  };
}
