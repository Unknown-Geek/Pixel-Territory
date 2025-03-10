import React, { useState } from "react";
import { PowerupDisplay } from "./PowerupDisplay";
import { POWERUP_TYPES } from "../utils/powerupUtils";

/**
 * Display and manage player's powerup inventory
 *
 * @param {Object} props Component properties
 * @param {Array} props.playerPowerups Array of player powerups
 * @param {Function} props.onActivatePowerup Handler for powerup activation
 */
export const PowerupInventory = ({
  playerPowerups = [],
  onActivatePowerup,
}) => {
  // Group powerups by type
  const groupedPowerups = playerPowerups.reduce((acc, powerup) => {
    if (!acc[powerup.type]) {
      acc[powerup.type] = [];
    }
    acc[powerup.type].push(powerup);
    return acc;
  }, {});

  return (
    <div className="max-w-3xl mx-auto mt-4 p-3 bg-[var(--retro-black)] border border-[var(--retro-shadow)] rounded">
      <h3 className="text-sm mb-3 text-[var(--retro-highlight)]">POWER-UPS</h3>

      {Object.keys(groupedPowerups).length > 0 ? (
        <div className="flex items-center justify-center flex-wrap gap-4">
          {Object.entries(groupedPowerups).map(([type, powerups]) => (
            <div key={type} className="text-center">
              <PowerupDisplay
                type={type}
                count={powerups.length}
                size="md"
                onClick={() => onActivatePowerup(type)}
              />
              <div className="text-xs mt-1 text-[var(--retro-secondary)]">
                {powerups.length > 1 ? `${powerups.length}×` : ""} {type}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-4 text-[var(--retro-secondary)] text-sm">
          No power-ups available. Find them on the grid or earn them!
        </div>
      )}

      {Object.keys(groupedPowerups).length > 0 && (
        <div className="text-xs text-center mt-4 text-[var(--retro-secondary)]">
          Click a power-up to activate it
        </div>
      )}
    </div>
  );
};

export default PowerupInventory;
