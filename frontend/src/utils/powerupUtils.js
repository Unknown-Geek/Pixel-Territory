/**
 * Utilities for managing power-ups in the Pixel Territory game
 */

// Define power-up types and their properties
export const POWERUP_TYPES = {
  SHIELD: {
    id: "shield",
    name: "Shield",
    description: "Temporarily protects your territory from being captured",
    color: "#4B8BFF", // Blue
    duration: 5 * 60 * 1000, // 5 minutes in milliseconds
    icon: "🛡️",
  },
  BOMB: {
    id: "bomb",
    name: "Bomb",
    description: "Claim multiple adjacent cells at once",
    color: "#FF5555", // Red
    duration: null, // Single use
    icon: "💣",
  },
  TELEPORT: {
    id: "teleport",
    name: "Teleport",
    description: "Claim a non-adjacent cell anywhere on the grid",
    color: "#9D5CFF", // Purple
    duration: null, // Single use
    icon: "✨",
  },
  COLOR_BOMB: {
    id: "colorBomb",
    name: "Color Bomb",
    description: "Convert adjacent enemy territories to your color",
    color: "#FFCC33", // Yellow/Gold
    duration: null, // Single use
    icon: "🎨",
  },
};

/**
 * Generates random power-up cells on the grid
 *
 * @param {Object} gameState Current game state
 * @param {number} count Number of power-ups to generate
 * @returns {Object} Updated game state with power-ups
 */
export const generatePowerups = (gameState, count = 3) => {
  const newState = { ...gameState };

  // Initialize powerups in gameState if it doesn't exist
  if (!newState.powerups) {
    newState.powerups = [];
  }

  // Clear existing powerups if it's a new day
  const lastPowerupDay = newState.lastPowerupDay || 0;
  const today = new Date().setHours(0, 0, 0, 0);

  if (lastPowerupDay !== today) {
    newState.powerups = [];
    newState.lastPowerupDay = today;
  } else if (newState.powerups.length >= count) {
    // If we already have enough powerups for today, return the state unchanged
    return newState;
  }

  // Determine how many more powerups we need to generate
  const remainingToGenerate = count - newState.powerups.length;

  // Get all valid cell positions (unoccupied cells)
  const validPositions = [];
  for (let y = 0; y < newState.grid.length; y++) {
    for (let x = 0; x < newState.grid[y].length; x++) {
      // Check if cell is unoccupied and not already containing a powerup
      if (!newState.grid[y][x].owner && !isPowerupAt(newState, x, y)) {
        validPositions.push({ x, y });
      }
    }
  }

  // Shuffle valid positions to randomize selection
  shuffleArray(validPositions);

  // Get powerup types as array for random selection
  const powerupTypes = Object.values(POWERUP_TYPES);

  // Generate new powerups
  for (let i = 0; i < remainingToGenerate && i < validPositions.length; i++) {
    const position = validPositions[i];
    const powerupType =
      powerupTypes[Math.floor(Math.random() * powerupTypes.length)];

    newState.powerups.push({
      x: position.x,
      y: position.y,
      type: powerupType.id,
      createdAt: Date.now(),
    });
  }

  return newState;
};

/**
 * Check if a powerup exists at the given coordinates
 *
 * @param {Object} gameState Current game state
 * @param {number} x X coordinate
 * @param {number} y Y coordinate
 * @returns {boolean} True if a powerup exists at the coordinates
 */
export const isPowerupAt = (gameState, x, y) => {
  if (!gameState.powerups) return false;

  return gameState.powerups.some(
    (powerup) => powerup.x === x && powerup.y === y
  );
};

/**
 * Get a powerup at the given coordinates if one exists
 *
 * @param {Object} gameState Current game state
 * @param {number} x X coordinate
 * @param {number} y Y coordinate
 * @returns {Object|null} The powerup object or null if none exists
 */
export const getPowerupAt = (gameState, x, y) => {
  if (!gameState.powerups) return null;

  return (
    gameState.powerups.find((powerup) => powerup.x === x && powerup.y === y) ||
    null
  );
};

/**
 * Collect a powerup at the given coordinates
 *
 * @param {Object} gameState Current game state
 * @param {number} x X coordinate
 * @param {number} y Y coordinate
 * @param {string} playerName Player collecting the powerup
 * @returns {Object} Updated game state
 */
