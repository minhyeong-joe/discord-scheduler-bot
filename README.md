# <img src="./asset/discord_icon.png" height="100" width="100" align="center"> Discord Scheduler Bot

A Discord bot that allows members to create/join game (or any) events.

The Scheduler bot will automatically remind the participants 15 minutes before and at the time of event.

*Unfortunately, the timezone is set to Pacific time (Los Angeles, US) at the moment.*

### Use cases:
- Host a game and notify other players to join
- Schedule a party raid that has fixed time and fixed max occupancy (first come, first serve)
- Easily create a squad to play together

---
## Discord Integration

**Client ID**: 784163905231650847

1. simply go to:
[https://discord.com/oauth2/authorize?client_id=784163905231650847&scope=bot](https://discord.com/oauth2/authorize?client_id=784163905231650847&scope=bot)

2. log in with your Discord account

3. Add the bot to the server in which you have permission to do so.

4. *(Optional)* Some features are available only to a specific role `"Schedule Admin"`. Create the role with exact name and assign it.

---
## Commands

```
$help
    - Show list of available commands.
$create <event_name> <time> <max_occupancy:optional>
    - Create an event at specified time.
    - Event name and Datetime with spaces must be enclosed in double quotes (ie. "event name with spaces").
    - Valid Time Formats: "yyyy-mm-dd hh:mm am/pm", "hh:mm am/pm", "hhAM/PM".
    - Examples: "2020-12-5 7:00 PM", "2020-12-5 7pm", 7pm, "7:00 PM" (default to TODAY if no date provided)
$show
    - Shows the list of active events.
$join <event_num>
    - Joins the event associated with <event_num> (as shown in list of events).
$leave <event_num>
    - Leaves the event associated with <event_num> (as shown in list of events).
$mention <event_num> <message:optional> 
$@ <event_num> <message:optional>
    - Sends message to event members.
$remove <event_num>
    - (Schedule Admin only) Removes an event associated with <event_num> (as shown in list of events).
```
---
## Misc

- The event is automatically deleted once all members leave the event.
- By default, the bot will mention all event members **15** minutes prior to the event.
- At the exact time of event, the bot will remind all event members and automatically delete the event from the list.
- A member cannot join an event if 1) event has reach max occupancy OR 2) he/she is already in the event.

