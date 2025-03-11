import React, { useState, useEffect, useRef } from "react";
import { canClaimCell, isAlly, getAdjacentCells } from "../utils/gameState";
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
  const [selectedCell, setSelectedCell] = useState(null);
  const [adjacentCells, setAdjacentCells] = useState([]);
  const [cellSize, setCellSize] = useState(36); // Default size
  const gridContainerRef = useRef(null);
  const gridRef = useRef(null);

  // Calculate optimal cell size based on container width
  useEffect(() => {
    const calculateCellSize = () => {
      if (!gridContainerRef.current) return;

      const containerWidth = gridContainerRef.current.clientWidth;
      // Account for container padding, borders, and scrollbar
      const availableWidth = containerWidth - 50; // Increased padding to account for border and padding

      // Calculate cell size that will fit exactly 20 cells with 1px gaps
      const optimalCellSize = Math.floor((availableWidth - 19) / 20); // 19px for gaps (1px × 19 gaps)

      // Ensure minimum and maximum size
      const newSize = Math.max(24, Math.min(optimalCellSize, 40));
      setCellSize(newSize);
    };

    calculateCellSize();

    // Recalculate on window resize
    window.addEventListener("resize", calculateCellSize);
    return () => window.removeEventListener("resize", calculateCellSize);
  }, []);

  // When a cell is selected, calculate adjacent cells for expansion visualization
  useEffect(() => {
    if (selectedCell && playerName) {
      const cells = getAdjacentCells(
        gameState,
        selectedCell.x,
        selectedCell.y,
        playerName
      );
      setAdjacentCells(cells);
    } else {
      setAdjacentCells([]);
    }
  }, [selectedCell, gameState, playerName]);

  const handleCellHover = (x, y) => {
    setHoverPosition({ x, y });
  };

  const handleCellLeave = () => {
    setHoverPosition(null);
  };

  const handleCellClick = (x, y, event) => {
    // If already selected, deselect it
    if (selectedCell && selectedCell.x === x && selectedCell.y === y) {
      setSelectedCell(null);
    } else {
      // If it's the player's cell, select it
      const cell = gameState.grid[y][x];
      if (cell.owner === playerName) {
        setSelectedCell({ x, y });
      } else {
        // For non-player cells, deselect current selection and pass click to parent
        setSelectedCell(null);
        onCellClick(x, y, event);
      }
    }
  };

  // Calculate success probability for attack
  const calculateSuccessProbability = (attackerPower, defenderPower) => {
    if (!defenderPower) return 1; // Unclaimed cells are 100% success
    if (attackerPower <= defenderPower) return 0;

    return Math.min(
      0.9,
      0.5 + (attackerPower - defenderPower) / (2 * Math.max(1, defenderPower))
    );
  };

  const renderCell = (cell, x, y) => {
    const isHovering =
      hoverPosition && hoverPosition.x === x && hoverPosition.y === y;
    const isSelected =
      selectedCell && selectedCell.x === x && selectedCell.y === y;
    const canClaim = playerName && canClaimCell(gameState, x, y, playerName);

    // Check if this cell is adjacent to the selected cell
    const isAdjacent = adjacentCells.some((c) => c.x === x && c.y === y);

    const player = gameState.players[playerName];
    let attackerPower = 0;
    if (player) {
      const playerTimeSince = Math.floor(
        (Date.now() - player.lastAction) / 60000
      );
      attackerPower = Math.min(10, playerTimeSince + 1);
    }

    // Calculate cell power
    let defenderPower = 0;
    if (cell.owner && cell.timestamp) {
      const cellAge = Math.floor((Date.now() - cell.timestamp) / 60000);
      defenderPower = Math.min(10, cellAge + 1);
    }

    const successProbability = calculateSuccessProbability(
      attackerPower,
      defenderPower
    );
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

    // Determine expansion probability visual indicator
    let expansionClass = "";
    if (isAdjacent && canClaim) {
      if (successProbability > 0.7) {
        expansionClass = "valid-expansion-high";
      } else if (successProbability > 0.4) {
        expansionClass = "valid-expansion-medium";
      } else if (successProbability > 0) {
        expansionClass = "valid-expansion-low";
      }
    }

    // Determine border color based on state
    let borderClass = isPowerupTargetMode
      ? targetModeClass
      : isSelected
      ? "border-2 border-[var(--retro-primary)] shadow-glow"
      : isAdjacent && canClaim
      ? "border-2 border-[var(--retro-accent)]"
      : "border border-gray-200";

    if (isHovering && !isPowerupTargetMode && !isSelected) {
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
        className={`grid-cell ${borderClass} ${allianceIndicator} ${powerupPreview} ${expansionClass} flex items-center justify-center relative cursor-pointer`}
        style={{
          backgroundColor: cell.color,
          width: `${cellSize}px`,
          height: `${cellSize}px`,
          boxSizing: "border-box", // Ensure border is included in width/height
        }}
        onClick={(event) => handleCellClick(x, y, event)}
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

        {/* Success probability indicator for adjacent cells */}
        {isAdjacent && canClaim && !hasPowerup && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div
              className={`text-sm font-bold ${
                successProbability > 0.7
                  ? "text-green-400"
                  : successProbability > 0.4
                  ? "text-yellow-400"
                  : "text-red-400"
              }`}
            >
              {Math.round(successProbability * 100)}%
            </div>
          </div>
        )}

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
                {cell.owner !== playerName &&
                  !isAlliedCell &&
                  ` | Success: ${Math.round(successProbability * 100)}%`}
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
    <div
      ref={gridContainerRef}
      className="mx-auto my-4 retro-container p-5 relative"
    >
      <div className="overflow-visible">
        <div
          ref={gridRef}
          className="grid gap-[1px] mx-auto"
          style={{
            gridTemplateColumns: `repeat(20, ${cellSize}px)`,
            width: `${cellSize * 20 + 19}px`, // Account for 1px gap between cells
            maxWidth: "100%", // Ensure it doesn't exceed container width
          }}
        >
          {gameState.grid.map((row, y) =>
            row.map((cell, x) => renderCell(cell, x, y))
          )}
        </div>
      </div>
      <style jsx>{`
        .shadow-glow {
          box-shadow: 0 0 10px var(--retro-primary);
        }
        .valid-expansion-high {
          animation: pulse-expansion-high 1.5s infinite;
        }
        .valid-expansion-medium {
          animation: pulse-expansion-medium 1.5s infinite;
        }
        .valid-expansion-low {
          animation: pulse-expansion-low 1.5s infinite;
        }
        @keyframes pulse-expansion-high {
          0%,
          100% {
            box-shadow: 0 0 5px var(--retro-success);
          }
          50% {
            box-shadow: 0 0 15px var(--retro-success);
          }
        }
        @keyframes pulse-expansion-medium {
          0%,
          100% {
            box-shadow: 0 0 5px var(--retro-complement);
          }
          50% {
            box-shadow: 0 0 15px var(--retro-complement);
          }
        }
        @keyframes pulse-expansion-low {
          0%,
          100% {
            box-shadow: 0 0 5px var(--retro-error);
          }
          50% {
            box-shadow: 0 0 15px var(--retro-error);
          }
        }
      `}</style>

      {/* Add global styles for tooltips */}
      <style jsx global>{`
        .grid-cell:hover .cell-tooltip {
          visibility: visible;
          opacity: 1;
        }

        .cell-tooltip {
          position: absolute;
          z-index: 1000;
          background-color: rgba(0, 0, 0, 0.9);
          color: white;
          padding: 8px;
          border-radius: 4px;
          font-size: 0.75rem;
          pointer-events: none;
          white-space: nowrap;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.5);
          border: 1px solid var(--retro-primary);
          max-width: 250px;
        }
      `}</style>
    </div>
  );
};
