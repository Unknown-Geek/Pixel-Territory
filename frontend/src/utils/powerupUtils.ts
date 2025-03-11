/**
 * Utilities for power-ups in Pixel Territory
 */

// Define power-up types and their properties
export const POWERUP_TYPES = {
  SHIELD: {
    name: "Shield",
    description: "Protects your territory from capture for 5 minutes",
    icon: "🛡️",
    color: "#2196F3",
    targetInstructions: "Select one of your territories to shield",
  },
  BOMB: {
    name: "Bomb",
    description: "Claims a target cell and all adjacent cells",
    icon: "💣",
    color: "#F44336",
    targetInstructions: "Select any cell to bomb (affects adjacent cells)",
  },
  TELEPORT: {
    name: "Teleport",
    description: "Claims any unclaimed cell, regardless of adjacency",
    icon: "✨",
    color: "#9C27B0",
    targetInstructions: "Select any unclaimed cell to teleport to",
  },
  COLOR_BOMB: {
    name: "Color Bomb",
    description: "Converts all connected enemy territories of the same color",
    icon: "🎨",
    color: "#FF9800",
    targetInstructions: "Select an enemy territory to convert",
  },
};

/**
 * Generate random power-ups for a player
 * @param {Object} gameState Current game state
 * @param {string} playerName Player's name
 * @param {number} count Number of power-ups to generate
 * @returns {Object} Updated game state with power-ups
 */
export const generatePowerups = (gameState, playerName, count = 1) => {
  if (!gameState || !playerName || !gameState.players[playerName]) {
    return gameState;
  }

  // Create deep copy of game state
  const newState = JSON.parse(JSON.stringify(gameState));
  const player = newState.players[playerName];

  // Initialize power-ups array if it doesn't exist
  if (!player.powerups) {
    player.powerups = [];
  }

  // Generate random power-ups
  for (let i = 0; i < count; i++) {
    const powerupTypes = Object.keys(POWERUP_TYPES);
    const randomType =
      powerupTypes[Math.floor(Math.random() * powerupTypes.length)];

    player.powerups.push({
      id: `powerup-${Date.now()}-${i}`,
      type: randomType.toLowerCase(),
      acquired: Date.now(),
    });
  }

  return newState;
};

/**
 * Place a powerup on the grid
 * @param {Object} gameState Current game state
 * @param {string} type Powerup type
 * @param {number} x X coordinate
 * @param {number} y Y coordinate
 * @returns {Object} Updated game state
 */
export const placePowerupOnGrid = (gameState, type, x, y) => {
  if (!gameState || !type || !gameState.grid) {
    return gameState;
  }

  // Validate coordinates
  if (
    x < 0 ||
    y < 0 ||
    y >= gameState.grid.length ||
    x >= gameState.grid[0].length
  ) {
    return gameState;
  }

  // Create deep copy of game state
  const newState = JSON.parse(JSON.stringify(gameState));

  // Initialize powerups array if it doesn't exist
  if (!newState.powerups) {
    newState.powerups = [];
  }

  // Add powerup to game state
  newState.powerups.push({
    id: `grid-powerup-${Date.now()}`,
    type: type.toLowerCase(),
    x,
    y,
    placed: Date.now(),
  });

  return newState;
};

/**
 * Check if a cell has a powerup
 * @param {Object} gameState Current game state
 * @param {number} x X coordinate
 * @param {number} y Y coordinate
 * @returns {boolean} Whether cell has a powerup
 */
export const isPowerupAt = (gameState, x, y) => {
  if (!gameState || !gameState.powerups) return false;

  return gameState.powerups.some(
    (powerup) => powerup.x === x && powerup.y === y
  );
};

/**
 * Get powerup at a specific cell
 * @param {Object} gameState Current game state
 * @param {number} x X coordinate
 * @param {number} y Y coordinate
 * @returns {Object|null} Powerup object or null
 */
export const getPowerupAt = (gameState, x, y) => {
  if (!gameState || !gameState.powerups) return null;

  return (
    gameState.powerups.find((powerup) => powerup.x === x && powerup.y === y) ||
    null
  );
};

