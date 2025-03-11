import React from "react";
import { PowerupDisplay } from "./PowerupDisplay";

// Import or redefine the Powerup interface to match Game.tsx
interface Powerup {
  type: string;
  id?: string;
  timestamp?: number;
}

interface PowerupInventoryProps {
  playerPowerups: Powerup[];
  onActivatePowerup: (powerupType: string) => void;
}

/**
 * Display and manage player's powerup inventory
 *
 * @param {Object} props Component properties
 * @param {Array} props.playerPowerups Array of player powerups
 * @param {Function} props.onActivatePowerup Handler for powerup activation
 */
export const PowerupInventory: React.FC<PowerupInventoryProps> = ({
  playerPowerups,
  onActivatePowerup,
}) => {
  // Group powerups by type for display
  const powerupsByType = playerPowerups.reduce((acc, powerup) => {
    if (!acc[powerup.type]) {
      acc[powerup.type] = [];
    }
    acc[powerup.type].push(powerup);
    return acc;
  }, {} as Record<string, Powerup[]>);

  return (
    <div className="max-w-3xl mx-auto mt-4 p-3 bg-[var(--retro-black)] border border-[var(--retro-shadow)] rounded">
      <h3 className="text-sm mb-3 text-[var(--retro-highlight)]">POWER-UPS</h3>

      {Object.keys(powerupsByType).length > 0 ? (
        <div className="flex items-center justify-center flex-wrap gap-4">
          {Object.entries(powerupsByType).map(([type, powerups]) => (
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

      {Object.keys(powerupsByType).length > 0 && (
        <div className="text-xs text-center mt-4 text-[var(--retro-secondary)]">
          Click a power-up to activate it
        </div>
      )}
    </div>
  );
};

export default PowerupInventory;
