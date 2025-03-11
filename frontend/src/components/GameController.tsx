import React, { useState, useEffect } from "react";
import { TerritoryGrid } from "./TerritoryGrid";
import { PlayerStats } from "./PlayerStats";
import { Leaderboard } from "./Leaderboard";
import { AlliancePanel } from "./AlliancePanel";
import { PowerupInventory } from "./PowerupInventory";
import { ClaimConfirmationDialog } from "./ClaimConfirmationDialog";
import { RetroButton } from "./RetroButton";
import { PowerupActivator } from "./PowerupActivator";
import {
  createNewGameState,
  claimCell,
  addTokens,
  initializePlayer,
} from "../utils/gameState";
import { generateUniqueColor } from "../utils/colors";
import { applyPowerupEffect } from "../utils/powerupUtils";

export const GameController = () => {
  // Game state
  const [gameState, setGameState] = useState(() => {
    const storedState = localStorage.getItem("pixelTerritoryState");
    return storedState ? JSON.parse(storedState) : createNewGameState();
  });

  // Player state
  const [currentPlayer, setCurrentPlayer] = useState(() => {
    return localStorage.getItem("pixelTerritoryPlayer") || "Player1";
  });

  // UI state
  const [selectedCell, setSelectedCell] = useState(null);
  const [targetCell, setTargetCell] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showRiddle, setShowRiddle] = useState(false);
  const [activePowerup, setActivePowerup] = useState(null);
  const [isPowerupTargeting, setIsPowerupTargeting] = useState(false);

  // Save game state to local storage
  useEffect(() => {
    localStorage.setItem("pixelTerritoryState", JSON.stringify(gameState));
  }, [gameState]);

  // Initialize first player if not exists
  useEffect(() => {
    if (Object.keys(gameState.players).length === 0) {
      handlePlayerChange(currentPlayer);
    }
  }, []);

  // Initialize riddle limits
  useEffect(() => {
    // Configure riddle limits - these can be adjusted as needed
    const maxRiddles = 5; // Maximum riddles per cooldown period
    const cooldownHours = 5; // Cooldown period in hours
    riddleManager.setLimits(maxRiddles, cooldownHours);
  }, []);

  // Handle player selection/creation
  const handlePlayerChange = (playerName) => {
    if (!gameState.players[playerName]) {
      // Create new player
      const color = generateUniqueColor(
        Object.values(gameState.players).map((p) => p.color)
      );
      const updatedState = initializePlayer(gameState, playerName, color);
      setGameState(updatedState);
    }

    setCurrentPlayer(playerName);
    localStorage.setItem("pixelTerritoryPlayer", playerName);
  };

  // Handle cell selection
  const handleCellClick = (x, y) => {
    // If in powerup targeting mode
    if (isPowerupTargeting && activePowerup) {
      const updatedState = applyPowerupEffect(
        gameState,
        activePowerup,
        x,
        y,
        currentPlayer
      );

      if (updatedState !== gameState) {
        setGameState(updatedState);
        // Consume powerup
        const updatedPlayer = { ...updatedState.players[currentPlayer] };
        updatedPlayer.powerups = updatedPlayer.powerups.filter(
          (p) => p.id !== activePowerup.id
        );

        const finalState = {
          ...updatedState,
          players: {
            ...updatedState.players,
            [currentPlayer]: updatedPlayer,
          },
        };

        setGameState(finalState);
      }

      setActivePowerup(null);
      setIsPowerupTargeting(false);
      return;
    }

    const cell = gameState.grid[y][x];

    // If cell is owned by current player, select it
    if (cell.owner === currentPlayer) {
      setSelectedCell({ x, y });
      return;
    }

    // If a cell is already selected and this is a valid target
    if (selectedCell) {
      const sourceCell = gameState.grid[selectedCell.y][selectedCell.x];

      // Check if this is a valid expansion target
      if (canExpand(selectedCell.x, selectedCell.y, x, y)) {
        setTargetCell({ x, y });
        setShowConfirmation(true);
      } else {
        // Deselect current cell if invalid target
        setSelectedCell(null);
      }
    }
  };

  // Check if expansion from source to target is valid
  const canExpand = (sourceX, sourceY, targetX, targetY) => {
    // Check adjacency
    const isAdjacent =
      (Math.abs(sourceX - targetX) === 1 && sourceY === targetY) ||
      (Math.abs(sourceY - targetY) === 1 && sourceX === targetX);

    if (!isAdjacent) return false;

    const player = gameState.players[currentPlayer];
    if (!player || player.tokens < 10) return false;

    return true;
  };

  // Handle cell claim confirmation
  const handleClaimConfirm = () => {
    if (!selectedCell || !targetCell) return;

    const updatedState = claimCell(
      gameState,
      targetCell.x,
      targetCell.y,
      currentPlayer
    );

    setGameState(updatedState);
    setShowConfirmation(false);
    setSelectedCell(null);
    setTargetCell(null);
  };

  // Handle powerup activation
  const handleActivatePowerup = (powerup) => {
    setActivePowerup(powerup);
    setIsPowerupTargeting(true);
  };

  // Handle earning tokens through riddles
  const handleEarnTokens = (amount) => {
    const updatedState = addTokens(gameState, currentPlayer, amount);
    setGameState(updatedState);
    setShowRiddle(false);
  };

  // Get player history data for stats
  const getPlayerHistory = () => {
    // Placeholder - in a full implementation this would fetch real history data
    return Array(10)
      .fill()
      .map(() => Math.floor(Math.random() * 100));
  };

  return (
    <div className="min-h-screen bg-[var(--retro-background)] p-4">
      <h1 className="text-center text-3xl mb-8 retro-text">PIXEL TERRITORY</h1>

      {/* Game controls */}
      <div className="max-w-5xl mx-auto mb-6 flex justify-between items-center game-controls">
        <div className="flex items-center gap-4">
          <select
            value={currentPlayer}
            onChange={(e) => handlePlayerChange(e.target.value)}
            className="retro-select"
          >
            {Object.keys(gameState.players).map((player) => (
              <option key={player} value={player}>
                {player}
              </option>
            ))}
            <option value="new">+ New Player</option>
          </select>

          <div className="text-white">
            Tokens:
            <span className="text-[var(--retro-complement)] font-bold ml-2">
              {gameState.players[currentPlayer]?.tokens || 0}
            </span>
          </div>
        </div>

        <div className="flex gap-2">
          <RetroButton variant="complement" onClick={() => setShowRiddle(true)}>
            Earn Tokens
          </RetroButton>
        </div>
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column - Player stats */}
        <div className="lg:col-span-1">
          <PlayerStats
            player={gameState.players[currentPlayer]}
            playerName={currentPlayer}
            history={getPlayerHistory()}
          />

          <div className="mt-6">
            <PowerupInventory
              powerups={gameState.players[currentPlayer]?.powerups || []}
              onActivate={handleActivatePowerup}
            />
          </div>
        </div>

        {/* Center/right - Game grid and leaderboard */}
        <div className="lg:col-span-2">
          <TerritoryGrid
            gameState={gameState}
            playerName={currentPlayer}
            onCellClick={handleCellClick}
            selectedCell={selectedCell}
            isPowerupTargetMode={isPowerupTargeting}
            powerupType={activePowerup?.type}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <Leaderboard
              players={gameState.players}
              currentPlayer={currentPlayer}
            />

            <AlliancePanel
              gameState={gameState}
              playerName={currentPlayer}
              onAllianceAction={(action) => {
                // Alliance actions would update game state
                console.log("Alliance action:", action);
              }}
            />
          </div>
        </div>
      </div>

      {/* Modals and Dialogs */}
      {showConfirmation && selectedCell && targetCell && (
        <ClaimConfirmationDialog
          isOpen={showConfirmation}
          targetCell={gameState.grid[targetCell.y][targetCell.x]}
          sourceCell={gameState.grid[selectedCell.y][selectedCell.x]}
          playerName={currentPlayer}
          cost={10}
          onConfirm={handleClaimConfirm}
          onCancel={() => {
            setShowConfirmation(false);
            setTargetCell(null);
          }}
        />
      )}

      {showRiddle && (
        <RiddleModal
          isOpen={showRiddle}
          onClose={() => setShowRiddle(false)}
          onCorrectAnswer={handleEarnTokens}
        />
      )}

      {isPowerupTargeting && (
        <div className="fixed bottom-4 left-0 right-0 bg-black bg-opacity-70 text-white text-center p-4 z-50">
          <p>Select a target for your {activePowerup?.type} powerup</p>
          <button
            onClick={() => {
              setIsPowerupTargeting(false);
              setActivePowerup(null);
            }}
            className="mt-2 bg-[var(--retro-error)] px-4 py-1 rounded"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
};

export default GameController;
