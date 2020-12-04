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


module.exports = COMMANDS;