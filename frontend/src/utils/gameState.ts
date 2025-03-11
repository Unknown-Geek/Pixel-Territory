import { generateUniqueColor } from "./colors";
import {
  hasActiveShield,
  isPowerupAt,
  getPowerupAt,
  collectPowerup,
} from "./powerupUtils";

/**
 * Create a new empty game state
 * @returns {Object} A fresh game state object
 */
export const createNewGameState = () => {
  const grid = createEmptyGrid(20, 20);

  return {
    grid,
    players: {},
    lastReset: Date.now(),
    gameActive: true,
    alliances: {},
    allianceInvites: [],
    powerups: [],
  };
};

/**
 * Create an empty grid of specified dimensions
 * @param {number} width Grid width
 * @param {number} height Grid height
 * @returns {Array} 2D array of empty cells
 */
export const createEmptyGrid = (width, height) => {
  const grid = [];

  for (let y = 0; y < height; y++) {
    const row = [];
    for (let x = 0; x < width; x++) {
      row.push({
        owner: null,
        color: null,
        timestamp: null,
        power: 0,
      });
    }
    grid.push(row);
  }

  return grid;
};

/**
 * Initialize a new player in the game state
 * @param {Object} gameState Current game state
 * @param {string} playerName Player's unique name
 * @param {string} color Player's color (generated if not provided)
 * @returns {Object} Updated game state with new player
 */
export const initializePlayer = (gameState, playerName, color = null) => {
  if (!gameState || !playerName) return gameState;

  // Create a copy of the game state
  const updatedState = { ...gameState };

  // Don't reinitialize if player exists
  if (updatedState.players[playerName]) return updatedState;

  // Generate color if not provided
  const playerColor =
    color ||
    generateUniqueColor(
      Object.values(updatedState.players).map((p) => p.color)
    );

  // Add player to state
  updatedState.players[playerName] = {
    color: playerColor,
    cellCount: 0,
    lastAction: Date.now(),
    tokens: 20, // Start with tokens
    powerups: [], // No powerups yet
    captures: 0,
    losses: 0,
  };

  return updatedState;
};

/**
 * Check if a cell can be claimed by a player
 * @param {Object} gameState Current game state
 * @param {number} x X coordinate of cell
 * @param {number} y Y coordinate of cell
 * @param {string} playerName Player attempting to claim
 * @returns {boolean} Whether the claim is valid
 */
export const canClaimCell = (gameState, x, y, playerName) => {
  if (!gameState || !gameState.grid || !playerName) return false;

  // Validate coordinates
  if (
    x < 0 ||
    y < 0 ||
    y >= gameState.grid.length ||
    x >= gameState.grid[0].length
  ) {
    return false;
  }

  const targetCell = gameState.grid[y][x];
  const player = gameState.players[playerName];

  // First claim for this player (can pick any unclaimed cell)
  const playerCells = countPlayerCells(gameState, playerName);
  if (playerCells === 0 && !targetCell.owner) {
    return true;
  }

  // Check if player has the required tokens
  if (!player || player.tokens < 10) {
    return false;
  }

  // If cell already belongs to player, no need to claim
  if (targetCell.owner === playerName) {
    return false;
  }

  // Check if cell is adjacent to player's territory
  if (!isAdjacentToPlayer(gameState, x, y, playerName)) {
    return false;
  }

  // Check power levels for claiming enemy territory
  if (targetCell.owner) {
    const playerTimeSince = Math.floor(
      (Date.now() - player.lastAction) / 60000
    );
    const attackerPower = Math.min(10, playerTimeSince + 1);

    const cellAge = Math.floor((Date.now() - targetCell.timestamp) / 60000);
    const defenderPower = Math.min(10, cellAge + 1);

    // Attacker needs more power
    if (attackerPower <= defenderPower) {
      return false;
    }

    // Check if cell is owned by an ally
    if (isAlly(gameState, playerName, targetCell.owner)) {
      return false;
    }

    // Check if cell has an active shield
    if (targetCell.shielded && targetCell.shieldExpires > Date.now()) {
      return false;
    }
  }

  return true;
};

/**
 * Check if a cell is adjacent to any of a player's territories
 * @param {Object} gameState Current game state
 * @param {number} x X coordinate
 * @param {number} y Y coordinate
 * @param {string} playerName Player name
 * @returns {boolean} Whether the cell is adjacent
 */
export const isAdjacentToPlayer = (gameState, x, y, playerName) => {
  if (!gameState || !gameState.grid || !playerName) return false;

  // Check all 4 adjacent cells
  const adjacentCoords = [
    [x - 1, y],
    [x + 1, y],
    [x, y - 1],
    [x, y + 1],
  ];

  for (const [adjX, adjY] of adjacentCoords) {
    // Bounds checking
    if (
      adjX < 0 ||
      adjY < 0 ||
      adjY >= gameState.grid.length ||
      adjX >= gameState.grid[0].length
    ) {
      continue;
    }

    // Check if this adjacent cell belongs to the player
    if (gameState.grid[adjY][adjX].owner === playerName) {
      return true;
    }
  }

  return false;
};

