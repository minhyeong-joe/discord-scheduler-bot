const {
    createEvent,
    showEvents,
    joinEvent,
    leaveEvent,
    deleteEvent,
    mentionMembers
} = require('./bot.js');

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
        description: 'Create an event at specified time.\nEvent name with spaces must be enclosed in double quotes (ie. "event name with spaces").\n**Valid Time Formats:** "yyyy-mm-dd hh:mm am/pm", "hh:mm am/pm", "hhAM/PM".\n**Examples:** "2020-12-5 7:00 PM", "2020-12-5 7pm", "7pm", "7:00 PM" (*default to TODAY if no date provided*) ',
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
        execute: joinEvent
    },

    // $leave <event_num>
    leave: {
        alias: "leave",
        description: "Leaves the event associated with *<event_num>* (as shown in list of events).",
        execute: leaveEvent
    },

    // $remove <event_num>
    remove: {
        alias: "remove",
        description: "(**Schedule Admin** only) Removes an event associated with *<event_num>* (as shown in list of events).",
        execute: deleteEvent
    },

    // $mention <event_num> <message:optional> OR $@ <event_num> <message:optional>
    mention: {
        alias: "mention",
        alt: "@",
        description: "Sends message to event members.",
        execute: mentionMembers
    }
};

// help embeded
const embededHelp = {
    embed: {
        color: 3447003,
        title: "Schduler Bot Documentation",
        url: 'https://github.com/minhyeong-joe/discord-scheduler-bot',
        fields: [{
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
        },
        {
            name: `${PREFIX}${commands.remove.alias} *<event_num>*`,
            value: commands.remove.description
        }
        ]
    }
};


module.exports = {
    PREFIX,
    commands
};