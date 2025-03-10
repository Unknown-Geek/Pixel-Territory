import React from "react";
import { useState, useEffect, useCallback } from "react";
import {
  createNewGameState,
  canClaimCell,
  claimCell,
  addTokens,
  initializePlayer,
  getAllianceScore,
} from "../utils/gameState";
import { TerritoryGrid } from "./TerritoryGrid";
import { Leaderboard } from "./Leaderboard";
import { GameInfo } from "./GameInfo";
import { PlayerSelector } from "./PlayerSelector";
import { generateUniqueColor } from "../utils/colors";
import { TokenEarner } from "./TokenEarner";
import { riddleManager } from "../utils/riddleManager";
import { CellConfirmation } from "./CellConfirmation";
import { PowerupInventory } from "./PowerupInventory";
import { PowerupActivator } from "./PowerupActivator";
import { PowerupDisplay } from "./PowerupDisplay";
import { PlayerDashboard } from "./PlayerDashboard";
import {
  generatePowerups,
  applyShield,
  applyBomb,
  applyTeleport,
  applyColorBomb,
  POWERUP_TYPES,
  generateDailyPowerups,
} from "../utils/powerupUtils";

export const PixelTerritoryGame = () => {
  // Initialize with stored game state or create new one
  const [gameState, setGameState] = useState(() => {
    const storedState = localStorage.getItem("pixelTerritoryState");
    return storedState ? JSON.parse(storedState) : createNewGameState();
  });

  // Initialize with stored player name if available
  const [currentPlayer, setCurrentPlayer] = useState(() => {
    return localStorage.getItem("pixelTerritoryPlayer") || "Player1";
  });

  const [showTokenEarner, setShowTokenEarner] = useState(false);
  const [pendingCellClaim, setPendingCellClaim] = useState(null);
  const [activePowerup, setActivePowerup] = useState(null);
  const [pendingPowerupType, setPendingPowerupType] = useState(null);
  const [isPowerupTargetMode, setIsPowerupTargetMode] = useState(false);
  const [powerupMessage, setPowerupMessage] = useState("");
  const [showPlayerDashboard, setShowPlayerDashboard] = useState(false);

  // Save game state to local storage whenever it changes
  useEffect(() => {
    localStorage.setItem("pixelTerritoryState", JSON.stringify(gameState));
  }, [gameState]);

  // Generate daily power-ups
  useEffect(() => {
    // Check if it's a new day to generate power-ups
    const lastPowerupGeneration = localStorage.getItem("lastPowerupGeneration");
    const today = new Date().toDateString();

    if (lastPowerupGeneration !== today) {
      const updatedState = generateDailyPowerups(gameState, 3);
      setGameState(updatedState);
      localStorage.setItem("lastPowerupGeneration", today);
    }
  }, []);

  // Initialize first player if not exists or load from storage
  useEffect(() => {
    // If no players exist yet, create the first one
    if (Object.keys(gameState.players).length === 0) {
      const newState = { ...gameState };
      newState.players[currentPlayer] = {
        color: generateUniqueColor([]),
        cellCount: 0,
        lastAction: Date.now(),
        tokens: 20, // Start with some tokens
        powerups: [], // Initialize empty powerups array
      };
      setGameState(newState);
      localStorage.setItem("pixelTerritoryPlayer", currentPlayer);
    }
    // If we have a stored player name but they don't exist in our state yet
    else if (!gameState.players[currentPlayer]) {
      handleAddPlayer(
        currentPlayer,
        generateUniqueColor(
          Object.values(gameState.players).map((p) => p.color)
        )
      );
    }
  }, []);

  // Initialize riddle pool on game start
  useEffect(() => {
    riddleManager.generateRiddleBatch();
  }, []);

  const showPowerupResult = (message, type = "success") => {
    setPowerupMessage(message);

    // Create a flashy visual effect
    const grid = document.querySelector(".grid-cols-20");
    if (grid) {
      grid.classList.add("animate-pulse-glow");
      setTimeout(() => {
        grid.classList.remove("animate-pulse-glow");
      }, 1500);
    }

    setTimeout(() => setPowerupMessage(""), 3000);
  };

  const handleCellClick = (x, y, event) => {
    if (!currentPlayer || !gameState.gameActive) return;

    // If in power-up target selection mode, handle power-up activation
    if (isPowerupTargetMode && pendingPowerupType) {
      handlePowerupTargetSelected(x, y);
      return;
    }

    const player = gameState.players[currentPlayer];
    if (!player) return;

    // Check if player has enough tokens
    if (player.tokens < 10) {
      alert(
        "You need 10 tokens to claim a territory. Earn more by answering questions!"
      );
      setShowTokenEarner(true);
      return;
    }

    // Check if the cell can be claimed
    if (canClaimCell(gameState, x, y, currentPlayer)) {
      // If it's an opponent's cell, show confirmation
      const cell = gameState.grid[y][x];
      if (cell.owner && cell.owner !== currentPlayer) {
        const cellAge = Math.floor((Date.now() - cell.timestamp) / 60000);
        const defenderPower = Math.min(10, cellAge + 1);

        const playerTimeSince = Math.floor(
          (Date.now() - player.lastAction) / 60000
        );
        const attackerPower = Math.min(10, playerTimeSince + 1);

        if (attackerPower <= defenderPower) {
          alert(
            `You need more power to claim this cell! Your power: ${attackerPower}, Cell power: ${defenderPower}`
          );
          return;
        }

        // Show confirmation before claiming
        setPendingCellClaim({
          x,
          y,
          position: {
            x: event?.pageX || window.innerWidth / 2,
            y: event?.pageY || window.innerHeight / 2,
          },
        });
        return;
      }

      // For unclaimed cells or own cells, claim directly
      const newState = claimCell(gameState, x, y, currentPlayer);
      setGameState(newState);
    } else {
      // If the claim wasn't successful, explain why
      const cell = gameState.grid[y][x];

      if (cell.owner === currentPlayer) {
        alert("You already own this cell!");
      } else if (cell.owner) {
        // Calculate power values
        const cellAge = Math.floor((Date.now() - cell.timestamp) / 60000);
        const defenderPower = Math.min(10, cellAge + 1);

        const playerTimeSince = Math.floor(
          (Date.now() - player.lastAction) / 60000
        );
        const attackerPower = Math.min(10, playerTimeSince + 1);

        alert(
          `You need more power to claim this cell! Your power: ${attackerPower}, Cell power: ${defenderPower}`
        );
      } else {
        alert("You can only expand to adjacent cells!");
      }
    }
  };

  const handlePowerupActivate = (powerupType) => {
    setActivePowerup(powerupType);
  };

  const handlePowerupConfirm = (powerupType) => {
    if (powerupType === "shield") {
      // Shield requires selecting one of the player's own cells
      setPendingPowerupType(powerupType);
      setIsPowerupTargetMode(true);
    } else if (powerupType === "teleport") {
      // Teleport requires selecting any cell on the grid
      setPendingPowerupType(powerupType);
      setIsPowerupTargetMode(true);
    } else if (powerupType === "bomb") {
      // Bomb requires selecting a target cell
      setPendingPowerupType(powerupType);
      setIsPowerupTargetMode(true);
    } else if (powerupType === "colorBomb") {
      // Color bomb requires selecting a target cell
      setPendingPowerupType(powerupType);
      setIsPowerupTargetMode(true);
    }

    setActivePowerup(null);
  };

  const handlePowerupTargetSelected = (x, y) => {
    let updatedState = { ...gameState };
    let resultMessage = "";
    let success = true;

    if (pendingPowerupType === "shield") {
      // Check if the selected cell belongs to the player
      if (gameState.grid[y][x].owner !== currentPlayer) {
        showPowerupResult("You can only shield your own territories!", "error");
        return;
      }
      updatedState = applyShield(gameState, x, y, currentPlayer);
      resultMessage = "✓ Shield activated! Territory protected for 5 minutes.";
    } else if (pendingPowerupType === "teleport") {
      updatedState = applyTeleport(gameState, x, y, currentPlayer);
      resultMessage = "✓ Teleport successful! Territory claimed.";
    } else if (pendingPowerupType === "bomb") {
      updatedState = applyBomb(gameState, x, y, currentPlayer);
      resultMessage = "✓ Bomb deployed! Multiple territories claimed.";
    } else if (pendingPowerupType === "colorBomb") {
      updatedState = applyColorBomb(gameState, x, y, currentPlayer);
      resultMessage = "✓ Color bomb activated! Adjacent territories converted.";
    }

    if (success) {
      setGameState(updatedState);
      setIsPowerupTargetMode(false);
      setPendingPowerupType(null);
      showPowerupResult(resultMessage);
    }
  };

  const handleConfirmClaim = () => {
    if (!pendingCellClaim) return;

    const { x, y } = pendingCellClaim;
    const newState = claimCell(gameState, x, y, currentPlayer);
    setGameState(newState);
    setPendingCellClaim(null);
  };

  const handleCancelClaim = () => {
    setPendingCellClaim(null);
  };

  const handleAddPlayer = (playerName, color) => {
    if (gameState.players[playerName]) return;

    const newState = { ...gameState };
    const updatedState = initializePlayer(newState, playerName, color);
    setGameState(updatedState);
    setCurrentPlayer(playerName);
    localStorage.setItem("pixelTerritoryPlayer", playerName);
  };

  const handleSelectPlayer = (playerName) => {
    setCurrentPlayer(playerName);
    localStorage.setItem("pixelTerritoryPlayer", playerName);
  };

  const handleTokensEarned = (amount) => {
    const newState = addTokens(gameState, currentPlayer, amount);
    setGameState(newState);
  };

  const handleAllianceAction = useCallback(
    (action) => {
      let updatedState = { ...gameState };

      if (action.type === "invite") {
        // Create alliance invitation
        const inviteId = `inv_${Date.now()}`;
        if (!updatedState.allianceInvites) {
          updatedState.allianceInvites = [];
        }

        updatedState.allianceInvites.push({
          id: inviteId,
          from: action.from,
          to: action.to,
          timestamp: Date.now(),
          status: "pending",
        });
      } else if (action.type === "accept") {
        // Find the invitation
        const inviteIndex = updatedState.allianceInvites.findIndex(
          (invite) => invite.id === action.inviteId
        );

        if (inviteIndex >= 0) {
          const invite = updatedState.allianceInvites[inviteIndex];

          // Create the alliance
          const allianceId = `alliance_${Date.now()}`;
          if (!updatedState.alliances) {
            updatedState.alliances = {};
          }

          updatedState.alliances[allianceId] = {
            id: allianceId,
            members: [invite.from, invite.to],
            formed: Date.now(),
            leader: invite.from, // Original inviter is the leader
          };

          // Remove the invitation
          updatedState.allianceInvites.splice(inviteIndex, 1);
        }
      } else if (action.type === "reject") {
        // Find and remove the invitation
        const inviteIndex = updatedState.allianceInvites.findIndex(
          (invite) => invite.id === action.inviteId
        );

        if (inviteIndex >= 0) {
          updatedState.allianceInvites.splice(inviteIndex, 1);
        }
      } else if (action.type === "leave") {
        // Find alliances the player is part of
        Object.keys(updatedState.alliances).forEach((allianceId) => {
          const alliance = updatedState.alliances[allianceId];
          if (alliance.members.includes(action.playerId)) {
            // If only 2 members, remove alliance completely
            if (alliance.members.length <= 2) {
              delete updatedState.alliances[allianceId];
            } else {
              // Otherwise just remove the player
              alliance.members = alliance.members.filter(
                (member) => member !== action.playerId
              );

              // If the leader left, assign a new leader
              if (alliance.leader === action.playerId) {
                alliance.leader = alliance.members[0];
              }
            }
          }
        });
      }

      setGameState(updatedState);
    },
    [gameState]
  );

  const currentPlayerPowerups =
    gameState.players[currentPlayer]?.powerups || [];

  return (
    <div className="min-h-screen bg-black p-4">
      <h1 className="text-3xl font-bold text-center mb-8 retro-text">
        PIXEL TERRITORY
      </h1>
      <div className="retro-container">
        <PlayerSelector
          players={gameState.players}
          currentPlayer={currentPlayer}
          onSelectPlayer={handleSelectPlayer}
          onAddPlayer={handleAddPlayer}
        />
        <div className="max-w-3xl mx-auto mb-4 flex justify-between items-center">
          <div className="text-lg flex items-center gap-2">
            <span>TOKENS: {gameState.players[currentPlayer]?.tokens || 0}</span>

            {/* Display power-up counts */}
            {Object.entries(
              currentPlayerPowerups.reduce((acc, p) => {
                acc[p.type] = (acc[p.type] || 0) + 1;
                return acc;
              }, {})
            ).map(([type, count]) => (
              <div
                key={type}
                className="ml-3"
                title={POWERUP_TYPES[type.toUpperCase()]?.name || "Power-up"}
              >
                <PowerupDisplay type={type} count={count} size="sm" />
              </div>
            ))}
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setShowPlayerDashboard(true)}
              className="retro-button"
            >
              DASHBOARD
            </button>
            <button
              onClick={() => setShowTokenEarner(true)}
              className="retro-button"
            >
              EARN TOKENS
            </button>
          </div>
        </div>

        {/* Power-up message */}
        {powerupMessage && (
          <div className="max-w-3xl mx-auto mb-4 p-3 bg-[var(--retro-black)] border-2 border-[var(--retro-accent)] text-center text-[var(--retro-accent)] animate-pulse-glow rounded">
            <span className="text-lg">{powerupMessage}</span>
          </div>
        )}

        {/* Main game area - now with Leaderboard below TerritoryGrid */}
        <div className="max-w-3xl mx-auto">
          <TerritoryGrid
            gameState={gameState}
            playerName={currentPlayer}
            onCellClick={handleCellClick}
            isPowerupTargetMode={isPowerupTargetMode}
            powerupType={pendingPowerupType}
          />

          {/* Power-up inventory */}
          <PowerupInventory
            playerPowerups={currentPlayerPowerups}
            onActivatePowerup={handlePowerupActivate}
          />

          {/* Leaderboard positioned below the grid */}
          <div className="mt-6">
            <Leaderboard
              players={gameState.players}
              currentPlayer={currentPlayer}
            />
          </div>
        </div>

        <GameInfo />
      </div>

      {/* Modals and dialogs */}
      {showTokenEarner && (
        <TokenEarner
          onTokensEarned={handleTokensEarned}
          onClose={() => setShowTokenEarner(false)}
          currentPlayer={currentPlayer}
        />
      )}

      {pendingCellClaim && (
        <CellConfirmation
          position={pendingCellClaim.position}
          onConfirm={handleConfirmClaim}
          onCancel={handleCancelClaim}
        />
      )}

      {activePowerup && (
        <PowerupActivator
          isOpen={!!activePowerup}
          powerupType={activePowerup}
          onClose={() => setActivePowerup(null)}
          onTargetSelect={handlePowerupConfirm}
          onActivate={handlePowerupConfirm}
        />
      )}

      {isPowerupTargetMode && (
        <div className="fixed bottom-4 left-0 right-0 bg-black bg-opacity-90 p-3 text-center text-white z-50">
          <p>
            {pendingPowerupType === "shield" &&
              "Select one of your territories to shield"}
            {pendingPowerupType === "teleport" &&
              "Select any cell to teleport to"}
            {pendingPowerupType === "bomb" &&
              "Select target cell for your bomb"}
            {pendingPowerupType === "colorBomb" &&
              "Select target cell for your color bomb"}
          </p>
          <button
            onClick={() => {
              setIsPowerupTargetMode(false);
              setPendingPowerupType(null);
            }}
            className="mt-2 px-4 py-1 bg-red-600 text-white rounded"
          >
            Cancel
          </button>
        </div>
      )}

      {showPlayerDashboard && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-75 p-4">
          <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <PlayerDashboard
              gameState={gameState}
              playerName={currentPlayer}
              onEarnTokens={() => {
                setShowPlayerDashboard(false);
                setShowTokenEarner(true);
              }}
              onAllianceAction={handleAllianceAction}
            />
            <div className="mt-4 text-center">
              <button
                onClick={() => setShowPlayerDashboard(false)}
                className="retro-button"
              >
                RETURN TO GAME
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
