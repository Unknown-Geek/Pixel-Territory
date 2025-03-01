import { generateUniqueColor } from "./colors";

const GRID_SIZE = 20;

export const createNewGameState = () => ({
  grid: Array(20)
    .fill(null)
    .map(() =>
      Array(20)
        .fill(null)
        .map(() => ({ owner: null, color: "#e5e5e5" }))
    ),
  players: {},
  gameActive: true,
  dailyStats: [], // Store daily statistics
  currentDay: new Date().toISOString().split("T")[0],
});

export const initializePlayer = (gameState, playerName, color) => {
  const newState = { ...gameState };
  newState.players[playerName] = {
    color,
    cellCount: 0,
    tokens: 20, // Starting tokens
    lastAction: Date.now(),
  };
  return newState;
};

export const canClaimCell = (gameState, x, y, playerName) => {
  // Check if player has enough tokens
  if (gameState.players[playerName].tokens < 10) return false;

  // Don't allow claiming already owned cells
  if (gameState.grid[y][x].owner) return false;

  // First move can be anywhere
  const playerCells = countPlayerCells(gameState, playerName);
  if (playerCells === 0) return true;

  // Check all adjacent cells (including diagonals)
  for (let dy = -1; dy <= 1; dy++) {
    for (let dx = -1; dx <= 1; dx++) {
      if (dx === 0 && dy === 0) continue; // Skip the cell itself

      const newX = x + dx;
      const newY = y + dy;

      // Check if adjacent cell is within bounds
      if (newX >= 0 && newX < 20 && newY >= 0 && newY < 20) {
        if (gameState.grid[newY][newX].owner === playerName) {
          return true;
        }
      }
    }
  }

  return false;
};

export const claimCell = (gameState, x, y, playerName) => {
  const newState = JSON.parse(JSON.stringify(gameState));

  // Deduct tokens
  newState.players[playerName].tokens -= 10;

  newState.grid[y][x] = {
    owner: playerName,
    color: gameState.players[playerName].color,
  };
  newState.players[playerName].cellCount = countPlayerCells(
    newState,
    playerName
  );
  newState.players[playerName].lastAction = Date.now();
  return newState;
};

export const addTokens = (gameState, playerName, amount) => {
  const newState = { ...gameState };
  newState.players[playerName].tokens =
    (newState.players[playerName].tokens || 0) + amount;
  return newState;
};

const countPlayerCells = (gameState, playerName) => {
  return gameState.grid.reduce((count, row) => {
    return (
      count +
      row.reduce(
        (rowCount, cell) => rowCount + (cell.owner === playerName ? 1 : 0),
        0
      )
    );
  }, 0);
};
