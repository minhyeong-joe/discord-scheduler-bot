const event = require('./models/event.js');
const moment = require('moment');

const createEvent = (message, args) => {
    let time;
    // handle event name with spaces
    if (args[0].startsWith('"')) {
        const endIndex = args.findIndex(arg => arg.endsWith('"'));
        if (endIndex > 0) {
            args[0] = args[0].slice(1, args[0].length);
            args[endIndex] = args[endIndex].slice(0, args[endIndex].length-1);
            const nameWithSpaces = args.slice(0, endIndex+1).join(" ");
            args = args.slice(endIndex+1, args.length);
            args = [nameWithSpaces, ...args];
        } 
    }
    // validate args
    // date regex: yyyy-(M)M-(D)D or yyyy.(M)M.(D)D
    const dateRegex = /^(19[0-9]{2}|2[0-9]{3})[-.](0?[1-9]|1[012])[-.](0?[1-9]|[12][0-9]|30|31)$/;
    // time regex: (h)h:(m)m
    const timeRegex = /^((0?[0-9])|(1[12]))[:-](([1-5][0-9])|(0?[0-9]))$/;

    if (args.length < 4) {
        message.reply(":x: Not enough arguments");
        return;
    }
    if (args.length > 5) {
        message.reply(":x: Too many arguments");
        return;
    }

    if (!dateRegex.test(args[1]) || !timeRegex.test(args[2]) || (args[3].toLowerCase() !== "am" && args[3].toLowerCase() !== "pm")) {
        message.reply(":x: Invalid time arguments");
        return;
    }
    const timeString = args.slice(1, 4).join(" ");
    try {
        time = new Date(timeString);
    } catch (error) {
        message.reply(":x: Failed to generate time with given time arguments");
        return;
    }
    // if set time is in the past, fail
    if (time < Date.now()) {
        message.reply(":x: Failed to generate event in the past. (check your date&time)");
        return;
    }

    if (args.length > 4 && isNaN(args[4])) {
        message.reply(":x: Invalid max_occupancy argument. It must be an integer");
        return;
    }
    // generate new event
    const newEvent = new event({
        server_id: message.guild.id,
        event_name: args[0],
        members: [message.author.tag],
        time: time,
        max_occupancy: args.length > 4? args[4] : null
    });
    // save new event to DB
    (async () => {
        try {
            const res = await newEvent.save();
            message.reply(`:white_check_mark: Created an event **${res.event_name}** ${res.max_occupancy? '(1/' + res.max_occupancy + ')': ''} - ${moment(res.time).local().format("YYYY-MM-DD ddd h:mm A")}.`);
        } catch (error) {
            console.error(error.message);
            message.reply(":x: Server-side error occurred. Please try again");
        }
    })();
}

const showEvents = (message) => {
    // fetch events from DB
    (async () => {
        try {
            const events = await event.find({server_id: message.guild.id});
            const eventFields = events.map((event, index) => {
                const members = event.members.join(", ");
                return {
                    name: `${index+1}. ${event.event_name} ${event.max_occupancy? '(' + event.members.length + '/' + event.max_occupancy + ')' : ''}`,
                    value: `${moment(event.time).local().format("YYYY-MM-DD ddd h:mm A")}\n**Participants: **${members}`
                }
            });
            message.channel.send({embed: {
                color: 3447003,
                title: ":notepad_spiral: **List of Events**",
                fields: eventFields,
                timestamp: new Date()
            }});
        } catch (error) {
            console.error(error.message);
            message.reply(":x: Server-side error occurred. Please try again");
        }
    })();
}

module.exports = { createEvent, showEvents };