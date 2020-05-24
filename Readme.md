# Minecraft Server

This repo contains (some) configuration and functionality added to an instance of the [ScriptServer](/garrettjoecox/scriptserver) library.

I'd been using Wrapper.py for a few years, and decided I wanted something a little "smaller" and more hackable—and in a language I was reasonably familiar with.

ScriptServer basically does two things:

1. Spawns a child process for the `server.jar` file.
2. Sends and receives RCON messages with the running server.

## Setup

You'll need to download the most recent `server.jar` file, [here](https://www.minecraft.net/en-us/download/server/).

### File Structure

This is inherently pretty flexible, but I don't know how much I've properly abstracted, so I'd recommend dropping `server.jar` into a folder at the root level called `bin`. I keep a symlink pointed at the current binary, called `current`, and then use the symlink's path for my `JAR_PATH` value in `.env`.

Next to the `bin` folder, create a `data` directory. This is where the world and other server artifacts/data will be stored. You'll also need to add the path to this directory to `.env`.

If you have an existing `world` directory or a `server.properties`, drop it in this folder!

### Environment + Other Configuration

Here are the default `.env` values (distributed as `.env.example`):

#### `JAR_PATH`

The path to the server JAR, or a *symlink* to it. In the past, I've kept a number of server versions around, and symlinked something like `current` to whatever version I'm working with, so the wrapper configuration doesn't have to change.

#### `RCON_PORT`

This helps bind the wrapper to the RCON server. Make sure to keep this in sync with `server.properties`!

#### `RCON_PASSWORD`

Like the above, used to authorize the wrapper with the server's RCON endpoint.

#### `DATA_PATH`
This should point to the `data` directory you created, above, whatever that was named.

#### `BACKUPS_DIR`

Created when the first backup is created, and culled when the `BACKUPS_KEEP` threshold is reached.

#### `BACKUPS_KEEP`

Maximum number of backups to keep around. Keep in mind that _your oldest backup will only be as old as this number of iterations of the `BACKUPS_SCHEDULE`_—so, if you want, say, a week of hourly updates, this value will have to be pretty large.

Backups are only captured when there are active players. When the last player disconnects, a backup is captured, then the schedule is paused until another player joins.

> Eventually, I'd like to have an "eased" schedule of sorts, or rotate hourly, daily, weekly, and monthly snapshots, a la `automysqlbackup`.

#### `BACKUPS_SCHEDULE`

A [CRON-compatible](https://crontab.guru/) interval that determines when backups are captured, while players are active.

> Paths for the above options are eventually passed to `path.resolve(…)`!

## “Modules”

_ScriptServer_ is extensible via what it calls "modules." We bootstrap a couple of these in `index.js`, after the server object is initialized.

### Backups

The see the config options, above, for capabilities. Backups are only captured while players are active. The schedule determines the interval at which a backup is made—but the server will make one additional backup when it detects the last player has disconnected.

Assuming a `BACKUP_SCHEDULE` of `0 * * * *`, this represents the backup behavior:

```
|     (Idle Time)
|
+---  Player A joins at 2:15PM, starting the `BACKUP_SCHEDULE`
|
+---  A backup is captured at 3:00PM
|
+---  Player B joins at 3:30PM, but has no affect on the already-active schedule.
|
+---  A backup is captured at 4:00PM
|
+---  Player B disconnects at 4:15PM
|
+---  Player A disconnects at 4:20PM, triggering a backup.
|
|     (Idle Time)
```

> Setting a backup schedule that is too frequent may cause one backup to start before the other is finished! Make sure your world size and hardware are suitable for the schedule.

### Clock

Speaks up every (real) half-hour. Good to keep you from squandering the _entire_ day, maybe? 🙃

### Ping

Left in, for testing. Just replies to the sender with `Pong!` when they issue the custom `!pong` command.

## Running the Server

Run `npm run start` to boot up the server.

## To-do

- [ ] “Eased” backup culling
- [ ] ?

🌳
