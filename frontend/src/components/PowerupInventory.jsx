import React, { useState } from "react";
import { PowerupDisplay } from "./PowerupDisplay";
import { RetroButton } from "./RetroButton";
import { POWERUP_TYPES } from "../utils/powerupUtils";

/**
 * Displays and manages a player's powerup inventory
 *
 * @param {Object} props Component properties
 * @param {Array} props.powerups Array of powerup objects
 * @param {Function} props.onActivate Callback when powerup is activated
 */
export const PowerupInventory = ({ powerups = [], onActivate }) => {
  const [expandedInfo, setExpandedInfo] = useState(null);

  // Group powerups by type
  const groupedPowerups = powerups.reduce((acc, powerup) => {
    if (!acc[powerup.type]) {
      acc[powerup.type] = [];
    }
    acc[powerup.type].push(powerup);
    return acc;
  }, {});

  const handlePowerupClick = (powerupType) => {
    if (expandedInfo === powerupType) {
      setExpandedInfo(null);
    } else {
      setExpandedInfo(powerupType);
    }
  };

  const handleActivatePowerup = (powerup) => {
    onActivate(powerup);
    setExpandedInfo(null);
  };

  return (
    <div className="retro-container">
      <h2 className="retro-header mb-4" data-text="POWER-UPS">
        POWER-UPS
      </h2>

      {Object.keys(groupedPowerups).length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {Object.entries(groupedPowerups).map(([type, items]) => {
            const powerupInfo = POWERUP_TYPES[type.toUpperCase()] || {
              name: type,
              description: "Unknown powerup",
            };

            return (
              <div
                key={type}
                className={`p-2 border-2 rounded ${
                  expandedInfo === type
                    ? "border-[var(--retro-accent)]"
                    : "border-[var(--retro-shadow)]"
                }`}
              >
                <div
                  className="flex items-center cursor-pointer"
                  onClick={() => handlePowerupClick(type)}
                >
                  <PowerupDisplay type={type} count={items.length} />
                  <div className="ml-2 flex-grow">
                    <div className="font-bold text-sm">{powerupInfo.name}</div>
                    <div className="text-xs text-[var(--retro-secondary)]">
                      {items.length} available
                    </div>
                  </div>
                </div>

                {expandedInfo === type && (
                  <div className="mt-2 pt-2 border-t border-[var(--retro-shadow)]">
                    <p className="text-xs text-[var(--retro-secondary)] mb-2">
                      {powerupInfo.description}
                    </p>
                    <RetroButton
                      variant="accent"
                      fullWidth
                      onClick={() => handleActivatePowerup(items[0])}
                    >
                      ACTIVATE
                    </RetroButton>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-center text-[var(--retro-secondary)] p-4">
          No power-ups available. Earn them by capturing territories!
        </p>
      )}
    </div>
  );
};

export default PowerupInventory;
