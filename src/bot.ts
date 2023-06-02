import * as dotenv from 'dotenv';
dotenv.config();

import { Client, GatewayIntentBits } from 'discord.js';
import { init, mongoConnect } from './utils/mongodb';
import { commands } from './commands';
import { createChannelHandlers } from './handlers';
import { GuildDocument } from './types';
import { logger } from './utils/tools';

const { BOT_TOKEN = '' } = process.env;

export const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessageReactions,
  ],
});

client.once('ready', async () => {
  await mongoConnect();
  await logger(`Bot is ready!`);
});

client.on('messageCreate', async message => {
  const { author, channel, content, guildId } = message;
  if (author.bot || !guildId) return;
  const clientGuild = await init(guildId);

  const [cmd, args] = content.split(' ');

  const commandName = cmd;
  const subCommand = args;

  const command = commands[commandName];

  if (command) {
    const channelId = subCommand === 'start' ? channel.id : '';
    await command.execute(clientGuild.id, channelId);
    return;
  }

  const channelHandler = createChannelHandlers(clientGuild as Required<GuildDocument>)[channel.id];

  if (channelHandler) {
    await channelHandler.handle(message);
  }

  return;
});

// client.on('messageReactionAdd', async (reaction, user) => {
//   console.log(`Collected ${reaction.emoji.name} from ${user.tag}`);
//   if (user.bot) {
//     return;
//   }
//
//   if (reaction.emoji.name === '💾' && reaction.message.author?.bot) {
//     await user.send('Opa');
//   }
// });

client.login(BOT_TOKEN);
