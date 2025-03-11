import React, { useState, useEffect, useMemo } from "react";
import { RetroButton } from "./RetroButton";

export const Leaderboard = ({ players, currentPlayer }) => {
  const [sortBy, setSortBy] = useState("cellCount");
  const [sortDirection, setSortDirection] = useState("desc");
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // Auto-refresh the leaderboard every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setRefreshTrigger((prev) => prev + 1);
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  // Handle column sorting
  const handleSort = (field) => {
    if (field === sortBy) {
      // Toggle direction if already sorting by this field
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortDirection("desc"); // Default to descending for new sort
    }
  };

  // Convert players object to sortable array
  const playersList = Object.entries(players).map(([name, data]) => ({
    name,
    ...data,
    power: data.lastAction
      ? Math.min(10, Math.floor((Date.now() - data.lastAction) / 60000) + 1)
      : 1,
  }));

  // Sort players based on current sort settings
  const sortedPlayers = useMemo(() => {
    const playerArray = Object.entries(players).map(([name, data]) => ({
      name,
      ...data,
    }));

    return playerArray.sort((a, b) => {
      const valueA = a[sortBy] || 0;
      const valueB = b[sortBy] || 0;

      return sortDirection === "asc" ? valueA - valueB : valueB - valueA;
    });
  }, [players, sortBy, sortDirection, refreshTrigger]);

  const handleResetGame = () => {
    // Reset game state in localStorage
    localStorage.removeItem("pixelTerritoryState");
    // Reload the page to initialize with fresh state
    window.location.reload();
  };

  return (
    <div className="retro-container">
      <div className="flex justify-between items-center mb-4">
        <h2 className="retro-header" data-text="LEADERBOARD">
          LEADERBOARD
        </h2>
        <span className="text-xs text-[var(--retro-secondary)]">
          Auto-updates every 30s
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="text-left p-2 text-xs">RANK</th>
              <th className="text-left p-2 text-xs">PLAYER</th>
              <th
                className={`text-right p-2 text-xs cursor-pointer hover:text-[var(--retro-accent)] ${
                  sortBy === "cellCount" ? "text-[var(--retro-accent)]" : ""
                }`}
                onClick={() => handleSort("cellCount")}
              >
                TERRITORIES{" "}
                {sortBy === "cellCount" &&
                  (sortDirection === "asc" ? "▲" : "▼")}
              </th>
              <th
                className={`text-right p-2 text-xs cursor-pointer hover:text-[var(--retro-accent)] ${
                  sortBy === "power" ? "text-[var(--retro-accent)]" : ""
                }`}
                onClick={() => handleSort("power")}
              >
                POWER{" "}
                {sortBy === "power" && (sortDirection === "asc" ? "▲" : "▼")}
              </th>
              <th
                className={`text-right p-2 text-xs cursor-pointer hover:text-[var(--retro-accent)] ${
                  sortBy === "captures" ? "text-[var(--retro-accent)]" : ""
                }`}
                onClick={() => handleSort("captures")}
              >
                CAPTURES{" "}
                {sortBy === "captures" && (sortDirection === "asc" ? "▲" : "▼")}
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedPlayers.map((player, index) => (
              <tr
                key={player.name}
                className={`
                  ${
                    player.name === currentPlayer
                      ? "bg-[var(--retro-primary)] bg-opacity-25 border-l-4 border-l-[var(--retro-primary)]" // Added border for better indication
                      : index % 2 === 0
                      ? "bg-[var(--retro-black)]"
                      : "bg-[var(--retro-shadow)] bg-opacity-30"
                  }
                  border-b border-[var(--retro-shadow)]
                `}
              >
                <td className="p-2">#{index + 1}</td>
                <td className="p-2 flex items-center">
                  <span
                    className="w-3 h-3 rounded-full inline-block mr-2"
                    style={{
                      backgroundColor: player.color,
                      boxShadow:
                        player.name === currentPlayer
                          ? `0 0 8px ${player.color}`
                          : "none",
                    }}
                  ></span>
                  <span
                    className={
                      player.name === currentPlayer
                        ? "font-bold text-[var(--retro-highlight)]"
                        : ""
                    } // Changed text color for current player
                  >
                    {player.name}
                    {player.name === currentPlayer && (
                      <span className="text-xs text-[var(--retro-complement)] ml-2 bg-[var(--retro-black)] px-1 py-0.5 rounded">
                        (YOU)
                      </span> // Added background to "YOU" label
                    )}
                  </span>
                </td>
                <td className="text-right p-2 text-[var(--retro-highlight)]">
                  {player.cellCount || 0}
                </td>
                <td className="text-right p-2">
                  <div className="flex items-center justify-end">
                    <div className="bg-[var(--retro-shadow)] h-2 w-12 mr-1 rounded-sm overflow-hidden">
                      <div
                        className="h-full bg-[var(--retro-accent)]"
                        style={{ width: `${(player.power / 10) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-[var(--retro-highlight)] power-level">
                      {player.power}
                    </span>
                  </div>
                </td>
                <td className="text-right p-2 text-[var(--retro-highlight)]">
                  {player.captures || 0}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 text-center text-xs text-[var(--retro-secondary)]">
        <p>Rankings update as territories change</p>
        <div className="flex justify-center gap-3 mt-2">
          <button
            className="text-[var(--retro-accent)] hover:underline"
            onClick={() => setRefreshTrigger((prev) => prev + 1)}
          >
            Refresh Now
          </button>
          <button
            className="text-[var(--retro-error)] hover:underline"
            onClick={() => setShowResetConfirm(true)}
          >
            Reset Game
          </button>
        </div>
      </div>

      {/* Reset game confirmation dialog */}
      {showResetConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="retro-container max-w-sm w-full">
            <h3 className="text-[var(--retro-error)] text-lg mb-3">
              Reset Game?
            </h3>
            <p className="text-[var(--retro-secondary)] mb-4">
              This will delete all game progress and reset everything to
              default. This action cannot be undone.
            </p>
            <div className="flex justify-between gap-3">
              <button
                className="retro-button border-[var(--retro-secondary)] text-[var(--retro-secondary)]"
                onClick={() => setShowResetConfirm(false)}
              >
                CANCEL
              </button>
              <button
                className="retro-button border-[var(--retro-error)] text-[var(--retro-error)]"
                onClick={handleResetGame}
              >
                RESET GAME
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Leaderboard;
