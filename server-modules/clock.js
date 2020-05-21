const cron = require('node-cron');
const dateformat = require('dateformat');

const yell = require('./helpers/yell');
const log = require('./helpers/log');

const LOGGING_CATEGORY = 'Clock';

module.exports = function () {
    const server = this;

    log('Starting clock...', LOGGING_CATEGORY);

    cron.schedule('0,30 * * * *', function () {
        yell(server, `Hey, just letting you know that it's now ${dateformat(new Date, 'hh:MMtt')}!`);
    });
};
