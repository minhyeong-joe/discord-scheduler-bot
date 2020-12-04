require('dotenv').config();
const discord = require('discord.js');
const {
    parse
} = require('discord-command-parser');
const mongoose = require('mongoose');

const {
    PREFIX,
    commands
} = require('./src/commands.js');

const client = new discord.Client();

// db connection
mongoose.connect(process.env.DB_URL, {
    useNewUrlParser: true,
    useFindAndModify: false,
    useUnifiedTopology: true
})
    .then(() => console.log("Successfully connected to MongoDB."))
    .catch(err => console.error(err.message));

client.on('ready', () => {
    console.log("Bot is online");
});

client.on('message', (message) => {
    const parsed = parse(message, PREFIX);
    if (!parsed.success) return;
    // console.log(parsed.command);
    // console.log(parsed.arguments);
    // console.log(parsed.body);

    // check for command validity and execute if valid
    const { help, create, show, join, leave, mention, remove } = commands;
    switch (parsed.command) {
        case help.alias:
            help.execute(message);
            break;
        case create.alias:
            create.execute(message, parsed.arguments);
            break;
        case show.alias:
            show.execute(message);
            break;
        case join.alias:
            join.execute(message, parsed.arguments);
            break;
        case leave.alias:
            leave.execute(message, parsed.arguments);
            break;
        case mention.alias:
        case mention.alt:
            message.reply("Mention event members (placeholder)");
            break;
        case remove.alias:
            remove.execute(message, parsed.arguments);
            break;
        default:
            message.reply(`Unrecognized command. Please type in '${PREFIX}${help.alias}' for list of commands.`);
    }
});

client.login(process.env.BOT_TOKEN);