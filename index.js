require('dotenv').config();
const discord = require('discord.js');
const mongoose = require('mongoose');

const { PREFIX, commands } = require('./src/commands.js');

const client = new discord.Client();

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
    const { help, create, show, join, leave, mention } = commands;
    switch (CMD) {
        case help.alias:
            help.execute(message);
            break;
        case create.alias:
            create.execute(message, args);
            break;
        case show.alias:
            show.execute(message);
            break;
        case join.alias:
            message.reply("Joined a group (placeholder)");
            break;
        case leave.alias:
            message.reply("Left a group (placeholder)");
            break;
        case mention.alias:
        case mention.alt:
            message.reply("Mention event members (placeholder)");
            break;
        default:
            message.reply(`Unrecognized command. Please type in '${PREFIX}${help.alias}' for list of commands.`);
    }
})

client.login(process.env.BOT_TOKEN);