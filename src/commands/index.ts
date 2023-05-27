import { ChatCommand } from './ChatCommand';
import { ImageCommand } from './ImageCommand';
import { Command } from '../types';

export const commands: Record<string, Command> = {
  '!chat': new ChatCommand(true),
  '!gpt4': new ChatCommand(false),
  '!img': new ImageCommand(),
};
