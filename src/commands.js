// list of commands constants
const COMMANDS = {
    // $help
    // see all available commands and how to use them
    HELP: "help",

    // $create <event_name> <time (yyyy.mm.dd hh:mm am/pm)> <max_occupancy:optional>
    // create a new event group and add to list of events
    CREATE: "create",
    
    // $show
    // show all active event groups (list of events)
    SHOW: "show",

    // $join <event_num>
    // joins the event with event_num if max occupancy is not met
    JOIN: "join",

    // $leave <event_num>
    // leaves the event with event_num
    LEAVE: "leave",

    // $mention <event_num> <message:optional> OR $@ <event_num> <message:optional>
    // mention everyone in that event and send message to them (ie. call for assemble late members)
    MENTION: "mention",
    MENTION_ALT: "@",
};

const HELP_MESSAGE = `Available Commands: \n$${COMMANDS.CREATE} <event_name> <time> <max_occupancy:optional> - create an event at specified time \n\t<time> format: 'yyyy.mm.dd hh:mm am/pm' or 'yyyy-mm-dd hh:mm am/pm' \n$${COMMANDS.SHOW} - shows the list of active events. \n$${COMMANDS.JOIN} <event_num> - joins the event associated with <event_num> (as shown in list of events). \n$${COMMANDS.LEAVE} <event_num> - leaves the event associated with <event_num> (as shown in list of events). \n$${COMMANDS.MENTION} OR $${COMMANDS.MENTION_ALT} <event_num> <message:optional> - sends message to event members.`

module.exports = { COMMANDS, HELP_MESSAGE };