/**
 * Get all adjacent cells for a given cell
 * @param {Object} gameState Current game state
 * @param {number} x X coordinate
 * @param {number} y Y coordinate
 * @param {string} playerName Current player name
 * @returns {Array} Array of valid adjacent cell coordinates
 */
export const getAdjacentCells = (gameState, x, y, playerName) => {
  if (!gameState || !gameState.grid || !playerName) return [];

  const directions = [
    { dx: -1, dy: 0 }, // Left
    { dx: 1, dy: 0 }, // Right
    { dx: 0, dy: -1 }, // Up
    { dx: 0, dy: 1 }, // Down
  ];

  const adjacentCells = [];

  for (const { dx, dy } of directions) {
    const newX = x + dx;
    const newY = y + dy;

    // Check bounds
    if (
      newX >= 0 &&
      newX < gameState.grid[0].length &&
      newY >= 0 &&
      newY < gameState.grid.length
    ) {
      adjacentCells.push({ x: newX, y: newY });
    }
  }

  return adjacentCells;
};

/**
 * Count how many cells a player owns
 * @param {Object} gameState Current game state
 * @param {string} playerName Player name
 * @returns {number} Cell count
 */
export const countPlayerCells = (gameState, playerName) => {
  if (!gameState || !gameState.grid || !playerName) return 0;

  let count = 0;

  for (const row of gameState.grid) {
    for (const cell of row) {
      if (cell.owner === playerName) {
        count++;
      }
    }
  }

  return count;
};

/**
 * Claims a cell for a player
 * @param {Object} gameState Current game state
 * @param {number} x X coordinate of the cell
 * @param {number} y Y coordinate of the cell
 * @param {string} playerName Player name
 * @param {number} tokenCost Token cost for claiming (default: 10)
 * @returns {Object} Updated game state
 */
export const claimCell = (gameState, x, y, playerName, tokenCost = 10) => {
  // Deep clone the game state to avoid mutation
  const newState = JSON.parse(JSON.stringify(gameState));

  // Ensure player exists
  if (!newState.players[playerName]) {
    return newState;
  }

  // Ensure player has enough tokens
  if (newState.players[playerName].tokens < tokenCost) {
    return newState; // Return unchanged state if not enough tokens
  }

  // Deduct tokens from player
  newState.players[playerName].tokens -= tokenCost;

  // Update the cell
  newState.grid[y][x] = {
    owner: playerName,
    color: newState.players[playerName].color,
    timestamp: Date.now(),
  };

  // Update player's stats
  newState.players[playerName].cellCount =
    (newState.players[playerName].cellCount || 0) + 1;
  newState.players[playerName].lastAction = Date.now();

  // If this was a capture from another player, increment captures count
  if (gameState.grid[y][x].owner && gameState.grid[y][x].owner !== playerName) {
    newState.players[playerName].captures =
      (newState.players[playerName].captures || 0) + 1;

    // Update previous owner's stats
    const previousOwner = gameState.grid[y][x].owner;
    if (newState.players[previousOwner]) {
      newState.players[previousOwner].cellCount = Math.max(
        0,
        (newState.players[previousOwner].cellCount || 0) - 1
      );
    }
  }

  return newState;
};

/**
 * Check if two players are allies
 * @param {Object} gameState Current game state
 * @param {string} player1 First player name
 * @param {string} player2 Second player name
 * @returns {boolean} Whether players are allied
 */
export const isAlly = (gameState, player1, player2) => {
  if (!gameState || !gameState.alliances || !player1 || !player2) {
    return false;
  }

  // Players are not allies with themselves
  if (player1 === player2) return false;

  // Check all alliances
  for (const alliance of Object.values(gameState.alliances)) {
    if (
      alliance.members.includes(player1) &&
      alliance.members.includes(player2)
    ) {
      return true;
    }
  }

  return false;
};

/**
 * Add tokens to a player
 * @param {Object} gameState Current game state
 * @param {string} playerName Player's name
 * @param {number} amount Amount of tokens to add
 * @returns {Object} Updated game state
 */
export const addTokens = (gameState, playerName, amount) => {
  if (!gameState || !playerName || !gameState.players[playerName]) {
    return gameState;
  }

  // Create a deep copy of the game state
  const updatedState = JSON.parse(JSON.stringify(gameState));

  // Add tokens
  updatedState.players[playerName].tokens =
    (updatedState.players[playerName].tokens || 0) + amount;

  return updatedState;
};

/**
 * Get the total alliance score
 * @param {Object} gameState Current game state
 * @param {string} allianceId Alliance ID
 * @returns {number} Combined cell count
 */
export const getAllianceScore = (gameState, allianceId) => {
  if (!gameState || !gameState.alliances || !gameState.alliances[allianceId]) {
    return 0;
  }

  const alliance = gameState.alliances[allianceId];
  let totalCells = 0;

  for (const member of alliance.members) {
    if (gameState.players[member]) {
      totalCells += gameState.players[member].cellCount || 0;
    }
  }

  return totalCells;
};

export default {
  createNewGameState,
  initializePlayer,
  canClaimCell,
  claimCell,
  isAlly,
  addTokens,
  getAllianceScore,
};
