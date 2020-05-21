const yell = require('./helpers/yell');
const log = require('./helpers/log');

const LOGGING_CATEGORY = 'Ping';

module.exports = function () {
    const server = this;

    log('Server will pong any pings...', LOGGING_CATEGORY);

    server.command('ping', (e) => {
        const args = e.args;
        const color = args[0] || 'blue';
        const sender = e.player;

        server.util.tellRaw(`Pong!`, sender);
    });
};
