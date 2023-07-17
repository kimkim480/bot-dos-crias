### Observations

This bot is being continuously developed and the README is not being updated very often due to my lack of time, so you
may find some inconsistencies between the README and the Code.

# Discord Bot with OpenAI

This is a hobby project that creates a Discord bot using Discord.js and OpenAI's API. The main goal of the bot is to
help users with code/programming.

# Installation

To install the bot, follow these steps:

1. Clone this repository to your local machine.
2. Install the required dependencies using npm: `npm install`.
3. Set up your Discord bot by creating a new bot application and adding it to your Discord server. You can follow this
   guide to learn how to create a bot and add it to your
   server: [discord.js guide](https://discordjs.guide/preparations/setting-up-a-bot-application.html#creating-your-bot).
4. Obtain an API key for OpenAI's API. You can sign up for a free API key on OpenAI's
   website: [OpenAI API](https://platform.openai.com/overview).
5. Create a file named `.env` in the root directory of the project and add your OpenAI API key, as well as your Bot
   Token and your Mongo URI. If you want to use the `logger` function, you may create a webhook for a Discord channel
   and add it to the `.env` file.
6. Start the bot using `npm dev` or `npm build && npm start`. The bot should now be online and ready to receive
   commands.

# Usage

To use the bot, simply type a command in a text channel where the bot is present. Here are some example commands:

`!chat start/stop`: The bot will be added/removed from the channel. After `!chat start`, the bot will respond to all
messages in the channel, but it won't memorize the previous prompt.

`!img start/stop`: The bot will be added/removed from the channel. After `!img start`, the bot will respond to all
messages in the channel, trying to generate an image using the BETA DALL-E model.

# Contributing

This project is open to contributions from anyone who is interested in improving it. To contribute, simply fork this
repository, make your changes, and create a pull request.