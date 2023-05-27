import { WebhookClient } from 'discord.js';
import { loggerOptions } from '../types';
import axios from 'axios';

const { DISCORD_LOG_CHANNEL_WEBHOOK = '' } = process.env;

export function splitString(str: string) {
  return str.match(/(.|[\r\n]){1,2000}/g) as string[];
}

export async function logger(message: string, options?: loggerOptions) {
  const webHook = new WebhookClient({ url: DISCORD_LOG_CHANNEL_WEBHOOK });
  const { footer, title, color } = options || {};

  const date = new Date();

  const formatter = new Intl.DateTimeFormat('pt-BR', {
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    month: 'numeric',
    second: 'numeric',
    timeZone: 'America/Sao_Paulo',
    year: 'numeric',
  });

  return webHook.send({
    embeds: [
      {
        color: color || 0x206694,
        description: `**${message}**`,
        footer: footer ? { text: footer } : undefined,
        title: title || `[${formatter.format(date)}]`,
      },
    ],
  });
}

export async function getAnexo(url: string) {
  const { data } = await axios<string>({
    method: 'get',
    url: url,
  });

  return data;
}