/**
 * Collect a powerup from the grid
 * @param {Object} gameState Current game state
 * @param {number} x X coordinate
 * @param {number} y Y coordinate
 * @param {string} playerName Player collecting the powerup
 * @returns {Object} Updated game state
 */
export const collectPowerup = (gameState, x, y, playerName) => {
  if (!gameState || !gameState.powerups || !playerName) return gameState;

  const powerup = getPowerupAt(gameState, x, y);
  if (!powerup) return gameState;

  // Create deep copy of game state
  const newState = JSON.parse(JSON.stringify(gameState));

  // Remove powerup from grid
  newState.powerups = newState.powerups.filter(
    (p) => !(p.x === x && p.y === y)
  );

  // Add to player's inventory
  if (!newState.players[playerName].powerups) {
    newState.players[playerName].powerups = [];
  }

  newState.players[playerName].powerups.push({
    id: `inventory-${Date.now()}`,
    type: powerup.type,
    acquired: Date.now(),
  });

  return newState;
};

/**
 * Check if a cell has an active shield
 * @param {Object} cell Cell data
 * @returns {boolean} Whether the cell has an active shield
 */
export const hasActiveShield = (cell) => {
  if (!cell || !cell.shielded) return false;

  return cell.shieldExpires && cell.shieldExpires > Date.now();
};

/**
 * Apply a shield to a cell
 * @param {Object} gameState Current game state
 * @param {number} x X coordinate
 * @param {number} y Y coordinate
 * @param {string} playerName Player applying the shield
 * @returns {Object} Updated game state
 */
export const applyShield = (gameState, x, y, playerName) => {
  if (!gameState || !gameState.grid || !playerName) return gameState;

  // Validate coordinates
  if (
    x < 0 ||
    y < 0 ||
    y >= gameState.grid.length ||
    x >= gameState.grid[0].length
  ) {
    return gameState;
  }

  // Check if the cell belongs to the player
  const cell = gameState.grid[y][x];
  if (!cell || cell.owner !== playerName) return gameState;

  // Create deep copy of game state
  const newState = JSON.parse(JSON.stringify(gameState));

  // Apply shield for 5 minutes
  newState.grid[y][x].shielded = true;
  newState.grid[y][x].shieldExpires = Date.now() + 5 * 60 * 1000;

  return newState;
};

/**
 * Apply a bomb powerup
 * @param {Object} gameState Current game state
 * @param {number} x X coordinate
 * @param {number} y Y coordinate
 * @param {string} playerName Player using the bomb
 * @returns {Object} Updated game state
 */
export const applyBomb = (gameState, x, y, playerName) => {
  if (!gameState || !gameState.grid || !playerName) return gameState;

  // Validate coordinates
  if (
    x < 0 ||
    y < 0 ||
    y >= gameState.grid.length ||
    x >= gameState.grid[0].length
  ) {
    return gameState;
  }

  // Create deep copy of game state
  const newState = JSON.parse(JSON.stringify(gameState));

  // Get player's power
  const player = newState.players[playerName];
  const timeSince = Math.floor((Date.now() - player.lastAction) / 60000);
  const power = Math.min(10, timeSince + 1);

  // Define bomb area (3x3)
  const bombCells = [];
  for (let dy = -1; dy <= 1; dy++) {
    for (let dx = -1; dx <= 1; dx++) {
      const targetX = x + dx;
      const targetY = y + dy;

      // Check bounds
      if (
        targetX >= 0 &&
        targetX < gameState.grid[0].length &&
        targetY >= 0 &&
        targetY < gameState.grid.length
      ) {
        bombCells.push({ x: targetX, y: targetY });
      }
    }
  }

  // Claim all cells in the bomb area
  bombCells.forEach((cell) => {
    const targetCell = newState.grid[cell.y][cell.x];
    const oldOwner = targetCell.owner;

    // Skip if cell has active shield and belongs to another player
    if (hasActiveShield(targetCell) && targetCell.owner !== playerName) {
      return;
    }

    // Claim the cell
    newState.grid[cell.y][cell.x] = {
      owner: playerName,
      color: player.color,
      timestamp: Date.now(),
      power: power,
    };

    // Update stats if this was someone else's territory
    if (oldOwner && oldOwner !== playerName) {
      // Increment player's captures
      player.captures = (player.captures || 0) + 1;

      // Increment other player's losses if they exist
      if (newState.players[oldOwner]) {
        newState.players[oldOwner].losses =
          (newState.players[oldOwner].losses || 0) + 1;
      }
    }
  });

  // Update player's action timestamp and cell count
  player.lastAction = Date.now();
  player.cellCount = 0; // Will be recalculated

  // Recalculate cell counts for all players
  Object.keys(newState.players).forEach((playerKey) => {
    let count = 0;
    for (const row of newState.grid) {
      for (const cell of row) {
        if (cell.owner === playerKey) {
          count++;
        }
      }
    }
    newState.players[playerKey].cellCount = count;
  });

  return newState;
};

