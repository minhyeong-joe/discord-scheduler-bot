const event = require('./models/event.js');
const moment = require('moment');

const createEvent = (message, args) => {
    let time;
    // validate args
    // date regex: yyyy-(M)M-(D)D or yyyy.(M)M.(D)D
    const dateRegex = /^(19[0-9]{2}|2[0-9]{3})[-.](0?[1-9]|1[012])[-.](0?[1-9]|[12][0-9]|30|31)$/;
    // time regex: (h)h:(m)m
    const timeRegex = /^((0?[0-9])|(1[12]))[:-](([1-5][0-9])|(0?[0-9]))$/;

    if (args.length < 4) {
        message.reply("Not enough arguments (refer to $help)");
        return;
    }
    if (args.length > 5) {
        message.reply("Too many arguments (refer to $help)");
        return;
    }

    if (!dateRegex.test(args[1]) || !timeRegex.test(args[2]) || (args[3].toLowerCase() !== "am" && args[3].toLowerCase() !== "pm")) {
        message.reply("Invalid time arguments (refer to $help)");
        return;
    }
    const timeString = args.slice(1, 4).join(" ");
    try {
        time = new Date(timeString);
    } catch (error) {
        message.reply("Failed to generate time with given time arguments (refer to $help)");
        return;
    }

    if (args.length > 4 && isNaN(args[4])) {
        message.reply("Invalid max_occupancy argument. It must be an integer");
        return;
    }
    // generate new event
    const newEvent = new event({
        event_name: args[0],
        members: [message.author.tag],
        time: time,
        max_occupancy: args.length > 4? args[4] : null
    });
    (async () => {
        try {
            const res = await newEvent.save();
            console.log(res);
            message.reply(`Created an event '${res.event_name}'${res.max_occupancy? '(1/' + res.max_occupancy + ')': ''} - ${moment(res.time).local().format("YYYY-MM-DD ddd h:mm A")}.`);
        } catch (error) {
            console.error(error.message);
            message.reply("Server-side error occurred. Please try again");
        }
    })();
}

module.exports = { createEvent };