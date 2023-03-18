import { SpoilerCommand } from './SpoilerCommand';
import { ChatCommand } from './ChatCommand';
import { ImageCommand } from './ImageCommand';
import { Command } from '../types';

export const commands: Record<string, Command> = {
  '!spoiler': new SpoilerCommand(),
  '!chat': new ChatCommand(),
  '!img': new ImageCommand(),
};
