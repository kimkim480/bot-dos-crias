import { Configuration, OpenAIApi } from 'openai';
import { OPENAI_API_KEY } from '../../config';
import { Message, MessageCreateOptions } from 'discord.js';

const configuration = new Configuration({
  apiKey: OPENAI_API_KEY
});

const openai = new OpenAIApi(configuration);

export async function callChatGPT(message: Message) {
  await message.channel.send({ content: 'Aguarde enquanto o GPT processa a sua resposta' });

  try {
    const completion = await openai.createChatCompletion({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: message.content }]
    });

    const messageOptions: MessageCreateOptions = {
      content: completion.data.choices[0].message?.content
    };

    await message.channel.send(messageOptions);

  } catch (error: any) {
    if (error.response) {
      await message.channel.send({
        content: `${error.response.status} - ${error.response.data}`
      });
    } else {
      console.log(error.message);
    }
  }
}

export async function callImageGPT(message: Message) {
  await message.channel.send({ content: 'Aguarde enquanto o GPT processa a sua imagem' });

  try {
    const image = await openai.createImage({
      prompt: message.content
    });

    console.log(image.data.data[0].url);

    const messageOptions: MessageCreateOptions = {
      content: image.data.data[0].url
    };

    await message.channel.send(messageOptions);
  } catch (error: any) {
    if (error.response) {
      await message.channel.send({
        content: `${error.response.status} - ${error.response.data}`
      });
    } else {
      console.log(error.message);
    }
  }

}