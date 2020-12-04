require('dotenv').config();
const discord = require('discord.js');
const mongoose = require('mongoose');

const { COMMANDS, HELP_MESSAGE } = require('./src/commands.js');
const { createEvent, showEvents } = require('./src/bot');

const client = new discord.Client();

const PREFIX = "$";

// db connection
mongoose.connect(process.env.DB_URL, { useNewUrlParser:true, useFindAndModify: false, useUnifiedTopology: true })
.then(() => console.log("Successfully connected to MongoDB."))
.catch(err => console.error(err.message));

client.on('ready', () => {
    console.log("Bot is online");
});

client.on('message', (message) => {
    // parse the command and args
    if (!message.content.startsWith(PREFIX)) return;
    const [CMD, ...args] = message.content.trim().substring(PREFIX.length).split(/\s+/);
    console.log(CMD);
    console.log(args);

    // check for command validity and execute if valid
    switch (CMD) {
        case COMMANDS.HELP:
            message.reply(HELP_MESSAGE, {code:true});
            break;
        case COMMANDS.CREATE:
            createEvent(message, args);
            break;
        case COMMANDS.SHOW:
            showEvents(message);
            break;
        case COMMANDS.JOIN:
            message.reply("Joined a group (placeholder)");
            break;
        case COMMANDS.LEAVE:
            message.reply("Left a group (placeholder)");
            break;
        case COMMANDS.MENTION:
        case COMMANDS.MENTION_ALT:
            message.reply("Mention event members (placeholder)");
            break;
        default:
            message.reply("Unrecognized command. Please type in '$help' for list of commands.");
    }
})

client.login(process.env.BOT_TOKEN);