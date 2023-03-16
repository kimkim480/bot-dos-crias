import { Message, MessageEmbed } from "discord.js";
import { Player, QueryType, Queue } from 'discord-player';
import play from 'play-dl';

import { player } from "../bot";

export async function execute(message: Message) {
  const args = message.content.split(" ");
  const search = args.splice(2, args.length).join(" ");
  const voiceChannel = message.member!.voice.channel;

  if (!voiceChannel) {
    return message.channel.send(
      "Oh misera, entra no canal de voz aí mula!"
    );
  }

  const permissions = voiceChannel.permissionsFor(message.client.user!);

  if (!permissions!.has("CONNECT") || !permissions!.has("SPEAK")) {
    return message.channel.send(
      "Oh mané deixa eu entrar no canal de voz aí na moralzinha!"
    );
  }

  let queue = player.getQueue(message.guildId!);

  if (!queue) {
    queue = player.createQueue(message.guild!, {
      metadata: { channel: message.channel, m: message, dj: message.author },
      leaveOnEmpty: true,
      leaveOnEmptyCooldown: 3000,
      leaveOnEnd: true,
      leaveOnStop: true,
      ytdlOptions: {
        filter: "audioonly",
      },
      async onBeforeCreateStream(track, source, _queue) {
        if (track.url.includes('youtube') || track.url.includes("youtu.be")) {
          try {
            const playStream = (await play.stream(track.url, { discordPlayerCompatibility: true })).stream // ytdl(track.url, { filter: "audioonly" });
            return playStream;
          } catch (err) {
            console.log(err)
            return _queue.metadata.m.channel.send("Deu erro no DL MERDA DE BOT")
          }
        } else if (track.url.includes('spotify')) {
          try {
            let songs = await player.search(`${track.author} ${track.title} `, {
              requestedBy: message.member!,
            }).catch().then(x => x.tracks[0]);
            return (await play.stream(songs.url, { discordPlayerCompatibility: true })).stream;
          } catch (err) {
            console.log(err)
          }
        } else if (track.url.includes('soundcloud')) {
          try {
            return (await play.stream(track.url)).stream;
          } catch (err) {
            console.log(err)
          }
        }
      }
    });
  }

  if (queue.metadata.channel.id !== message.channel.id) queue.metadata.channel = message.channel;
  const searchResult = await player
    .search(search, {
      requestedBy: message.author,
      searchEngine: QueryType.AUTO
    })
    .catch(async (e) => { });


  if (!searchResult || !searchResult.tracks.length) {
    return message.channel.send("Não consegui encontrar nada aí mula!");
  }

  try {
    if (!queue.connection) await queue.connect(message!.member!.voice.channel!);
  } catch (err: any) {
    console.log("ErrConnection")
    console.log(err)
    if (err.toString().includes('Error: Did not enter state ready within 20000ms')) return
    player.deleteQueue(message!.guild!.id)
    return message.channel.send(`"Oh mané deixa eu entrar no canal de voz aí na moralzinha!"`);
  }
  if (!message!.guild!.me!.voice.channel) await queue.connect(message!.member!.voice.channel!);
  searchResult.playlist ? queue.addTracks(searchResult.tracks) : queue.addTrack(searchResult.tracks[0]);
  if (!queue.playing) await queue.play();
}


