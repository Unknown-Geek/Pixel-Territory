/**
 * @typedef {Object} Cell
 * @property {string} owner - Reddit username
 * @property {string} color - Hex color code
 * @property {number} timestamp - When this cell was claimed
 * @property {number} power - Current power level of this cell
 */

/**
 * @typedef {Object} PlayerData
 * @property {string} color - Player's territory color
 * @property {number} cellCount - Number of cells owned
 * @property {number} lastAction - Timestamp of last action
 * @property {number} tokens - Current token count
 */

/**
 * @typedef {Object} GameState
 * @property {Cell[][]} grid
 * @property {Object.<string, PlayerData>} players
 * @property {number} lastReset
 * @property {boolean} gameActive
 */
