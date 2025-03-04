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
  // Check bounds
  if (x < 0 || y < 0 || x >= GRID_SIZE || y >= GRID_SIZE) return false;

  const cell = gameState.grid[y][x];
  const player = gameState.players[playerName];

  // Check if player has enough tokens
  if (player.tokens < 10) return false;

  // Calculate attacker's power based on time since last action
  const timeSinceLastAction = (Date.now() - player.lastAction) / 60000; // minutes
  const attackerPower = Math.min(10, Math.floor(timeSinceLastAction) + 1); // +1 power per minute, max 10

  // New players can claim any unclaimed cell
  const playerCells = countPlayerCells(gameState, playerName);
  if (playerCells === 0 && !cell.owner) return true;

  // For existing players, check adjacency (orthogonal only)
  const hasAdjacentTerritory = [
    [x - 1, y], // Left
    [x + 1, y], // Right
    [x, y - 1], // Top
    [x, y + 1], // Bottom
  ].some(
    ([adjX, adjY]) =>
      adjX >= 0 &&
      adjX < GRID_SIZE &&
      adjY >= 0 &&
      adjY < GRID_SIZE &&
      gameState.grid[adjY][adjX].owner === playerName
  );

  if (!hasAdjacentTerritory) return false;

  // If cell is unclaimed, can take it
  if (!cell.owner) return true;

  // If cell is already owned by player, can't claim
  if (cell.owner === playerName) return false;

  // Calculate defender's power
  const defenderLastAction = new Date(cell.timestamp).getTime();
  const defenderHoldTime = (Date.now() - defenderLastAction) / 60000;
  const defenderPower = Math.min(10, Math.floor(defenderHoldTime) + 1);

  // Can claim if attacker's power is greater
  return attackerPower > defenderPower;
};

export const claimCell = (gameState, x, y, playerName) => {
  if (!canClaimCell(gameState, x, y, playerName)) return gameState;

  const newState = JSON.parse(JSON.stringify(gameState));

  // Deduct tokens for claiming
  newState.players[playerName].tokens -= 10;
  newState.players[playerName].lastAction = Date.now();

  // Update the cell - make sure timestamp is properly set
  newState.grid[y][x] = {
    owner: playerName,
    color: gameState.players[playerName].color,
    timestamp: Date.now(), // This is critical for power calculation
    power: 1, // Initial power of newly claimed cell
  };

  // Update cell counts
  if (gameState.grid[y][x].owner) {
    // Decrease previous owner's count if cell was owned
    newState.players[gameState.grid[y][x].owner].cellCount--;
  }
  newState.players[playerName].cellCount++;

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
