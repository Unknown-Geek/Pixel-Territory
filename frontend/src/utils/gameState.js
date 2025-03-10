import { generateUniqueColor } from "./colors";
import {
  hasActiveShield,
  isPowerupAt,
  getPowerupAt,
  collectPowerup,
} from "./powerupUtils";

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
    powerups: [], // Initialize empty powerups array
    gameActive: true,
    lastReset: Date.now(),
    lastPowerupDay: new Date().setHours(0, 0, 0, 0), // Today at midnight
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
      powerups: [], // Initialize empty powerups array for player
    };
  }

  return newState;
};

// Check if a cell can be claimed
export const canClaimCell = (gameState, x, y, playerName) => {
  // Existing code for basic claim check
  const cell = gameState.grid[y][x];
  const player = gameState.players[playerName];

  if (!player) return false;

  // If cell is already owned by player
  if (cell.owner === playerName) return false;

  // Check if cell has an active shield
  if (hasActiveShield(cell)) return false;

  // Check if cell is owned by an ally (can't claim allied cells)
  if (cell.owner && isAlly(gameState, playerName, cell.owner)) {
    return false;
  }

  // Player's power calculation
  const playerTimeSince = Math.floor((Date.now() - player.lastAction) / 60000);
  const playerPower = Math.min(10, playerTimeSince + 1);

  // Calculate cell defender's power
  let cellPower = 0;
  if (cell.owner && cell.timestamp) {
    const cellAge = Math.floor((Date.now() - cell.timestamp) / 60000);
    cellPower = Math.min(10, cellAge + 1);
  }

  // New player can claim any unclaimed cell
  if (!cell.owner && (!player.cells || player.cells === 0)) return true;

  // Existing player needs adjacency unless they have a teleport powerup
  if (player.cells > 0) {
    const hasAdjacent = checkAdjacentOwnership(gameState, x, y, playerName);
    const hasTeleport =
      player.powerups && player.powerups.some((p) => p.type === "teleport");

    if (!hasAdjacent && !hasTeleport) return false;
  }

  // Power check for claiming owned cells
  if (cell.owner && playerPower <= cellPower) return false;

  return true;
};

// Check if two players are allies
export const isAlly = (gameState, player1, player2) => {
  if (!gameState.alliances) return false;

  // Check both players' alliance memberships
  for (const allianceId in gameState.alliances) {
    const alliance = gameState.alliances[allianceId];
    const player1IsInAlliance = alliance.members.includes(player1);
    const player2IsInAlliance = alliance.members.includes(player2);

    if (player1IsInAlliance && player2IsInAlliance) {
      return true;
    }
  }

  return false;
};

// Check if player owns any adjacent cell
const checkAdjacentOwnership = (gameState, x, y, playerName) => {
  const directions = [
    { dx: 0, dy: -1 }, // up
    { dx: 1, dy: 0 }, // right
    { dx: 0, dy: 1 }, // down
    { dx: -1, dy: 0 }, // left
  ];

  for (const dir of directions) {
    const nx = x + dir.dx;
    const ny = y + dir.dy;

    // Check bounds
    if (
      nx >= 0 &&
      nx < gameState.grid[0].length &&
      ny >= 0 &&
      ny < gameState.grid.length
    ) {
      // Check if adjacent cell is owned by player
      if (gameState.grid[ny][nx].owner === playerName) {
        return true;
      }

      // Check if adjacent cell is owned by an ally
      if (
        gameState.grid[ny][nx].owner &&
        isAlly(gameState, playerName, gameState.grid[ny][nx].owner)
      ) {
        return true;
      }
    }
  }

  return false;
};

// Calculate combined alliance score
export const getAllianceScore = (gameState, allianceId) => {
  if (!gameState.alliances || !gameState.alliances[allianceId]) return 0;

  const alliance = gameState.alliances[allianceId];
  let totalScore = 0;

  alliance.members.forEach((memberName) => {
    const player = gameState.players[memberName];
    if (player && player.cells) {
      totalScore += player.cells;
    }
  });

  return totalScore;
};

// Parse alliance commands from comments
export const parseAllianceCommand = (commentText, playerName) => {
  // Check for alliance invitations: /ally invite PlayerName
  const inviteMatch = commentText.match(/\/ally\s+invite\s+([a-zA-Z0-9_]+)/i);
  if (inviteMatch) {
    return {
      type: "invite",
      from: playerName,
      to: inviteMatch[1],
    };
  }

  // Check for alliance acceptances: /ally accept InviterId
  const acceptMatch = commentText.match(/\/ally\s+accept\s+([a-zA-Z0-9_]+)/i);
  if (acceptMatch) {
    return {
      type: "accept",
      from: playerName,
      to: acceptMatch[1],
    };
  }

  // Check for alliance rejections: /ally reject InviterId
  const rejectMatch = commentText.match(/\/ally\s+reject\s+([a-zA-Z0-9_]+)/i);
  if (rejectMatch) {
    return {
      type: "reject",
      from: playerName,
      to: rejectMatch[1],
    };
  }

  // Check for alliance leave: /ally leave
  const leaveMatch = commentText.match(/\/ally\s+leave/i);
  if (leaveMatch) {
    return {
      type: "leave",
      from: playerName,
    };
  }

  return null;
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

  // Check if there's a powerup on this cell and collect it
  if (isPowerupAt(newState, x, y)) {
    return collectPowerup(newState, x, y, playerName);
  }

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
