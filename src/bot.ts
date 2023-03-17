import { Client, GatewayIntentBits } from 'discord.js';
import { BOT_TOKEN } from '../config';
import { messageToSpoiler } from './functions/spoiler';
import { GuildModel, init, mongoConnect, update } from './utils/mongodb';
import { callChatGPT, callImageGPT } from './functions/openai';

export const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

client.once('ready', async () => {
  await mongoConnect();
  console.log('Bot is ready!');
});

client.on('messageCreate', async message => {
  const { author, channel, content, guildId } = message;
  if (author.bot || !guildId) return;
  let clientGuild = await init(guildId);

  const command = content.split(" ");

  if(content.startsWith("!spoiler")) {
    if (command[1] === 'start') {
      // @ts-ignore
      clientGuild = await update(clientGuild.id, { spoilerChannelId: channel.id })
    }

    if(command[1] === 'stop') {
      // @ts-ignore
      clientGuild = await update(clientGuild.id, { spoilerChannelId: '' })
    }

    return;
  }

  if(content.startsWith("!chat")) {
    if (command[1] === 'start') {
      // @ts-ignore
      clientGuild = await update(clientGuild.id, { gptChannelId: channel.id })
    }

    if(command[1] === 'stop') {
      // @ts-ignore
      clientGuild = await update(clientGuild.id, { gptChannelId: '' })
    }

    return;
  }

  if(content.startsWith("!img")) {
    if (command[1] === 'start') {
      // @ts-ignore
      clientGuild = await update(clientGuild.id, { imageChannelId: channel.id })
    }

    if(command[1] === 'stop') {
      // @ts-ignore
      clientGuild = await update(clientGuild.id, { imageChannelId: '' })
    }

    return;
  }

  if(channel.id === clientGuild.spoilerChannelId) {
    await messageToSpoiler(message);
  }

  if(channel.id === clientGuild.gptChannelId) {
    await callChatGPT(message);
  }

  if(channel.id === clientGuild.imageChannelId) {
    await callImageGPT(message);
  }

  return;
});

client.login(BOT_TOKEN);

