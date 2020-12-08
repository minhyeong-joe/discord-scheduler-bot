const cron = require('node-cron');

const createSchedule = (datetime, callback) => {
    const cronTime = parseTime(datetime);
    console.log(cronTime);
    return cron.schedule(cronTime, callback);
};

const invokeSchedule = scheduleName => {
    scheduleName.start();
}

const removeSchedule = scheduleName => {
    scheduleName.destroy();
}

const parseTime = (datetime) => {
    const sec = datetime.getSeconds();
    const min = datetime.getMinutes();
    const hour = datetime.getHours();
    const dayOfMonth = datetime.getDate();
    const month = datetime.getMonth() + 1;
    const dayOfWeek = datetime.getDay();
    return `${sec} ${min} ${hour} ${dayOfMonth} ${month} ${dayOfWeek}`;
}

module.exports = { createSchedule, invokeSchedule, removeSchedule };