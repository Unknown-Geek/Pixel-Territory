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
    <div className="max-w-3xl mx-auto mb-4">
      <div className="retro-container w-full overflow-hidden">
        <div className="flex justify-between items-center mb-4">
          <div className="text-sm">ACTIVE PLAYERS</div>
          <form onSubmit={handleAddPlayer} className="flex gap-2">
            <input
              type="text"
              value={newPlayerName}
              onChange={(e) => setNewPlayerName(e.target.value)}
              placeholder="ENTER NAME"
              className="p-2 bg-[var(--retro-black)] border-2 border-[var(--retro-primary)] text-[var(--retro-primary)] focus:border-[var(--retro-highlight)] outline-none w-full"
            />
            <button type="submit" className="retro-button">
              ADD
            </button>
          </form>
        </div>

        <div className="flex flex-wrap gap-2">
          {Object.entries(players).map(([name, data]) => (
            <div
              key={name}
              className={`flex items-center gap-2 p-2 border-2 ${
                name === currentPlayer
                  ? "border-[var(--retro-complement)] bg-[var(--retro-complement-dark)] text-[var(--retro-complement-light)]"
                  : "border-[var(--retro-secondary)]"
              } rounded cursor-pointer transition-all hover:border-[var(--retro-highlight)]`}
              onClick={() => onSelectPlayer(name)}
            >
              <span
                className="w-4 h-4 rounded-full border border-[var(--retro-shadow)]"
                style={{ backgroundColor: data.color }}
              />
              <span className="text-xs">{name}</span>
              <span className="text-xs ml-2">({data.tokens || 0})</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
