const dateformat = require('dateformat');
/**
 * Outputs a message to the JS console,
 * 
 * @param {String} text The text to log.
 * @param {String} category The category to use for this message. Output inside [Brackets].
 */
module.exports = function (text, category = 'Default') {
    const time = (new Date).getTime();
    const parts = [
        `[${dateformat(time, 'HH:MM:ss')}]`,
        `[${category}]:`,
        text
    ];

    console.log(parts.join(' '));
};
