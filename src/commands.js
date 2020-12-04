const { createEvent, showEvents } = require('./bot.js');

// prefix for bot commands
const PREFIX = "$";

// list of commands and actions
const commands = {
    // $help
    help: {
        alias: "help",
        description: "Show list of available commands.",
        execute: (message) => {
            message.reply(embededHelp);
        }
    },

    // $create <event_name> <time (yyyy.mm.dd hh:mm am/pm)> <max_occupancy:optional>
    create: {
        alias: "create",
        description: "Create an event at specified time.\nEvent name with spaces must be enclosed in double quotes (ie. \"event name with spaces\").\n**Time Format:** 'yyyy.mm.dd hh:mm am/pm' or 'yyyy-mm-dd hh:mm am/pm'",
        execute: createEvent
    },
    
    // $show
    show: {
        alias: "show",
        description: "Shows the list of active events.",
        execute: showEvents
    },

    // $join <event_num>
    join: {
        alias: "join",
        description: "Joins the event associated with *<event_num>* (as shown in list of events).",
    },

    // $leave <event_num>
    leave: {
        alias: "leave",
        description: "Leaves the event associated with *<event_num>* (as shown in list of events)."
    },

    // $mention <event_num> <message:optional> OR $@ <event_num> <message:optional>
    mention: {
        alias: "mention",
        alt: "@",
        description: "Sends message to event members."
    }
};

// help embeded
const embededHelp = {embed: {
    color: 3447003,
    title: "Schduler Bot Commands",
    fields: [
        {
            name: `${PREFIX}${commands.help.alias}`,
            value: commands.help.description
        },
        {
            name: `${PREFIX}${commands.create.alias} *<event_name>* *<time>* *<max_occupancy:optional>*`,
            value: commands.create.description
        },
        {
            name: `${PREFIX}${commands.show.alias}`,
            value: commands.show.description
        },
        {
            name: `${PREFIX}${commands.join.alias} *<event_num>*`,
            value: commands.join.description
        },
        {
            name: `${PREFIX}${commands.leave.alias} *<event_num>*`,
            value: commands.leave.description
        },
        {
            name: `${PREFIX}${commands.mention.alias} *<event_num>* *<message:optional>* \n${PREFIX}${commands.mention.alt} *<event_num>* *<message:optional>*`,
            value: commands.mention.description
        }
    ]
}};


module.exports = { PREFIX, commands };