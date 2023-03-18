# Discord Bot with OpenAI
This is a hobby project that creates a Discord bot using Discord.js and OpenAI's API to provide advanced language processing capabilities. The bot can respond to messages, summarize text, analyze sentiment, translate languages, search for information, generate text, and answer questions, among other features. It's a great way to experiment with the latest natural language processing technologies and learn how to build a bot for Discord.

# Installation
To install the bot, follow these steps:

1. Clone this repository to your local machine.
2. Install the required dependencies using npm: `npm install`
3. Set up your Discord bot by creating a new bot application and adding it to your Discord server.
You can follow this guide to learn how to create a bot and add it to your server:
[discord.js guide](https://discordjs.guide/preparations/setting-up-a-bot-application.html#creating-your-bot)
4. Obtain an API key for OpenAI's API. You can sign up for a free API key on OpenAI's website: [OpenAI API](https://platform.openai.com/overview)
5. Create a file named `.env` in the root directory of the project and add your OpenAI API key as a variable: `OPENAI_API_KEY=<your api key>`
6. Start the bot using `npm build && npm start`. The bot should now be online and ready to receive commands.

# Usage
To use the bot, simply type a command in a text channel where the bot is present. Here are some example commands:

`!chat start/stop`: The bot will be added/removed to the channel.
 After `!chat start` the bot will respond to all messages in the channel, but it won't memorize the previous prompt.

`!img start/stop`: The bot will be added/removed to the channel.
 After `!img start` the bot will respond to all messages in the channel trying to generate an image using the BETA DALL-E model

# Contributing
This project is open to contributions from anyone who is interested in improving it. To contribute, simply fork this repository, make your changes, and create a pull request. Please make sure to follow the coding conventions and add appropriate documentation for any new features or changes.

# License
This project is licensed under the MIT License - see the LICENSE file for details
