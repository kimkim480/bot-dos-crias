import { ActivityType, Client, Events, GatewayIntentBits } from 'discord.js';
import { logger, mongoDB } from './utils';
import { commands } from './commands';
import { createChannelHandlers } from './handlers';
import { GuildDocument } from './types';

const { BOT_TOKEN = '' } = process.env;
export class Bot extends Client {
  constructor() {
    super({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.DirectMessages,
      ],
    });

    this.login(BOT_TOKEN);

    this.once(Events.ClientReady, async () => {
      await mongoDB.connect();
      await logger(`Bot is ready!`);

      this.user?.setPresence({
        activities: [{ name: `Bot dos Crias`, type: ActivityType.Playing }],
        status: 'dnd',
      });
    });

    this.on(Events.Warn, info => logger(info));
    this.on(Events.Error, error => logger(error.message));

    this.onMessageCreate();
  }

  private onMessageCreate() {
    this.on(Events.MessageCreate, async message => {
      const { author, channel, content, guildId } = message;

      if (author.bot || !guildId) return;

      const clientGuild = await mongoDB.getClientGuild(guildId);

      const [cmd, args] = content.split(' ');

      const commandName = cmd;
      const subCommand = args;

      const command = commands[commandName];

      if (command) {
        const channelId = subCommand === 'start' ? channel.id : '';
        await command.execute(clientGuild.id, channelId);
        return;
      }

      const channelHandler = createChannelHandlers(clientGuild as Required<GuildDocument>, message)[channel.id];

      if (channelHandler) {
        await channelHandler.handle();
      }

      return;
    });
  }
}

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
