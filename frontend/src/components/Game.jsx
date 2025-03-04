import React from "react";
import { useState, useEffect } from "react";
import {
  createNewGameState,
  canClaimCell,
  claimCell,
  addTokens,
  initializePlayer,
} from "../utils/gameState";
import { TerritoryGrid } from "./TerritoryGrid";
import { Leaderboard } from "./Leaderboard";
import { GameInfo } from "./GameInfo";
import { PlayerSelector } from "./PlayerSelector";
import { generateUniqueColor } from "../utils/colors";
import { TokenEarner } from "./TokenEarner";
import { riddleManager } from "../utils/riddleManager";
import { CellConfirmation } from "./CellConfirmation";

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

  // Save game state to local storage whenever it changes
  useEffect(() => {
    localStorage.setItem("pixelTerritoryState", JSON.stringify(gameState));
  }, [gameState]);

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

  const handleCellClick = (x, y) => {
    if (!currentPlayer || !gameState.gameActive) return;

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
          position: { x: event.pageX, y: event.pageY },
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
          <div className="text-lg">
            TOKENS: {gameState.players[currentPlayer]?.tokens || 0}
          </div>
          <button
            onClick={() => setShowTokenEarner(true)}
            className="retro-button"
          >
            EARN TOKENS
          </button>
        </div>
        <TerritoryGrid
          gameState={gameState}
          playerName={currentPlayer}
          onCellClick={handleCellClick}
        />
        <Leaderboard players={gameState.players} />
        <GameInfo />
      </div>
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
    </div>
  );
};
