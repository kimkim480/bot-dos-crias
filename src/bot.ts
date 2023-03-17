import { Client, GatewayIntentBits } from 'discord.js';
import { BOT_TOKEN } from '../config';
import { messageToSpoiler } from './functions/spoiler';
import { GuildModel, init, mongoConnect, update } from './utils/mongodb';
import { callChatGPT, callImageGPT } from './functions/openai';

const COMMANDS = {
  '!spoiler': 'spoiler',
  '!chat': 'chat',
  '!img': 'img',
};

export const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

client.once('ready', async () => {
  await mongoConnect();
  console.log('Bot is ready!');
});

client.on('messageCreate', async message => {
  const { author, channel, content, guildId } = message;
  if (author.bot || !guildId) return;
  const clientGuild = await init(guildId);

  const command = content.split(' ');

  switch (command[0]) {
    case '!spoiler':
      if (command[1] === 'start') {
        await update(clientGuild.id, {
          spoilerChannelId: channel.id,
        });
      }

      if (command[1] === 'stop') {
        await update(clientGuild.id, { spoilerChannelId: '' });
      }
      return;
    case '!chat':
      if (command[1] === 'start') {
        await update(clientGuild.id, { gptChannelId: channel.id });
      }

      if (command[1] === 'stop') {
        await update(clientGuild.id, { gptChannelId: '' });
      }
      return;
    case '!img':
      if (command[1] === 'start') {
        await update(clientGuild.id, {
          imageChannelId: channel.id,
        });
      }

      if (command[1] === 'stop') {
        await update(clientGuild.id, { imageChannelId: '' });
      }
      return;
    default:
      break;
  }

  switch (channel.id) {
    case clientGuild.spoilerChannelId:
      await messageToSpoiler(message);
      break;
    case clientGuild.gptChannelId:
      await callChatGPT(message);
      break;
    case clientGuild.imageChannelId:
      await callImageGPT(message);
      break;
    default:
      break;
  }

  return;
});

client.login(BOT_TOKEN);
