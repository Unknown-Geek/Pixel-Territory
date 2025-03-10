import React, { useState } from "react";
import { canClaimCell, isAlly } from "../utils/gameState";
import {
  isPowerupAt,
  getPowerupAt,
  POWERUP_TYPES,
  hasActiveShield,
} from "../utils/powerupUtils";

export const TerritoryGrid = ({
  gameState,
  playerName,
  onCellClick,
  isPowerupTargetMode,
  powerupType,
}) => {
  const [hoverPosition, setHoverPosition] = useState(null);

  const handleCellHover = (x, y) => {
    setHoverPosition({ x, y });
  };

  const handleCellLeave = () => {
    setHoverPosition(null);
  };

  const renderCell = (cell, x, y) => {
    const isHovering =
      hoverPosition && hoverPosition.x === x && hoverPosition.y === y;
    const canClaim = playerName && canClaimCell(gameState, x, y, playerName);

    const player = gameState.players[playerName];
    let attackerPower = 0;
    if (player) {
      const playerTimeSince = Math.floor(
        (Date.now() - player.lastAction) / 60000
      );
      attackerPower = Math.min(10, playerTimeSince + 1);
    }

    // Calculate cell power - properly handle when timestamp is missing
    let defenderPower = 0;
    if (cell.owner && cell.timestamp) {
      const cellAge = Math.floor((Date.now() - cell.timestamp) / 60000);
      defenderPower = Math.min(10, cellAge + 1); // Cap at 10, start at 1
    }

    const canAttack = attackerPower > defenderPower;
    const isAlliedCell =
      cell.owner && isAlly(gameState, playerName, cell.owner);

    // Check if this cell has a powerup
    const hasPowerup = isPowerupAt(gameState, x, y);
    const powerup = hasPowerup ? getPowerupAt(gameState, x, y) : null;
    const powerupObject = powerup
      ? POWERUP_TYPES[powerup.type.toUpperCase()]
      : null;

    // Check if this cell has an active shield
    const hasShield = hasActiveShield(cell);

    // Special highlighting for power-up target mode
    let targetModeClass = "";
    if (isPowerupTargetMode) {
      if (powerupType === "shield") {
        // For shield, highlight only player's own cells
        if (cell.owner === playerName) {
          targetModeClass =
            "border-2 border-[var(--retro-accent)] power-up-target";
        } else {
          targetModeClass = "opacity-50";
        }
      } else if (powerupType === "teleport") {
        // For teleport, all cells are valid targets
        targetModeClass =
          "border-2 border-[var(--retro-accent)] power-up-target";
      } else if (powerupType === "bomb" || powerupType === "colorBomb") {
        // For bomb and colorBomb, any cell can be a target
        targetModeClass =
          "border-2 border-[var(--retro-accent)] power-up-target";
      }
    }

    // Determine border color based on state
    let borderClass = isPowerupTargetMode
      ? targetModeClass
      : "border border-gray-200";
    if (isHovering && !isPowerupTargetMode) {
      if (canClaim && (!cell.owner || (canAttack && !isAlliedCell))) {
        borderClass = "border-2 border-yellow-400";
      } else if (isAlliedCell) {
        borderClass = "border-2 border-[var(--retro-success)]";
      } else {
        borderClass = "border-2 border-red-400";
      }
    }

    // Apply alliance indicators when viewing cells
    const allianceIndicator = isAlliedCell ? "alliance-cell" : "";

    // Preview effects for power-ups
    let powerupPreview = "";
    if (isHovering && isPowerupTargetMode) {
      if (powerupType === "bomb") {
        powerupPreview = "bomb-preview";
      } else if (powerupType === "colorBomb") {
        powerupPreview = "color-bomb-preview";
      }
    }

    return (
      <div
        key={`${x}-${y}`}
        className={`w-10 h-10 ${borderClass} ${allianceIndicator} ${powerupPreview} flex items-center justify-center relative cursor-pointer grid-cell`}
        style={{ backgroundColor: cell.color }}
        onClick={() => onCellClick(x, y)}
        onMouseEnter={() => handleCellHover(x, y)}
        onMouseLeave={handleCellLeave}
      >
        {/* Shield indicator */}
        {hasShield && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-xl opacity-80">🛡️</div>
          </div>
        )}

        {/* Power-up indicator */}
        {hasPowerup && (
          <div
            className="absolute inset-0 flex items-center justify-center animate-pulse"
            style={{
              backgroundColor: powerupObject ? powerupObject.color : "#ffffff",
              opacity: 0.7,
            }}
          >
            <div className="text-2xl">
              {powerupObject ? powerupObject.icon : "?"}
            </div>
          </div>
        )}

        {isAlliedCell && (
          <div className="absolute top-0 left-0 w-2 h-2 bg-[var(--retro-success)] rounded-full"></div>
        )}

        {cell.owner && !hasPowerup && (
          <div className="absolute bottom-0 right-0 text-xs bg-black bg-opacity-70 text-white px-1 rounded-tl">
            {defenderPower}
          </div>
        )}

        {/* Power-up targeting preview */}
        {isPowerupTargetMode &&
          isHovering &&
          (powerupType === "bomb" ? (
            <div className="absolute inset-0 bg-[var(--retro-error)] opacity-30 z-10"></div>
          ) : powerupType === "colorBomb" &&
            cell.owner &&
            cell.owner !== playerName ? (
            <div className="absolute inset-0 bg-[var(--retro-complement)] opacity-30 z-10"></div>
          ) : null)}

        {isHovering && (
          <div className="absolute -top-10 left-0 bg-black text-white p-1 rounded text-xs z-20 whitespace-nowrap">
            {hasPowerup ? (
              <>
                <span className="text-[var(--retro-complement)]">
                  {powerupObject?.name || "Power-up"}
                </span>
              </>
            ) : cell.owner ? (
              <>
                {`Owner: ${cell.owner}`}
                {hasShield ? " 🛡️ Protected" : ` (Power: ${defenderPower})`}
                {cell.owner !== playerName && ` | Your Power: ${attackerPower}`}
                {isAlliedCell && " | 🤝 Allied"}
              </>
            ) : (
              "Unclaimed"
            )}

            {isPowerupTargetMode && (
              <span className="ml-2 text-[var(--retro-accent)]">
                {powerupType === "shield" &&
                  cell.owner === playerName &&
                  "✓ Valid target"}
                {powerupType === "shield" &&
                  cell.owner !== playerName &&
                  "✗ Not your territory"}
                {powerupType === "teleport" && "✓ Valid target"}
                {powerupType === "bomb" && "✓ Valid target"}
                {powerupType === "colorBomb" && "✓ Valid target"}
              </span>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="grid grid-cols-20 gap-0 mx-auto my-4 max-w-fit retro-container">
      {gameState.grid.map((row, y) =>
        row.map((cell, x) => renderCell(cell, x, y))
      )}
    </div>
  );
};
