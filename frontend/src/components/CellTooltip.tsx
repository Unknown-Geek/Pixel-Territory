import React from "react";

/**
 * Cell information tooltip component
 * @param {object} props Component properties
 * @param {object} props.cellData Data about the current cell
 * @param {object} props.gameState Current game state
 * @param {string} props.playerName Current player name
 * @param {number} props.attackerPower Power of current player
 * @param {number} props.successProbability Probability of successful capture
 * @param {boolean} props.show Whether tooltip should be displayed
 * @param {object} props.position Position for the tooltip
 */
export const CellTooltip = ({
  cellData,
  gameState,
  playerName,
  attackerPower,
  successProbability,
  show,
  position = { x: 0, y: 0 },
}) => {
  if (!show) return null;

  // Format the timestamp for display
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return "Unknown";
    return (
      new Date(timestamp).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      }) +
      ", " +
      new Date(timestamp).toLocaleDateString()
    );
  };

  // Get probability class based on success chance
  const getProbabilityClass = (probability) => {
    if (!probability) return "";
    if (probability > 0.7) return "text-green-400";
    if (probability > 0.4) return "text-yellow-400";
    return "text-red-400";
  };

  // Calculate time since capture
  const getTimeSince = (timestamp) => {
    if (!timestamp) return "";

    const minutes = Math.floor((Date.now() - timestamp) / 60000);
    if (minutes < 60) return `${minutes}m ago`;

    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;

    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  return (
    <div
      className="cell-tooltip"
      style={{
        left: `${position.x + 10}px`,
        top: `${position.y - 10}px`,
      }}
    >
      {cellData.owner ? (
        <>
          <div className="mb-1 flex items-center">
            <span
              className="inline-block w-3 h-3 rounded-full mr-1"
              style={{
                backgroundColor:
                  gameState.players[cellData.owner]?.color || "#999",
                boxShadow: `0 0 4px ${
                  gameState.players[cellData.owner]?.color || "#999"
                }`,
              }}
            ></span>
            <span className="font-bold">{cellData.owner}</span>
          </div>

          <div className="mb-1 flex justify-between">
            <span>Power:</span>
            <span className="font-bold">{cellData.power || 0}</span>
          </div>

          {cellData.timestamp && (
            <div className="mb-1 text-[var(--retro-secondary)] text-xs flex justify-between">
              <span>Captured:</span>
              <span>{getTimeSince(cellData.timestamp)}</span>
            </div>
          )}

          {cellData.shielded && (
            <div className="text-[var(--retro-accent)] flex items-center mb-1">
              <span className="mr-1">🛡️</span>
              <span>Protected</span>
            </div>
          )}

          {playerName && cellData.owner !== playerName && attackerPower && (
            <div className="mt-2 border-t border-[var(--retro-shadow)] pt-1">
              <div className="mb-1 flex justify-between">
                <span>Your Power:</span>
                <span className="font-bold">{attackerPower}</span>
              </div>

              {typeof successProbability === "number" && (
                <div
                  className={`font-bold ${getProbabilityClass(
                    successProbability
                  )}`}
                >
                  Success: {Math.round(successProbability * 100)}%
                </div>
              )}
            </div>
          )}
        </>
      ) : (
        <div className="text-center">Unclaimed Territory</div>
      )}
    </div>
  );
};

export default CellTooltip;
