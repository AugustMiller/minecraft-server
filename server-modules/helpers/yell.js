/**
 * Sends a message to all players of the specified server, using an optional color.
 * 
 * @param {ScriptServer} toServer The server to use `tellRaw` on.
 * @param {String} message The text to send.
 * @param {String} color A Minecraft-supported color argument.
 */
module.exports = function (toServer, message) {
    return toServer.util.tellRaw(message, '@a');
};
