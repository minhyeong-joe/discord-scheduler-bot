const moment = require('moment');

const event = require('./models/event.js');
const { createSchedule } = require('./scheduler.js');

// notification time constants
const REMINDER_MINUTES = 15;       // remind certain minutes before event time
const MS_PER_MINUTE = 60_000;      // Microseconds in a minute (for easier datetime calculation)

// createEvent invalid types (enum)
const INVALID_TYPE = {
    NOT_ENOUGH_ARGS: -1,
    MAX_OCCUPANCY: -2
};

// reminder reference by eventID
let reminders = {};

// eventStart reference by eventID
let eventStarts = {};

// create and add an event
const createEvent = (message, args) => {
    // validate arguments
    switch (validateCreateEvent(args)) {
        case INVALID_TYPE.NOT_ENOUGH_ARGS:
            message.reply("❌ Not enough arguments.");
            return;
        case INVALID_TYPE.MAX_OCCUPANCY:
            message.reply("❌ Invalid max_occupancy argument. It must be a valid number.");
            return;
    }

    // parse datetime input to datetime object
    const time = parseTime(args[1]);
    // validate time (time is null if not valid format)
    if (!time) {
        message.reply("❌ Invalid date,time format.");
        return;
    }
    // if set time is in the past, fail
    if (time < Date.now()) {
        message.reply("❌ Failed to generate future event in the past. (check your date, time)");
        return;
    }
    // generate new event
    const newEvent = new event({
        server_id: message.guild.id,
        event_name: args[0],
        members: [message.author.tag],
        members_id: [message.author.id],
        time: time,
        max_occupancy: args.length > 2 ? args[2] : null
    });
    // save new event to DB
    (async () => {
        try {
            const res = await newEvent.save();
            message.channel.send(`@everyone **${message.author.tag}** created an event **${res.event_name}** ${res.max_occupancy ? '(1/' + res.max_occupancy + ')' : ''} - ${moment(res.time).local().format("YYYY-MM-DD ddd h:mm A")} :white_check_mark:`);
            // set up reminders
            reminders[res._id] = createSchedule(new Date(time - REMINDER_MINUTES * MS_PER_MINUTE), () => remind(message, res._id));
            eventStarts[res._id] = createSchedule(time, () => eventStart(message, res._id));
        } catch (error) {
            console.error(error.message);
            message.reply("❌ Server-side error occurred. Please try again");
        }
    })();
}

// show list of active events
const showEvents = (message) => {
    // fetch events from DB
    fetchEvents(message.guild.id, (events) => {
        // generate list view with returned events
        const eventFields = events.map((event, index) => {
            const members = event.members.join(", ");
            return {
                name: `${index + 1}. ${event.event_name} ${event.max_occupancy ? '(' + event.members.length + '/' + event.max_occupancy + ')' : ''}`,
                value: `${moment(event.time).local().format("YYYY-MM-DD ddd h:mm A")}\n**Participants: **${members}`
            }
        });
        message.channel.send({
            embed: {
                color: 3447003,
                title: ":notepad_spiral: **List of Events**",
                fields: eventFields
            }
        });
    });
}

// join existing event if max_occupancy is not met
const joinEvent = (message, args) => {
    if (isNaN(args[0]) || parseInt(args[0]) <= 0) {
        message.reply("❌ Invalid *event_num* argument");
        return;
    }
    const eventNum = parseInt(args[0]);
    // fetch all server events
    fetchEvents(message.guild.id, (events) => {
        const selectedEvent = events[eventNum - 1];
        if (!selectedEvent) {
            message.reply("❌ Given event number does not exist.");
            return;
        }
        // check for duplicate join
        // if (selectedEvent.members.includes(message.author.tag)) {
        //     message.reply("❌ You are already in the selected event.");
        //     return;
        // }
        // check for max_occupancy
        if (selectedEvent.max_occupancy && selectedEvent.members.length >= selectedEvent.max_occupancy) {
            message.reply(":slight_frown: The selected event is already full.");
            return;
        }
        // add to the members
        (async () => {
            try {
                const updatedEvent = await event.findByIdAndUpdate(selectedEvent._id, { members: [...selectedEvent.members, message.author.tag], members_id: [...selectedEvent.members_id, message.author.id] }, { new: true });
                message.channel.send(`**${message.author.tag}** joined **${updatedEvent.event_name}** ${updatedEvent.max_occupancy ? '(' + updatedEvent.members.length + '/' + updatedEvent.max_occupancy + ')' : ''} - ${moment(updatedEvent.time).local().format("YYYY-MM-DD ddd h:mm A")} :white_check_mark:`);
            } catch (error) {
                console.error(error.message);
                message.reply("❌ Failed to join the event. Please try again later.");
                return;
            }
        })();
    });
};