export async function listQueue(message: Message, queue: Queue) {

  if (!queue || !queue.playing || !queue.current) {
    return message.channel.send("Não tem música na fila, besta!");
  }

  if (!message.guild!.me!.permissions.has("MANAGE_MESSAGES")) {
    return message.channel.send("Cole mané deixa eu editar as msg ae")
  }

  if (queue.tracks.length < 6) {
    const embed = new MessageEmbed()
      .setTitle(`Listinha pra: ${message.guild?.name} `)
      .setColor(0x00AE86)
      .setAuthor({
        name: `${message.author.username}`,
        iconURL: message.author.displayAvatarURL({ dynamic: true, size: 512 })
      })
      .setFooter({
        text: `${message.author.username}`,
        iconURL: message.author.displayAvatarURL({ dynamic: true, size: 512 })
      })
      .addField("__TOCANO__", `[${queue.current.title}](${queue.current.url}) | \`Adicionado por ${queue.current.requestedBy.username} ${queue.current.duration} \``)
      .addField(`____Próximas músicas na fila____`, queue.tracks.map((m, i) => `\`#${i + 1}\`  [${m.title.slice(0, 80)}](${m.url}) \`Adicionado por ${m.requestedBy.username} ${m.duration}\``).join("\n") || "Não tem mais nada")
      .addField("DJ", `<@${queue.metadata.dj.id}>`, true)
    message.channel.send({ embeds: [embed], allowedMentions: { repliedUser: false } })
  } else {
    let i0 = 0;
    let i1 = 6;
    let page = 1;
    let description = queue.tracks.map((m, i) => `\`#${i + 1}\`  [${m.title.slice(0, 80)}](${m.url}) \`Adicionado por ${m.requestedBy.username} ${m.duration}\``).slice(0, 6).join("\n");
    const embed = new MessageEmbed()
      .setTitle(`Listinha pra: ${message.guild?.name} `)
      .setColor(0x00AE86)
      .setAuthor({
        name: `${message.author.username}`,
        iconURL: message.author.displayAvatarURL({ dynamic: true, size: 512 })
      })
      .setFooter({
        text: `${message.author.username}`,
        iconURL: message.author.displayAvatarURL({ dynamic: true, size: 512 })
      })
      .addField("__TOCANO__", `[${queue.current.title}](${queue.current.url}) | \`Adicionado por ${queue.current.requestedBy.username} ${queue.current.duration} \``)
      .setDescription(description)
      .addField("DJ", `<@${queue.metadata.dj.id}>`, true)

    const msg = await message.channel.send({ embeds: [embed], allowedMentions: { repliedUser: false } });
    await msg.react("⬅");
    await msg.react("➡");
    const c = msg.createReactionCollector({ filter: (reaction, user) => user.id === message.author.id, time: 100000 });
    c.on("collect", async reaction => {
      console.log({ reaction })
      if (reaction.emoji.name === "⬅") {
        i0 = i0 - 6;
        i1 = i1 - 6;
        page = page - 1
        if (i0 < 0) return;
        if (page < 1) return;
        let description =
          queue.tracks.map((m, i) => `\`#${i + 1}\`  [${m.title.slice(0, 80)}](${m.url}) \`Adicionado po ${m.requestedBy.username} ${m.duration}\``).slice(i0, i1).join("\n");
        embed.setDescription(description);
        msg.edit({ embeds: [embed] });
      }
      if (reaction.emoji.name === "➡") {
        i0 = i0 + 6;
        i1 = i1 + 6;
        page = page + 1
        if (i1 > queue.tracks.length + 6) return;
        if (i0 < 0) return;
        let description =
          queue.tracks.map((m, i) => `\`#${i + 1}\`  [${m.title.slice(0, 80)}](${m.url}) \`Adicionado por ${m.requestedBy.username} ${m.duration}\``).slice(i0, i1).join("\n");
        embed.setDescription(description);
        msg.edit({ embeds: [embed] });
      }
      await reaction.users.remove(message.author.id);
    })
  }
}

export async function stop(message: Message, player: Player) {
  const queue = player.getQueue(message.guild!.id);

  if (!queue || !queue.playing) {
    return message.channel.send("Não tô tocano nada oh fi do teto!");
  }

  if (message.guild!.me!.voice.channel && message.member!.voice.channel!.id !== message.guild!.me!.voice.channel.id) {
    return message.channel.send("Oh diaxo cê tá em outo canal");
  }

  queue.destroy()
  player.deleteQueue(message.guild!.id)
  return message.channel.send("Parei mané, tururu!")
}

export async function skip(message: Message, player: Player) {
  const queue = player.getQueue(message.guild!.id);

  if (!queue || !queue.playing) {
    message.channel.send("Não tô tocano nada oh fi do teto!");
  }

  if (message.guild!.me!.voice.channel && message.member!.voice.channel!.id !== message.guild!.me!.voice.channel.id) {
    return message.channel.send("Oh diaxo cê tá em outo canal");
  }

  if (queue.tracks.length == 0) {
    return message.channel.send("Não tem mais nada na fila");
  }

  const success = queue.skip();
  if (success) {
    return message.channel.send("Dj, manda a próxima");
  } else {
    return message.channel.send("Ué, não tem mais nada na fila");
  }
}