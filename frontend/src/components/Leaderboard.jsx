import React, { useState, useEffect } from "react";
import { RetroButton } from "./RetroButton";

export const Leaderboard = ({ players, currentPlayer }) => {
  const [sortBy, setSortBy] = useState("cellCount");
  const [sortDirection, setSortDirection] = useState("desc");
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
  // Auto-refresh the leaderboard every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setRefreshTrigger(prev => prev + 1);
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
      : 1
  }));
  
  // Sort players based on current sort settings
  const sortedPlayers = [...playersList].sort((a, b) => {
    let aVal = a[sortBy] || 0;
    let bVal = b[sortBy] || 0;
    
    // Special handling for some fields
    if (sortBy === "power") {
      aVal = a.lastAction 
        ? Math.min(10, Math.floor((Date.now() - a.lastAction) / 60000) + 1)
        : 1;
      bVal = b.lastAction 
        ? Math.min(10, Math.floor((Date.now() - b.lastAction) / 60000) + 1)
        : 1;
    }
    
    if (sortDirection === "asc") {
      return aVal - bVal;
    } else {
      return bVal - aVal;
    }
  });

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
                className={`text-right p-2 text-xs cursor-pointer hover:text-[var(--retro-accent)] ${sortBy === "cellCount" ? "text-[var(--retro-accent)]" : ""}`}
                onClick={() => handleSort("cellCount")}
              >
                TERRITORIES {sortBy === "cellCount" && (sortDirection === "asc" ? "▲" : "▼")}
              </th>
              <th 
                className={`text-right p-2 text-xs cursor-pointer hover:text-[var(--retro-accent)] ${sortBy === "power" ? "text-[var(--retro-accent)]" : ""}`}
                onClick={() => handleSort("power")}
              >
                POWER {sortBy === "power" && (sortDirection === "asc" ? "▲" : "▼")}
              </th>
              <th 
                className={`text-right p-2 text-xs cursor-pointer hover:text-[var(--retro-accent)] ${sortBy === "captures" ? "text-[var(--retro-accent)]" : ""}`}
                onClick={() => handleSort("captures")}
              >
                CAPTURES {sortBy === "captures" && (sortDirection === "asc" ? "▲" : "▼")}
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedPlayers.map((player, index) => (
              <tr 
                key={player.name} 
                className={`
                  ${player.name === currentPlayer 
                    ? "bg-[var(--retro-primary)] bg-opacity-20" 
                    : index % 2 === 0 ? "bg-[var(--retro-black)]" : "bg-[var(--retro-shadow)] bg-opacity-30"}
                  border-b border-[var(--retro-shadow)] hover:bg-opacity-30 hover:bg-[var(--retro-accent)] transition-colors
                `}
              >
                <td className="p-2">#{index + 1}</td>
                <td className="p-2 flex items-center">
                  <span 
                    className="w-3 h-3 rounded-full inline-block mr-2"
                    style={{ 
                      backgroundColor: player.color,
                      boxShadow: player.name === currentPlayer 
                        ? `0 0 8px ${player.color}` 
                        : "none"
                    }}
                  ></span>
                  <span className={player.name === currentPlayer ? "font-bold" : ""}>
                    {player.name}
                    {player.name === currentPlayer && (
                      <span className="text-xs text-[var(--retro-highlight)] ml-2">(YOU)</span>
                    )}
                  </span>
                </td>
                <td className="text-right p-2">{player.cellCount || 0}</td>
                <td className="text-right p-2">
                  <div className="flex items-center justify-end">
                    <div className="bg-[var(--retro-shadow)] h-2 w-12 mr-1 rounded-sm overflow-hidden">
                      <div 
                        className="h-full bg-[var(--retro-accent)]" 
                        style={{ width: `${(player.power / 10) * 100}%` }}
                      ></div>
                    </div>
                    {player.power}
                  </div>
                </td>
                <td className="text-right p-2">{player.captures || 0}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 text-center text-xs text-[var(--retro-secondary)]">
        <p>Rankings update as territories change</p>
        <button 
          className="mt-2 text-[var(--retro-accent)] hover:underline"
          onClick={() => setRefreshTrigger(prev => prev + 1)}
        >
          Refresh Now
        </button>
      </div>
    </div>
  );
};

export default Leaderboard;
