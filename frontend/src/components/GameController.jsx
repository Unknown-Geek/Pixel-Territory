import React, { useState, useEffect } from "react";
import { TerritoryGrid } from "./TerritoryGrid";
import { RiddleModal } from "./RiddleModal";
import {
  createNewGameState,
  initializePlayer,
  claimCell,
  addTokens,
} from "../utils/gameState";
import { generateUniqueColor } from "../utils/colors";

export const GameController = () => {
  const [gameState, setGameState] = useState(() => {
    const storedState = localStorage.getItem("pixelTerritoryState");
    return storedState ? JSON.parse(storedState) : createNewGameState();
  });

  const [playerName, setPlayerName] = useState("");
  const [showRiddle, setShowRiddle] = useState(false);
  const [isNewPlayer, setIsNewPlayer] = useState(true);

  // Load game state from local storage on component mount
  useEffect(() => {
    const storedPlayerName = localStorage.getItem("pixelTerritoryPlayer");
    if (storedPlayerName) {
      setPlayerName(storedPlayerName);
      setIsNewPlayer(false);
    }
  }, []);

  // Save game state to local storage whenever it changes
  useEffect(() => {
    localStorage.setItem("pixelTerritoryState", JSON.stringify(gameState));
  }, [gameState]);

  const handleNameSubmit = (event) => {
    event.preventDefault();
    if (playerName.trim().length > 0) {
      const color = generateUniqueColor(
        Object.values(gameState.players).map((p) => p.color) || []
      );
      const updatedState = initializePlayer(gameState, playerName, color);
      setGameState(updatedState);
      setIsNewPlayer(false);
      localStorage.setItem("pixelTerritoryPlayer", playerName);
    }
  };

  const handleCellClick = (x, y) => {
    if (!playerName) return;

    const player = gameState.players[playerName];
    if (!player) return;

    // Check if player can claim this cell
    if (player.tokens < 10) {
      alert("Not enough tokens! Solve a riddle to earn more.");
      setShowRiddle(true);
      return;
    }

    // Attempt to claim the cell
    const newState = claimCell(gameState, x, y, playerName);

    // If state changed, update it
    if (newState !== gameState) {
      setGameState(newState);
    } else {
      // If the claim wasn't successful, explain why
      const cell = gameState.grid[y][x];

      if (cell.owner === playerName) {
        alert("You already own this cell!");
      } else if (cell.owner) {
        // Calculate power values
        const cellAge = (Date.now() - cell.timestamp) / 60000;
        const defenderPower = Math.min(10, Math.floor(cellAge) + 1);

        const playerLastAction = player.lastAction;
        const playerTimeSince = (Date.now() - playerLastAction) / 60000;
        const attackerPower = Math.min(10, Math.floor(playerTimeSince) + 1);

        alert(
          `You need more power to claim this cell! Your power: ${attackerPower}, Cell power: ${defenderPower}`
        );
      } else {
        alert("You can only expand to adjacent cells!");
      }
    }
  };

  const handleRiddleAnswer = (tokens) => {
    setGameState(addTokens(gameState, playerName, tokens));
  };

  if (!playerName) {
    return (
      <div className="max-w-md mx-auto my-8 p-4 bg-white shadow rounded">
        <h2 className="text-2xl font-bold mb-4">Enter Your Name</h2>
        <form onSubmit={handleNameSubmit}>
          <input
            type="text"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            className="w-full p-2 border rounded mb-4"
            placeholder="Your name"
          />
          <button
            type="submit"
            className="w-full p-2 bg-blue-500 text-white rounded"
          >
            Start Playing
          </button>
        </form>
      </div>
    );
  }

  const player = gameState.players[playerName];

  return (
    <div className="container mx-auto my-4 px-2">
      <div className="bg-white shadow rounded p-4 mb-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Pixel Territory</h1>
            <div className="flex items-center mt-2">
              <div
                className="w-4 h-4 rounded-full mr-2"
                style={{ backgroundColor: player?.color }}
              ></div>
              <span className="font-medium">{playerName}</span>
            </div>
          </div>
          <div>
            <p>
              <span className="font-bold">Territories:</span>{" "}
              {player?.cellCount || 0}
            </p>
            <p>
              <span className="font-bold">Tokens:</span> {player?.tokens || 0}
            </p>
            <button
              onClick={() => setShowRiddle(true)}
              className="mt-2 px-4 py-1 bg-green-500 text-white rounded"
            >
              Solve Riddle for Tokens
            </button>
          </div>
        </div>
      </div>

      <TerritoryGrid
        gameState={gameState}
        playerName={playerName}
        onCellClick={handleCellClick}
      />

      <RiddleModal
        isOpen={showRiddle}
        onClose={() => setShowRiddle(false)}
        onCorrectAnswer={handleRiddleAnswer}
      />
    </div>
  );
};
