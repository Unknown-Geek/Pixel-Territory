/**
 * @typedef {Object} Cell
 * @property {string} owner - Reddit username
 * @property {string} color - Hex color code
 * @property {number} timestamp - When this cell was claimed
 * @property {number} power - Power level of this cell
 */

/**
 * @typedef {Object} PlayerData
 * @property {string} color
 * @property {number} cellCount
 * @property {number} lastAction
 */

/**
 * @typedef {Object} GameState
 * @property {Cell[][]} grid
 * @property {Object.<string, PlayerData>} players
 * @property {number} lastReset
 * @property {boolean} gameActive
 */
