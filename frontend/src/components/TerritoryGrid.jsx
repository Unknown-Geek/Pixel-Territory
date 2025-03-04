import React, { useState } from "react";
import { canClaimCell } from "../utils/gameState";

export const TerritoryGrid = ({ gameState, playerName, onCellClick }) => {
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

    // Determine border color based on state
    let borderClass = "border border-gray-200";
    if (isHovering) {
      if (canClaim && (!cell.owner || canAttack)) {
        borderClass = "border-2 border-yellow-400";
      } else {
        borderClass = "border-2 border-red-400";
      }
    }

    return (
      <div
        key={`${x}-${y}`}
        className={`w-10 h-10 ${borderClass} flex items-center justify-center relative cursor-pointer`}
        style={{ backgroundColor: cell.color }}
        onClick={() => onCellClick(x, y)}
        onMouseEnter={() => handleCellHover(x, y)}
        onMouseLeave={handleCellLeave}
      >
        {cell.owner && (
          <div className="absolute bottom-0 right-0 text-xs bg-black bg-opacity-70 text-white px-1 rounded-tl">
            {defenderPower}
          </div>
        )}
        {isHovering && (
          <div className="absolute -top-10 left-0 bg-black text-white p-1 rounded text-xs z-10 whitespace-nowrap">
            {cell.owner ? `Owner: ${cell.owner}` : "Unclaimed"}
            {cell.owner && ` (Power: ${defenderPower})`}
            {cell.owner &&
              cell.owner !== playerName &&
              ` | Your Power: ${attackerPower}`}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="grid grid-cols-20 gap-0 mx-auto my-4 max-w-fit">
      {gameState.grid.map((row, y) =>
        row.map((cell, x) => renderCell(cell, x, y))
      )}
    </div>
  );
};