export const collectPowerup = (gameState, x, y, playerName) => {
  const powerup = getPowerupAt(gameState, x, y);
  if (!powerup) return gameState;

  const newState = { ...gameState };

  // Remove the powerup from the grid
  newState.powerups = newState.powerups.filter(
    (p) => !(p.x === x && p.y === y)
  );

  // Initialize player powerups if needed
  if (!newState.players[playerName].powerups) {
    newState.players[playerName].powerups = [];
  }

  // Add to player's inventory
  newState.players[playerName].powerups.push({
    ...powerup,
    collectedAt: Date.now(),
  });

  return newState;
};

/**
 * Apply a shield powerup to a cell
 *
 * @param {Object} gameState Current game state
 * @param {number} x X coordinate
 * @param {number} y Y coordinate
 * @param {string} playerName Player activating the powerup
 * @returns {Object} Updated game state
 */
export const applyShield = (gameState, x, y, playerName) => {
  const cell = gameState.grid[y]?.[x];
  if (!cell || cell.owner !== playerName) return gameState;

  const newState = JSON.parse(JSON.stringify(gameState));
  const shieldExpiration = Date.now() + POWERUP_TYPES.SHIELD.duration;

  // Add shield to the cell
  newState.grid[y][x].shield = {
    expiresAt: shieldExpiration,
  };

  // Remove the powerup from player's inventory
  if (newState.players[playerName].powerups) {
    const shieldIndex = newState.players[playerName].powerups.findIndex(
      (p) => p.type === POWERUP_TYPES.SHIELD.id
    );

    if (shieldIndex !== -1) {
      newState.players[playerName].powerups.splice(shieldIndex, 1);
    }
  }

  return newState;
};

/**
 * Apply a bomb powerup to claim multiple adjacent cells
 *
 * @param {Object} gameState Current game state
 * @param {number} x X coordinate
 * @param {number} y Y coordinate
 * @param {string} playerName Player activating the powerup
 * @returns {Object} Updated game state
 */
export const applyBomb = (gameState, x, y, playerName) => {
  const newState = JSON.parse(JSON.stringify(gameState));

  // Define the blast radius (3x3 grid centered on the target cell)
  const directions = [
    { dx: -1, dy: -1 },
    { dx: 0, dy: -1 },
    { dx: 1, dy: -1 },
    { dx: -1, dy: 0 },
    { dx: 0, dy: 0 },
    { dx: 1, dy: 0 },
    { dx: -1, dy: 1 },
    { dx: 0, dy: 1 },
    { dx: 1, dy: 1 },
  ];

  // Claim cells in the blast radius
  for (const dir of directions) {
    const nx = x + dir.dx;
    const ny = y + dir.dy;

    // Check if cell is within bounds
    if (
      nx >= 0 &&
      nx < newState.grid[0].length &&
      ny >= 0 &&
      ny < newState.grid.length
    ) {
      const cell = newState.grid[ny][nx];

      // Skip cells with shields
      if (cell.shield && cell.shield.expiresAt > Date.now()) {
        continue;
      }

      // Skip allied cells
      if (
        cell.owner &&
        cell.owner !== playerName &&
        newState.alliances &&
        isAllyByCheck(newState, playerName, cell.owner)
      ) {
        continue;
      }

      // If this cell was already owned by someone else, decrease their count
      if (cell.owner && cell.owner !== playerName) {
        newState.players[cell.owner].cellCount--;
      }

      // If this is a new cell for the player (not one they already owned)
      if (cell.owner !== playerName) {
        newState.players[playerName].cellCount++;
      }

      // Update the cell
      cell.owner = playerName;
      cell.color = newState.players[playerName].color;
      cell.timestamp = Date.now();
    }
  }

  // Remove the powerup from player's inventory
  if (newState.players[playerName].powerups) {
    const bombIndex = newState.players[playerName].powerups.findIndex(
      (p) => p.type === POWERUP_TYPES.BOMB.id
    );

    if (bombIndex !== -1) {
      newState.players[playerName].powerups.splice(bombIndex, 1);
    }
  }

  return newState;
};

