import { Message, AttachmentBuilder, MessageCreateOptions } from 'discord.js';

export async function messageToSpoiler(message: Message) {
  const { attachments, author,content } = message;

  const messageOptions: MessageCreateOptions = {
    content: `||<@${author.id}>: ${content}||`,
  };

  if (attachments.size > 0 && attachments.some(attachment => !(attachment.spoiler))) {
    messageOptions.files = attachments.map((attachment) => {
     return new AttachmentBuilder(attachment.proxyURL, { name: `SPOILER_${attachment.name}`});
    });
  }

  await message.channel.send(messageOptions);
  await message.delete();
}