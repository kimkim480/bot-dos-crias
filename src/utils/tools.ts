import { WebhookClient } from 'discord.js';
import { BillingOptions, LoggerOptions } from '../types';
import axios from 'axios';

const { DISCORD_LOG_CHANNEL_WEBHOOK = '', IS_DEV = '' } = process.env;

export function splitString(str: string) {
  // 2000 is the Discord max characters
  return str.match(/(.|[\r\n]){1,2000}/g) as string[];
}

export function getBilling(isGPT3: boolean, data: BillingOptions) {
  return isGPT3 ? (data.totalTokens * 0.002) / 1000 : (data.promptTokens * 0.03 + data.completionTokens * 0.06) / 1000;
}

export async function logger(message: string, options?: LoggerOptions) {
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

  IS_DEV === 'true'
    ? console.log(message)
    : await webHook.send({
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