/**
 * Apply a teleport powerup to claim a non-adjacent cell
 *
 * @param {Object} gameState Current game state
 * @param {number} x X coordinate
 * @param {number} y Y coordinate
 * @param {string} playerName Player activating the powerup
 * @returns {Object} Updated game state
 */
export const applyTeleport = (gameState, x, y, playerName) => {
  const cell = gameState.grid[y]?.[x];
  if (!cell) return gameState;

  // Skip if target cell has a shield
  if (cell.shield && cell.shield.expiresAt > Date.now()) {
    return gameState;
  }

  const newState = JSON.parse(JSON.stringify(gameState));

  // If this cell was already owned by someone else, decrease their count
  if (cell.owner && cell.owner !== playerName) {
    newState.players[cell.owner].cellCount--;
  }

  // If this is a new cell for the player (not one they already owned)
  if (cell.owner !== playerName) {
    newState.players[playerName].cellCount++;
  }

  // Update the cell
  newState.grid[y][x].owner = playerName;
  newState.grid[y][x].color = newState.players[playerName].color;
  newState.grid[y][x].timestamp = Date.now();

  // Remove the powerup from player's inventory
  if (newState.players[playerName].powerups) {
    const teleportIndex = newState.players[playerName].powerups.findIndex(
      (p) => p.type === POWERUP_TYPES.TELEPORT.id
    );

    if (teleportIndex !== -1) {
      newState.players[playerName].powerups.splice(teleportIndex, 1);
    }
  }

  return newState;
};

/**
 * Apply a color bomb to convert adjacent enemy territories
 *
 * @param {Object} gameState Current game state
 * @param {number} x X coordinate
 * @param {number} y Y coordinate
 * @param {string} playerName Player activating the powerup
 * @returns {Object} Updated game state
 */
export const applyColorBomb = (gameState, x, y, playerName) => {
  const newState = JSON.parse(JSON.stringify(gameState));

  // Define adjacent cells (orthogonal only)
  const directions = [
    { dx: 0, dy: -1 }, // Up
    { dx: 1, dy: 0 }, // Right
    { dx: 0, dy: 1 }, // Down
    { dx: -1, dy: 0 }, // Left
  ];

  // Convert adjacent enemy territories
  for (const dir of directions) {
    const nx = x + dir.dx;
    const ny = y + dir.dy;

    // Check if cell is within bounds
    if (
      nx >= 0 &&
      nx < newState.grid[0].length &&
      ny >= 0 &&
      ny < newState.grid.length
    ) {
      const cell = newState.grid[ny][nx];

      // Only convert enemy territories (not player's own, unclaimed, or allied)
      if (cell.owner && cell.owner !== playerName) {
        // Skip cells with shields
        if (cell.shield && cell.shield.expiresAt > Date.now()) {
          continue;
        }

        // Skip allied cells
        if (
          newState.alliances &&
          isAllyByCheck(newState, playerName, cell.owner)
        ) {
          continue;
        }

        // Decrease previous owner's count
        newState.players[cell.owner].cellCount--;

        // Increase player's count
        newState.players[playerName].cellCount++;

        // Update the cell
        cell.owner = playerName;
        cell.color = newState.players[playerName].color;
        cell.timestamp = Date.now();
      }
    }
  }

  // Remove the powerup from player's inventory
  if (newState.players[playerName].powerups) {
    const colorBombIndex = newState.players[playerName].powerups.findIndex(
      (p) => p.type === POWERUP_TYPES.COLOR_BOMB.id
    );

    if (colorBombIndex !== -1) {
      newState.players[playerName].powerups.splice(colorBombIndex, 1);
    }
  }

  return newState;
};

/**
 * Check if a cell has an active shield
 *
 * @param {Object} cell The cell to check
 * @returns {boolean} True if the cell has an active shield
 */
export const hasActiveShield = (cell) => {
  return cell?.shield && cell.shield.expiresAt > Date.now();
};

/**
 * Shuffle an array in-place using the Fisher-Yates algorithm
 *
 * @param {Array} array Array to shuffle
 */
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

// Helper function to check alliance status (needed by power-ups)
const isAllyByCheck = (gameState, player1, player2) => {
  if (!gameState.alliances) return false;

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