/**
 * Apply a teleport powerup
 * @param {Object} gameState Current game state
 * @param {number} x X coordinate
 * @param {number} y Y coordinate
 * @param {string} playerName Player using the teleport
 * @returns {Object} Updated game state
 */
export const applyTeleport = (gameState, x, y, playerName) => {
  if (!gameState || !gameState.grid || !playerName) return gameState;

  // Validate coordinates
  if (
    x < 0 ||
    y < 0 ||
    y >= gameState.grid.length ||
    x >= gameState.grid[0].length
  ) {
    return gameState;
  }

  // Check if the target cell is unclaimed or has no shield
  const targetCell = gameState.grid[y][x];
  if (targetCell.owner && hasActiveShield(targetCell)) {
    return gameState; // Can't teleport to shielded cell
  }

  // Create deep copy of game state
  const newState = JSON.parse(JSON.stringify(gameState));

  // Get player's power
  const player = newState.players[playerName];
  const timeSince = Math.floor((Date.now() - player.lastAction) / 60000);
  const power = Math.min(10, timeSince + 1);

  // Store previous owner for stats
  const oldOwner = targetCell.owner;

  // Claim the cell
  newState.grid[y][x] = {
    owner: playerName,
    color: player.color,
    timestamp: Date.now(),
    power: power,
  };

  // Update stats if this was someone else's territory
  if (oldOwner && oldOwner !== playerName) {
    // Increment player's captures
    player.captures = (player.captures || 0) + 1;

    // Increment other player's losses if they exist
    if (newState.players[oldOwner]) {
      newState.players[oldOwner].losses =
        (newState.players[oldOwner].losses || 0) + 1;
    }
  }

  // Update player's action timestamp
  player.lastAction = Date.now();

  // Update cell counts
  if (oldOwner && oldOwner !== playerName && newState.players[oldOwner]) {
    newState.players[oldOwner].cellCount--;
  }

  if (!oldOwner) {
    player.cellCount++;
  }

  return newState;
};

/**
 * Apply a color bomb powerup
 * @param {Object} gameState Current game state
 * @param {number} x X coordinate
 * @param {number} y Y coordinate
 * @param {string} playerName Player using the color bomb
 * @returns {Object} Updated game state
 */
export const applyColorBomb = (gameState, x, y, playerName) => {
  if (!gameState || !gameState.grid || !playerName) return gameState;

  // Validate coordinates
  if (
    x < 0 ||
    y < 0 ||
    y >= gameState.grid.length ||
    x >= gameState.grid[0].length
  ) {
    return gameState;
  }

  // Check if the target cell belongs to an enemy
  const targetCell = gameState.grid[y][x];
  if (
    !targetCell.owner ||
    targetCell.owner === playerName ||
    hasActiveShield(targetCell)
  ) {
    return gameState; // Must target enemy non-shielded cell
  }

  const targetOwner = targetCell.owner;

  // Create deep copy of game state
  const newState = JSON.parse(JSON.stringify(gameState));

  // Get player's power
  const player = newState.players[playerName];
  const timeSince = Math.floor((Date.now() - player.lastAction) / 60000);
  const power = Math.min(10, timeSince + 1);

  // Flood fill to find all connected territories of the same owner
  const processed = new Set();
  const toProcess = [[x, y]];
  let capturedCount = 0;

  while (toProcess.length > 0) {
    const [cx, cy] = toProcess.shift();
    const key = `${cx},${cy}`;

    if (processed.has(key)) continue;
    processed.add(key);

    // Check if this cell belongs to the target owner
    if (
      cx >= 0 &&
      cx < gameState.grid[0].length &&
      cy >= 0 &&
      cy < gameState.grid.length &&
      gameState.grid[cy][cx].owner === targetOwner
    ) {
      // Skip if has active shield
      if (hasActiveShield(gameState.grid[cy][cx])) continue;

      // Convert the cell
      newState.grid[cy][cx] = {
        owner: playerName,
        color: player.color,
        timestamp: Date.now(),
        power: power,
      };

      capturedCount++;

      // Add adjacent cells to processing queue
      toProcess.push([cx - 1, cy]);
      toProcess.push([cx + 1, cy]);
      toProcess.push([cx, cy - 1]);
      toProcess.push([cx, cy + 1]);
    }
  }

  // Update stats
  player.captures = (player.captures || 0) + capturedCount;
  player.lastAction = Date.now();

  if (newState.players[targetOwner]) {
    newState.players[targetOwner].losses =
      (newState.players[targetOwner].losses || 0) + capturedCount;
  }

  // Recalculate cell counts for affected players
  player.cellCount += capturedCount;
  if (newState.players[targetOwner]) {
    newState.players[targetOwner].cellCount -= capturedCount;
  }

  return newState;
};

