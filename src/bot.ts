import { Player } from "discord-player";
import { Client, Intents } from "discord.js";
import { BOT_TOKEN } from "../config";
import { execute, listQueue, skip, stop } from "./functions/playSong";
import { getLinkUrl } from "./utils/youtube";

export const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_VOICE_STATES] });

client.once('ready', () => {
  console.log('Bot is ready!');
});

client.on('messageCreate', async message => {
  if (message.author.bot) return;

  const { content, guild } = message;

  if (!content.startsWith("!iure")) return;

  const command = content.split(" ");

  if (command[1] === 'stackoverflow') {
    const search = command.splice(2, command.length).join(" ");
    const link = await getLinkUrl(search);
    await message.reply(link);
  }

  if (command[1] === 'toca') {
    await execute(message);
  }

  if (command[1] === 'para') {
    await stop(message, player);
  }

  if (command[1] === 'lista') {
    await listQueue(message, player.getQueue(guild!.id));
  }

  if (command[1] === 'proxima') {
    await skip(message, player);
  }

});

client.login(BOT_TOKEN);

export const player = new Player(client);

player.on("connectionCreate", async (queue, connection) => {
  if (!queue.metadata) return console.log("Not metadata");
  queue.metadata.channel.send("Cheguei mané!");
});

player.on("channelEmpty", async (queue) => {
  return queue.connection.disconnect()
});

player.on("trackStart", async (queue, track) => {
  if (!queue.metadata) return console.log("Not metadata");
  queue.metadata.channel.send({
    embeds: [
      {
        author: {
          name: track.requestedBy.username + " - tô tocano",
          icon_url: track.requestedBy.displayAvatarURL(),
        },
        description: `[${track.title}](${track.url}) - [Duração: **${track.duration}**]`,
        color: 0x00ff00,
      },
    ],
  }).then(m => setTimeout(() => m.delete(), track.durationMS))
});

player.on("trackAdd", async (queue, track) => {
  if (!queue.metadata) return console.log("Not metadata");
  if (queue.tracks.length >= 1) {
    queue.metadata.channel.send({
      embeds: [
        {
          description: `Adicionado **[${track.title}](${track.url})** - [Duração: **${track.duration}**]`,
          color: 0x00aaff,
        },
      ],
    });
  }
});
