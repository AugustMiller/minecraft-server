/**
 * Rolls an n-sided die!
 * 
 * @param {Number} sides Number of sides the die should simulate.
 */
const diceRoll = function (sides) {
    return Math.ceil(Math.random() * sides);
};

module.exports = { diceRoll };
