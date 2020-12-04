const event = require('./models/event.js');
const moment = require('moment');
const {
    events
} = require('./models/event.js');

// create and add an event
const createEvent = (message, args) => {
    let time;
    // validate args
    if (args.length < 2) {
        message.reply("❌ Not enough arguments");
        return;
    }
    // datetime regex check and generate utc date object from variants of datetime string
    // fulldate regex: yyyy-(m)m-(d)d (h)h(:(m)m)( )[am|pm]
    const fullDateRegex = /^(19[0-9]{2}|2[0-9]{3})-(0?[1-9]|1[012])-(0?[1-9]|[12][0-9]|30|31) ((0?[0-9])|(1[12]))(:(([1-5][0-9])|(0?[0-9])))? ?[ap]m$/i;
    // time regex: (h)h(:(m)m)( )[am|pm]
    const timeRegex = /^((0?[0-9])|(1[12]))(:(([1-5][0-9])|(0?[0-9])))? ?[ap]m$/i;

    // if user entered full datetime (ex. "2020-12-04 5:00 pm", "2020.12.4 5:00 pm")
    if (fullDateRegex.test(args[1])) {
        console.log("valid full datetime");
        time = moment(args[1], "yyyy-MM-DD hh:mm A").toDate();
    }
    // if user entered time only (ex. "5:00 pm", "11:00 AM", "5pm", "5:00pm")
    else if (timeRegex.test(args[1])) {
        console.log("valid time");
        time = moment(args[1], "hh:mm A").toDate();
    }
    // all other formats, reject
    else {
        message.reply("❌ Invalid time arguments");
        return;
    }

    // if set time is in the past, fail
    if (time < Date.now()) {
        message.reply("❌ Failed to generate event in the past. (check your date&time)");
        return;
    }

    // if optional max_occupancy is passed in, then it must be an integer
    if (args.length > 2 && isNaN(args[2])) {
        message.reply("❌ Invalid max_occupancy argument. It must be an integer");
        return;
    }
    // generate new event
    const newEvent = new event({
        server_id: message.guild.id,
        event_name: args[0],
        members: [message.author.tag],
        time: time,
        max_occupancy: args.length > 2 ? args[2] : null
    });
    // save new event to DB
    (async () => {
        try {
            const res = await newEvent.save();
            message.channel.send(`@everyone **${message.author.tag}** created an event **${res.event_name}** ${res.max_occupancy? '(1/' + res.max_occupancy + ')': ''} - ${moment(res.time).local().format("YYYY-MM-DD ddd h:mm A")} :white_check_mark:`);
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
                name: `${index+1}. ${event.event_name} ${event.max_occupancy? '(' + event.members.length + '/' + event.max_occupancy + ')' : ''}`,
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
        if (events.length === 0) {
            message.reply(`❌ There is no active event.`);
            return;
        }
        // if out of range
        if (eventNum > events.length) {
            message.reply(`❌ Please select between 1 and ${events.length}`);
            return;
        }
        console.log(events);
        const selectedEvent = events[eventNum - 1];
        console.log(selectedEvent);
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
                const updatedEvent = await event.findOneAndUpdate({
                    _id: selectedEvent._id
                }, {
                    members: [...selectedEvent.members, message.author.tag]
                }, {
                    new: true
                });
                console.log(updatedEvent);
                message.channel.send(`**${message.author.tag}** joined **${updatedEvent.event_name}** ${updatedEvent.max_occupancy? '(' + updatedEvent.members.length + '/' + updatedEvent.max_occupancy + ')': ''} - ${moment(updatedEvent.time).local().format("YYYY-MM-DD ddd h:mm A")} :white_check_mark:`);
            } catch (error) {
                console.error(error.message);
                message.reply("❌ Failed to join the event. Please try again later.");
                return;
            }
        })();
    });
};

// leave an event if participating
// const leaveEvent = (message, args) => {
//     if (isNaN(args[0]) || parseInt(args[0]) <= 0) {
//         message.reply("❌ Invalid *event_num* argument");
//         return;
//     }
//     const eventNum = parseInt(args[0]);
// };

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

module.exports = {
    createEvent,
    showEvents,
    joinEvent
};