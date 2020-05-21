const fs = require('fs');
const path = require('path');

const cron = require('node-cron');
const archiver = require('archiver');
const dateformat = require('dateformat');
const filesize = require('filesize');

const sortBy = require('lodash/sortBy');
const take = require('lodash/take');

const yell = require('./helpers/yell');
const log = require('./helpers/log');

const LOGGING_CATEGORY = 'Backups';

/**
 * Backs up world data based on environment config.
 * 
 * @param {ScriptServer} server The server to send notifications to.
 */
const makeBackup = function (server) {
    const timeStart = new Date;

    // Notify server of process start:
    yell(server, 'Starting backup!');

    // Turn off edits:
    server.send('save-off');

    // Flush pending data to disk:
    server.send('save-all');

    const worldDir = path.resolve(`${process.env.DATA_PATH}/world`);
    const backupFilename = `backup-${dateformat(timeStart, 'yyyy-mm-dd_HH-MM-ss')}.zip`;

    // Initialize a ZIP Stream/Target:
    const backupTarget = fs.createWriteStream(`${path.resolve(process.env.BACKUPS_DIR)}/${backupFilename}`);
    const zip = archiver('zip');

    // Attach to `close` event so we can properly exit...
    backupTarget.on('close', function () {
        const timeEnd = new Date;

        yell(server, `Finished backup up ${filesize(zip.pointer())} in ${timeEnd.getTime() - timeStart.getTime()}ms`);

        cullBackups(server);
    });

    // ...and to errors (via archiver), so they can be reported to the server:
    zip.on('error', function (err) {
        yell(server, 'Backup failed!');
    });

    zip.pipe(backupTarget);

    // Stream the world directory to the archive:
    zip.directory(`${worldDir}/`);

    // Tell the archive we're done streaming:
    zip.finalize();

    // No matter what, we want to unlock the world:
    server.send('save-on');
};

/**
 * Trims backups to the latest n, allowed by the environment config.
 * 
 * @param {ScriptServer} server Where notificates are sent.
 */
const cullBackups = function (server) {
    log('Checking for old backups.', LOGGING_CATEGORY);

    const maxBackups = process.env.BACKUPS_KEEP;
    const backupsPath = path.resolve(process.env.BACKUPS_DIR);

    // Assemble data about files in the backups folder:
    const backups = fs.readdirSync(backupsPath).map((b) => {
        const p = `${backupsPath}/${b}`;
        const s = fs.statSync(p);

        return {
            name: b,
            path: p,
            directory: s.isDirectory(),
            created: s.ctime,
            modified: s.mtime,
        };
    });

    // Filter out directories from our backups:
    backups.filter((b) => !b.directory);

    // Bail if we're within the backup limit, and don't need to cull anything:
    if (backups.length <= maxBackups) {
        log('No backups to cull.', LOGGING_CATEGORY);
        yell(server, `Only ${backups.length} of ${maxBackups} are used. No backups will be culled.`);

        return;
    }

    log('Some stale backups require culling.', LOGGING_CATEGORY);

    // Sort backups by date created (ascending, oldest first):
    const toCull = take(sortBy(backups, ['ctime']), backups.length - maxBackups);

    yell(server, `Culling ${toCull.length} backup(s).`);

    toCull.forEach(function (b) {
        fs.unlinkSync(b.path);

        yell(server, `Deleted ${b.name}.`);
    });
};

module.exports = function () {
    const server = this;

    server.on('start', () => {
        log('Scheduling...', LOGGING_CATEGORY);

        cron.schedule(process.env.BACKUPS_SCHEDULE, function () {
            log('Starting scheduled backup.', LOGGING_CATEGORY);
            makeBackup(server);
        });
    });
};
