import { generateUniqueColor } from "./colors";

const GRID_SIZE = 20;

export const createNewGameState = () => {
  const gridSize = 20;
  const grid = [];

  // Initialize an empty grid
  for (let y = 0; y < gridSize; y++) {
    const row = [];
    for (let x = 0; x < gridSize; x++) {
      row.push({
        owner: null,
        color: "#f0f0f0",
        timestamp: null,
      });
    }
    grid.push(row);
  }

  return {
    grid,
    players: {},
    gameActive: true,
    lastReset: Date.now(),
  };
};

export const initializePlayer = (gameState, playerName, color) => {
  const newState = { ...gameState };

  if (!newState.players[playerName]) {
    newState.players[playerName] = {
      color,
      cellCount: 0,
      lastAction: Date.now(),
      tokens: 20, // Start with some tokens
    };
  }

  return newState;
};

export const canClaimCell = (gameState, x, y, playerName) => {
  // Check boundaries
  if (
    x < 0 ||
    y < 0 ||
    x >= gameState.grid[0].length ||
    y >= gameState.grid.length
  ) {
    return false;
  }

  const player = gameState.players[playerName];
  if (!player) return false;

  const cell = gameState.grid[y][x];

  // If it's the player's own cell, they can always update it
  if (cell.owner === playerName) {
    return true;
  }

  // If it's unclaimed
  if (!cell.owner) {
    // First cell can be claimed anywhere
    if (player.cellCount === 0) {
      return true;
    }

    // Check if adjacent to owned cell
    return hasAdjacentOwnedCell(gameState, x, y, playerName);
  }

  // If it's an opponent's cell
  if (cell.owner && cell.owner !== playerName) {
    // Must be adjacent to player's own cell
    if (!hasAdjacentOwnedCell(gameState, x, y, playerName)) {
      return false;
    }

    // Check power levels
    const cellAge = (Date.now() - cell.timestamp) / 60000;
    const defenderPower = Math.min(10, Math.floor(cellAge) + 1);

    const playerTimeSince = (Date.now() - player.lastAction) / 60000;
    const attackerPower = Math.min(10, Math.floor(playerTimeSince) + 1);

    // Attacker must have more power
    return attackerPower > defenderPower;
  }

  return false;
};

export const hasAdjacentOwnedCell = (gameState, x, y, playerName) => {
  const directions = [
    [-1, 0],
    [1, 0],
    [0, -1],
    [0, 1],
  ];

  return directions.some(([dx, dy]) => {
    const nx = x + dx;
    const ny = y + dy;

    // Check boundaries
    if (
      nx < 0 ||
      ny < 0 ||
      nx >= gameState.grid[0].length ||
      ny >= gameState.grid.length
    ) {
      return false;
    }

    return gameState.grid[ny][nx].owner === playerName;
  });
};

export const claimCell = (gameState, x, y, playerName) => {
  if (!canClaimCell(gameState, x, y, playerName)) {
    return gameState;
  }

  const newState = JSON.parse(JSON.stringify(gameState));
  const player = newState.players[playerName];
  const cell = newState.grid[y][x];

  // Deduct tokens for claiming
  player.tokens -= 10;

  // Update player stats
  player.lastAction = Date.now();

  // If this cell was already owned by someone else, decrease their count
  if (cell.owner && cell.owner !== playerName) {
    newState.players[cell.owner].cellCount--;
  }

  // If this is a new cell for this player (not one they already owned)
  if (cell.owner !== playerName) {
    player.cellCount++;
  }

  // Update the cell
  cell.owner = playerName;
  cell.color = player.color;
  cell.timestamp = Date.now();

  return newState;
};

export const addTokens = (gameState, playerName, amount) => {
  if (!gameState.players[playerName]) return gameState;

  const newState = { ...gameState };
  newState.players[playerName] = {
    ...newState.players[playerName],
    tokens: (newState.players[playerName].tokens || 0) + amount,
  };

  return newState;
};
