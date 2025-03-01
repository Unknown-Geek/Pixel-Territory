import React, { useState } from "react";
import { generateUniqueColor } from "../utils/colors";

export const PlayerSelector = ({
  players,
  currentPlayer,
  onSelectPlayer,
  onAddPlayer,
}) => {
  const [newPlayerName, setNewPlayerName] = useState("");

  const handleAddPlayer = (e) => {
    e.preventDefault();
    if (!newPlayerName.trim()) return;

    const existingColors = Object.values(players).map((p) => p.color);
    const newColor = generateUniqueColor(existingColors);

    onAddPlayer(newPlayerName, newColor);
    setNewPlayerName("");
  };

  return (
    <div className="max-w-3xl mx-auto bg-white p-4 rounded-lg shadow mb-4">
      <div className="flex items-center gap-4 mb-4">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Select Player
          </label>
          <select
            value={currentPlayer}
            onChange={(e) => onSelectPlayer(e.target.value)}
            className="w-full p-2 border rounded-md"
          >
            {Object.keys(players).map((playerName) => (
              <option key={playerName} value={playerName}>
                {playerName}
              </option>
            ))}
          </select>
        </div>
        <form onSubmit={handleAddPlayer} className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Add New Player
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={newPlayerName}
              onChange={(e) => setNewPlayerName(e.target.value)}
              placeholder="Enter player name"
              className="flex-1 p-2 border rounded-md"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              Add
            </button>
          </div>
        </form>
      </div>
      <div className="flex flex-wrap gap-2">
        {Object.entries(players).map(([name, data]) => (
          <div
            key={name}
            className="flex items-center gap-2 bg-gray-100 px-3 py-1 rounded-full"
          >
            <span
              className="w-4 h-4 rounded-full"
              style={{ backgroundColor: data.color }}
            />
            <span>{name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
