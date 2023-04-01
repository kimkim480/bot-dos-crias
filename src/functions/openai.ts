import { Configuration, OpenAIApi } from 'openai';
import { Message, MessageCreateOptions } from 'discord.js';
import { logger, splitString } from '../utils/tools';
import * as process from 'process';

const { OPENAI_API_KEY = '' } = process.env;

const configuration = new Configuration({
  apiKey: OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);
export async function callChatGPT(message: Message, isGPT3: boolean) {
  await message.channel.sendTyping();
  await message.channel.send({
    content: 'Bot dos Crias está processando sua mensagem',
  });

  try {
    const model = isGPT3 ? 'gpt-3.5-turbo' : 'gpt-4';
    logger({ model });

    await message.channel.sendTyping();
    const completion = await openai.createChatCompletion({
      model,
      messages: [{ role: 'user', content: message.content }],
    });

    const content = completion.data.choices[0].message?.content;
    const billing = isGPT3
      ? ((completion.data.usage?.total_tokens || 0) * 0.002) / 1000
      : ((completion.data.usage?.prompt_tokens || 0) * 0.03 + (completion.data.usage?.completion_tokens || 0) * 0.06) /
        1000;

    logger({ usage: completion.data.usage, billing });
    logger({ len: content?.length });

    const contentArray = splitString(content || '');

    for (const string of contentArray) {
      await message.channel.sendTyping();
      await message.channel.send({
        content: string,
      });
    }

    return;
  } catch (error: any) {
    if (error.response) {
      await message.channel.send({
        content: `${error.response.status} - ${JSON.stringify(error.response.data)}`,
      });
    } else {
      logger(error.message);
    }
  }
}
export async function callImageGPT(message: Message) {
  await message.channel.send({
    content: 'Aguarde enquanto o GPT processa a sua imagem',
  });

  try {
    const image = await openai.createImage({
      prompt: message.content,
    });

    console.log(image.data.data[0].url);

    const messageOptions: MessageCreateOptions = {
      content: image.data.data[0].url,
    };

    await message.channel.send(messageOptions);
  } catch (error: any) {
    if (error.response) {
      await message.channel.send({
        content: `${error.response.status} - ${JSON.stringify(error.response.data)}`,
      });
    } else {
      logger(error.message);
    }
  }
}