// leave an event if participating
const leaveEvent = (message, args) => {
    if (isNaN(args[0]) || parseInt(args[0]) <= 0) {
        message.reply("❌ Invalid *event_num* argument");
        return;
    }
    const eventNum = parseInt(args[0]);
    // fetch all server events
    fetchEvents(message.guild.id, (events) => {
        const selectedEvent = events[eventNum - 1];
        if (!selectedEvent) {
            message.reply("❌ Given event number does not exist.");
            return;
        }
        // check if you are one of the members
        if (!selectedEvent.members.includes(message.author.tag)) {
            message.reply("❌ You are not a member in the given event.");
            return;
        }
        // remove member from event and update
        (async () => {
            try {
                const updatedEvent = await event.findByIdAndUpdate(selectedEvent._id, { members: selectedEvent.members.filter(member => member !== message.author.tag), members_id: selectedEvent.members_id.filter(id => id !== message.author.id) }, { new: true });
                message.channel.send(`**${message.author.tag}** left **${updatedEvent.event_name}** ${updatedEvent.max_occupancy ? '(' + updatedEvent.members.length + '/' + updatedEvent.max_occupancy + ')' : ''} - ${moment(updatedEvent.time).local().format("YYYY-MM-DD ddd h:mm A")} :white_check_mark:`);
                // if event becomes empty after last member leaves, disband the event
                if (updatedEvent.members.length < 1) {
                    try {
                        const deletedEvent = await event.findByIdAndDelete(updatedEvent._id);
                        message.channel.send(`**${deletedEvent.event_name}** (${moment(deletedEvent.time).local().format("YYYY-MM-DD ddd h:mm A")}) has been removed :poop:`);
                    } finally { }
                }
            } catch (error) {
                console.error(error.message);
                message.reply("❌ Server-side error occurred. Please try again");
            }
        })();
    });
};

// delete an event
const deleteEvent = (message, args) => {
    const adminRole = message.guild.roles.cache.find(r => r.name === 'Schedule Admin');
    // "Schedule Admin" does not exist in the server
    if (!adminRole) {
        message.channel.send(":warning: Please create a role named 'Schedule Admin' first.");
        return;
    }
    // check if user has "Schedule Admin" role
    if (!message.member._roles.includes(adminRole.id)) {
        message.channel.send("❌ You do not have permission.");
        return;
    }
    // validate argument
    if (isNaN(args[0]) || parseInt(args[0]) <= 0) {
        message.reply("❌ Invalid *event_num* argument");
        return;
    }
    const eventNum = parseInt(args[0]);
    // fetch all events
    fetchEvents(message.guild.id, (events) => {
        const selectedEvent = events[eventNum - 1];
        if (!selectedEvent) {
            message.reply("❌ Given event number does not exist.");
            return;
        }
        (async () => {
            try {
                const deletedEvent = await event.findByIdAndDelete(selectedEvent._id);
                message.channel.send(`**${deletedEvent.event_name}** (${moment(deletedEvent.time).local().format("YYYY-MM-DD ddd h:mm A")}) has been removed :poop:`);
            } catch (error) {
                console.error(error.message);
                message.reply("❌ Server-side error occurred. Please try again");
            }
        })();
    });
};