/**
 * Apply a powerup effect based on type
 * @param {Object} gameState Current game state
 * @param {Object} powerup Powerup object to apply
 * @param {number} x Target X coordinate
 * @param {number} y Target Y coordinate
 * @param {string} playerName Player using the powerup
 * @returns {Object} Updated game state
 */
export const applyPowerupEffect = (gameState, powerup, x, y, playerName) => {
  if (!powerup || !powerup.type) return gameState;

  switch (powerup.type.toLowerCase()) {
    case "shield":
      return applyShield(gameState, x, y, playerName);

    case "bomb":
      return applyBomb(gameState, x, y, playerName);

    case "teleport":
      return applyTeleport(gameState, x, y, playerName);

    case "colorbomb":
    case "color_bomb":
    case "color-bomb":
      return applyColorBomb(gameState, x, y, playerName);

    default:
      console.warn(`Unknown powerup type: ${powerup.type}`);
      return gameState;
  }
};

/**
 * Generate daily powerups on the grid
 * @param {Object} gameState Current game state
 * @param {number} count Number of powerups to generate
 * @returns {Object} Updated game state with powerups on grid
 */
export const generateDailyPowerups = (gameState, count = 3) => {
  if (!gameState || !gameState.grid) return gameState;

  // Create deep copy of game state
  const newState = JSON.parse(JSON.stringify(gameState));

  // Clear any existing powerups
  newState.powerups = [];

  // Get all unclaimed cells
  const unclaimedCells = [];
  for (let y = 0; y < newState.grid.length; y++) {
    for (let x = 0; x < newState.grid[y].length; x++) {
      if (!newState.grid[y][x].owner) {
        unclaimedCells.push({ x, y });
      }
    }
  }

  // If no unclaimed cells are available, return original state
  if (unclaimedCells.length === 0) return gameState;

  // Randomly select cells for powerups
  const powerupTypes = Object.keys(POWERUP_TYPES);
  for (let i = 0; i < Math.min(count, unclaimedCells.length); i++) {
    // Get random unclaimed cell
    const randomIndex = Math.floor(Math.random() * unclaimedCells.length);
    const cell = unclaimedCells.splice(randomIndex, 1)[0];

    // Get random powerup type
    const randomTypeIndex = Math.floor(Math.random() * powerupTypes.length);
    const powerupType = powerupTypes[randomTypeIndex].toLowerCase();

    // Add powerup to grid
    newState.powerups.push({
      x: cell.x,
      y: cell.y,
      type: powerupType,
      id: `powerup-${Date.now()}-${i}`,
      expires: Date.now() + 24 * 60 * 60 * 1000, // Expires in 24 hours
    });
  }

  return newState;
};

export default {
  POWERUP_TYPES,
  generatePowerups,
  placePowerupOnGrid,
  isPowerupAt,
  getPowerupAt,
  collectPowerup,
  hasActiveShield,
  applyShield,
  applyBomb,
  applyTeleport,
  applyColorBomb,
  applyPowerupEffect,
  generateDailyPowerups,
};
