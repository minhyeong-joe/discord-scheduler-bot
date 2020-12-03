require('dotenv').config();
const discord = require('discord.js');

const client = new discord.Client();

client.on('ready', () => {
    console.log("Bot is online");
});

client.login(process.env.BOT_TOKEN);