// mention all members in the selected event
// args[0]: event_num
// args[1:]: message (join them all as single message)
const mentionMembers = (message, args) => {
    const eventNum = parseInt(args[0]);
    if (isNaN(eventNum) || eventNum <= 0) {
        message.reply("❌ Invalid *event_num* argument");
        return;
    }
    const DEFAULT_MENTION = "Assemble!";
    const msg = args.length > 1 ? args.slice(1, args.length).join(" ") : DEFAULT_MENTION;
    // fetch server events
    fetchEvents(message.guild.id, (events) => {
        const selectedEvent = events[eventNum - 1];
        if (!selectedEvent) {
            message.reply("❌ Given event number does not exist.");
            return;
        }
        // create mention string (excluding self)
        const mentions = selectedEvent.members_id.filter(id => id !== message.author.id).map(id => {
            return '<@'.concat(id).concat('>');
        }).join(" ");
        message.channel.send(`**${selectedEvent.event_name}** (${moment(selectedEvent.time).local().format("YYYY-MM-DD ddd h:mm A")})\n${mentions}, ${msg}`);
    });
}

// validate createEvent() arguments
const validateCreateEvent = (args) => {
    if (args.length < 2) {
        return INVALID_TYPE.NOT_ENOUGH_ARGS;
    }
    if (args.length > 2 && isNaN(args[2])) {
        return INVALID_TYPE.MAX_OCCUPANCY;
    }
    return;
};

// parse datetime input to datetime object
const parseTime = (rawTime) => {
    // datetime regex check and generate utc date object from variants of datetime string
    // fulldate regex: yyyy-(m)m-(d)d (h)h(:(m)m)( )[am|pm]
    const fullDateRegex = /^(19[0-9]{2}|2[0-9]{3})-(0?[1-9]|1[012])-(0?[1-9]|[12][0-9]|30|31) ((0?[0-9])|(1[12]))(:(([1-5][0-9])|(0?[0-9])))? ?[ap]m$/i;
    // time regex: (h)h(:(m)m)( )[am|pm]
    const timeRegex = /^((0?[0-9])|(1[12]))(:(([1-5][0-9])|(0?[0-9])))? ?[ap]m$/i;

    // if user entered full datetime (ex. "2020-12-04 5:00 pm", "2020.12.4 5:00 pm")
    if (fullDateRegex.test(rawTime)) {
        return moment(rawTime, "yyyy-MM-DD hh:mm A").toDate();
    }
    // if user entered time only (ex. "5:00 pm", "11:00 AM", "5pm", "5:00pm")
    if (timeRegex.test(rawTime)) {
        return moment(rawTime, "hh:mm A").toDate();
    }
    // all other formats, reject
    return null;
}

// fetch all server events
const fetchEvents = async (serverId, callback) => {
    try {
        const events = await event.find({
            server_id: serverId
        });
        callback(events);
    } catch (error) {
        console.error(error.message);
        message.reply("❌ Server-side error occurred. Please try again");
    }
};

const remind = async (message, eventId) => {
    // fetch the member IDs in the event
    const selectedEvent = await event.findById(eventId);
    const mentions = selectedEvent.members_id.map(id => {
        return '<@'.concat(id).concat('>');
    }).join(" ");
    message.channel.send(`${mentions}\nEVENT REMINDER: It is ${REMINDER_MINUTES} minutes prior to the event **${selectedEvent.event_name}**.`);
}

const eventStart = async (message, eventId) => {
    // fetch the member IDs in the event
    const selectedEvent = await event.findById(eventId);
    const mentions = selectedEvent.members_id.map(id => {
        return '<@'.concat(id).concat('>');
    }).join(" ");
    message.channel.send(`${mentions}\nIt is time for the event **${selectedEvent.event_name}** to start.`);
    // remove event from list
    (async () => {
        try {
            await event.findByIdAndDelete(selectedEvent._id);
        } catch (error) {
            console.error(error.message);
            message.reply("❌ Server-side error occurred. Please manually remove the event.");
        }
    })();
}

module.exports = {
    createEvent,
    showEvents,
    joinEvent,
    leaveEvent,
    deleteEvent,
    mentionMembers
};