const ScriptServer = require('scriptserver');
const path = require('path');

// Pick up environment vars from `.env` file in project root:
require('dotenv').config();

const server = new ScriptServer({
    core: {
        jar: path.resolve(process.env.JAR_PATH),
        args: ['-Xmx8G'],
        rcon: {
            port: process.env.RCON_PORT,
            password: process.env.RCON_PASSWORD
        },
        spawnOpts: {
            cwd: path.resolve('data')
        }
    },
    command: {
        prefix: '!'
    }
});

// First-party modules we depend on:
server.use(require('scriptserver-event'));
server.use(require('scriptserver-util'));
server.use(require('scriptserver-command'));

// Lay in our own modules:
server.use(require('./server-modules/backups'));
server.use(require('./server-modules/clock'));
server.use(require('./server-modules/ping'));

server.start();
