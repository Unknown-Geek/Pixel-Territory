import React from "react";
import { useState, useEffect } from "react";
import {
  createNewGameState,
  canClaimCell,
  claimCell,
  addTokens,
} from "../utils/gameState";
import { Grid } from "./Grid";
import { Leaderboard } from "./Leaderboard";
import { GameInfo } from "./GameInfo";
import { PlayerSelector } from "./PlayerSelector";
import { generateUniqueColor } from "../utils/colors";
import { TokenEarner } from "./TokenEarner";

export const PixelTerritoryGame = () => {
  const [gameState, setGameState] = useState(createNewGameState());
  const [currentPlayer, setCurrentPlayer] = useState("Player1");
  const [showTokenEarner, setShowTokenEarner] = useState(false);

  // Initialize first player if not exists
  useEffect(() => {
    if (Object.keys(gameState.players).length === 0) {
      const newState = { ...gameState };
      newState.players[currentPlayer] = {
        color: generateUniqueColor([]),
        cellCount: 0,
        lastAction: Date.now(),
        tokens: 0,
      };
      setGameState(newState);
    }
  }, []);

  // Initialize riddle pool on game start
  useEffect(() => {
    riddleManager.generateRiddleBatch();
  }, []);

  const handleCellClick = (x, y) => {
    if (!currentPlayer || !gameState.gameActive) return;

    if (gameState.players[currentPlayer].tokens < 10) {
      alert(
        "You need 10 tokens to claim a territory. Earn more by answering questions!"
      );
      return;
    }

    if (canClaimCell(gameState, x, y, currentPlayer)) {
      const newState = claimCell(gameState, x, y, currentPlayer);
      setGameState(newState);
    }
  };

  const handleAddPlayer = (playerName, color) => {
    if (gameState.players[playerName]) return;

    const newState = { ...gameState };
    newState.players[playerName] = {
      color,
      cellCount: 0,
      lastAction: Date.now(),
      tokens: 0,
    };
    setGameState(newState);
    setCurrentPlayer(playerName);
  };

  const handleTokensEarned = (amount) => {
    const newState = addTokens(gameState, currentPlayer, amount);
    setGameState(newState);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <h1 className="text-3xl font-bold text-center mb-8">Pixel Territory</h1>
      <PlayerSelector
        players={gameState.players}
        currentPlayer={currentPlayer}
        onSelectPlayer={setCurrentPlayer}
        onAddPlayer={handleAddPlayer}
      />
      <div className="max-w-3xl mx-auto mb-4 flex justify-between items-center">
        <div className="text-lg">
          Tokens: {gameState.players[currentPlayer]?.tokens || 0}
        </div>
        <button
          onClick={() => setShowTokenEarner(true)}
          className="px-4 py-2 bg-green-500 text-white rounded"
        >
          Earn Tokens
        </button>
      </div>
      <Grid gameState={gameState} onCellClick={handleCellClick} />
      <Leaderboard players={gameState.players} />
      <GameInfo />
      {showTokenEarner && (
        <TokenEarner
          onTokensEarned={handleTokensEarned}
          onClose={() => setShowTokenEarner(false)}
          currentPlayer={currentPlayer}
        />
      )}
    </div>
  );
};
