/**
 * Utilities for alliance management in Pixel Territory
 */

/**
 * Create a new alliance between two players
 * @param {Object} gameState Current game state
 * @param {string} player1 First player name
 * @param {string} player2 Second player name
 * @returns {Object} Updated game state with new alliance
 */
export const createAlliance = (gameState, player1, player2) => {
  if (!gameState || !player1 || !player2 || player1 === player2) {
    return gameState;
  }

  // Check if players exist
  if (!gameState.players[player1] || !gameState.players[player2]) {
    return gameState;
  }

  // Create deep copy of game state
  const newState = JSON.parse(JSON.stringify(gameState));

  // Check if alliance already exists
  const existingAlliance = Object.values(newState.alliances || {}).find(
    (alliance) =>
      alliance.members.includes(player1) && alliance.members.includes(player2)
  );

  if (existingAlliance) {
    return newState;
  }

  // Create new alliance
  const allianceId = `alliance-${Date.now()}`;

  if (!newState.alliances) {
    newState.alliances = {};
  }

  newState.alliances[allianceId] = {
    id: allianceId,
    name: `${player1} & ${player2}`,
    members: [player1, player2],
    leader: player1,
    formed: Date.now(),
    combinedPower:
      (newState.players[player1].cellCount || 0) +
      (newState.players[player2].cellCount || 0),
  };

  return newState;
};

/**
 * Dissolve an alliance
 * @param {Object} gameState Current game state
 * @param {string} allianceId ID of alliance to dissolve
 * @returns {Object} Updated game state
 */
export const dissolveAlliance = (gameState, allianceId) => {
  if (
    !gameState ||
    !allianceId ||
    !gameState.alliances ||
    !gameState.alliances[allianceId]
  ) {
    return gameState;
  }

  // Create deep copy of game state
  const newState = JSON.parse(JSON.stringify(gameState));

  // Remove alliance
  delete newState.alliances[allianceId];

  return newState;
};

/**
 * Process an alliance invitation
 * @param {Object} gameState Current game state
 * @param {string} from Player sending invitation
 * @param {string} to Player receiving invitation
 * @returns {Object} Updated game state with invitation
 */
export const inviteToAlliance = (gameState, from, to) => {
  if (!gameState || !from || !to || from === to) {
    return gameState;
  }

  // Check if players exist
  if (!gameState.players[from] || !gameState.players[to]) {
    return gameState;
  }

  // Create deep copy of game state
  const newState = JSON.parse(JSON.stringify(gameState));

  // Initialize alliance invites array if it doesn't exist
  if (!newState.allianceInvites) {
    newState.allianceInvites = [];
  }

  // Check for existing invitation
  const existingInvite = newState.allianceInvites.find(
    (invite) =>
      (invite.from === from && invite.to === to) ||
      (invite.from === to && invite.to === from)
  );

  if (existingInvite) {
    return newState;
  }

  // Create new invitation
  newState.allianceInvites.push({
    id: `invite-${Date.now()}`,
    from,
    to,
    status: "pending",
    timestamp: Date.now(),
  });

  return newState;
};

/**
 * Process the response to an alliance invitation
 * @param {Object} gameState Current game state
 * @param {string} inviteId Invitation ID
 * @param {boolean} accepted Whether invitation was accepted
 * @returns {Object} Updated game state
 */
export const respondToInvitation = (gameState, inviteId, accepted) => {
  if (!gameState || !inviteId) {
    return gameState;
  }

  // Create deep copy of game state
  const newState = JSON.parse(JSON.stringify(gameState));

  // Find invitation
  if (!newState.allianceInvites) return newState;

  const inviteIndex = newState.allianceInvites.findIndex(
    (invite) => invite.id === inviteId
  );

  if (inviteIndex === -1) return newState;

  const invite = newState.allianceInvites[inviteIndex];

  // Update invitation status
  newState.allianceInvites[inviteIndex].status = accepted
    ? "accepted"
    : "rejected";

  // If accepted, create alliance
  if (accepted) {
    // Fix: don't reassign to newState, use a temporary variable
    const updatedState = createAlliance(newState, invite.from, invite.to);
    return updatedState;
  }

  return newState;
};

/**
 * Get all active alliances for a player
 * @param {Object} gameState Current game state
 * @param {string} playerName Player name
 * @returns {Array} Player's alliances
 */
export const getPlayerAlliances = (gameState, playerName) => {
  if (!gameState || !playerName || !gameState.alliances) {
    return [];
  }

  return Object.values(gameState.alliances)
    .filter((alliance) => alliance.members.includes(playerName))
    .map((alliance) => ({
      ...alliance,
      allyName: alliance.members.find((member) => member !== playerName),
    }));
};

/**
 * Get pending alliance invitations for a player
 * @param {Object} gameState Current game state
 * @param {string} playerName Player name
 * @returns {Array} Pending invitations
 */
export const getPendingInvitations = (gameState, playerName) => {
  if (!gameState || !playerName || !gameState.allianceInvites) {
    return [];
  }

  return gameState.allianceInvites.filter(
    (invite) => invite.to === playerName && invite.status === "pending"
  );
};

export default {
  createAlliance,
  dissolveAlliance,
  inviteToAlliance,
  respondToInvitation,
  getPlayerAlliances,
  getPendingInvitations,
};
