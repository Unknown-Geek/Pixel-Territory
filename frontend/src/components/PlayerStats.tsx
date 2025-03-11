import React from "react";
import { RetroButton } from "./RetroButton";

export const PlayerStats = ({ player, playerName, history = [] }) => {
  if (!player) return null;

  // Format dates for display
  const formatDate = (timestamp) => {
    if (!timestamp) return "Unknown";
    const date = new Date(timestamp);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  return (
    <div className="retro-container">
      <h2
        className="retro-header mb-4 lg:text-xl md:text-lg sm:text-base text-sm"
        data-text="TERRITORY STATS"
      >
        TERRITORY STATS
      </h2>

      <div
        className="p-2 md:p-4"
        style={{ backgroundColor: "rgba(0,0,0,0.3)" }}
      >
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2 sm:gap-0">
          <div
            className="text-base sm:text-xl font-bold p-2"
            style={{
              backgroundColor: player.color,
              color: "#000",
              boxShadow: `0 0 10px ${player.color}`,
            }}
          >
            {playerName}
          </div>
          <div className="px-3 py-2 bg-[var(--retro-shadow)]">
            <span className="text-[var(--retro-complement)]">
              {player.tokens}
            </span>{" "}
            TOKENS
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="p-2 md:p-3 border border-[var(--retro-primary)] text-center">
            <div className="text-xl md:text-3xl text-[var(--retro-primary)]">
              {player.cellCount || 0}
            </div>
            <div className="mt-1 text-xs">TERRITORIES</div>
          </div>

          <div className="p-2 md:p-3 border border-[var(--retro-accent)] text-center">
            <div className="text-xl md:text-3xl text-[var(--retro-accent)]">
              {player.captures || 0}
            </div>
            <div className="mt-1 text-xs">CAPTURES</div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="p-2 md:p-3 border border-[var(--retro-secondary)] text-center">
            <div className="text-lg md:text-2xl text-[var(--retro-secondary)]">
              {player.losses || 0}
            </div>
            <div className="mt-1 text-[10px] sm:text-xs">LOSSES</div>
          </div>

          <div className="p-2 md:p-3 border border-[var(--retro-complement)] text-center">
            <div className="text-lg md:text-2xl text-[var(--retro-complement)]">
              {Math.floor((Date.now() - player.lastAction) / 60000) + 1}
            </div>
            <div className="mt-1 text-[10px] sm:text-xs">POWER</div>
          </div>
        </div>

        <div className="mt-6">
          <h3 className="text-xs mb-2 text-[var(--retro-highlight)]">
            TERRITORY HISTORY
          </h3>
          <div className="h-24 border border-[var(--retro-secondary)] p-2 relative">
            {history.length > 0 ? (
              <div className="flex h-full items-end">
                {history.map((value, index) => {
                  const maxValue = Math.max(...history);
                  const height = maxValue ? (value / maxValue) * 100 : 0;
                  return (
                    <div
                      key={index}
                      className="flex-1 bg-[var(--retro-primary)] mr-0.5 relative group"
                      style={{ height: `${height}%` }}
                    >
                      <div className="absolute bottom-full left-0 bg-black text-white text-xs p-1 opacity-0 group-hover:opacity-100 transform -translate-x-1/2 -translate-y-1 min-w-[40px] text-center">
                        {value}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-[var(--retro-secondary)]">
                No history data available
              </div>
            )}
          </div>
        </div>

        <div className="mt-4 text-xs text-right text-[var(--retro-secondary)]">
          Last Action: {formatDate(player.lastAction)}
        </div>
      </div>
    </div>
  );
};

export default PlayerStats;
