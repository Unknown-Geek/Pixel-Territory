import React, { useState } from "react";
import { POWERUP_TYPES } from "../utils/powerupUtils";
import { RetroButton } from "./RetroButton";

export const PowerupInventory = ({
  playerPowerups = [],
  onActivatePowerup,
}) => {
  const [selectedPowerup, setSelectedPowerup] = useState(null);

  // Group powerups by type for easier display
  const powerupsByType = playerPowerups.reduce((acc, powerup) => {
    if (!acc[powerup.type]) {
      acc[powerup.type] = [];
    }
    acc[powerup.type].push(powerup);
    return acc;
  }, {});

  const handleActivate = (powerupType) => {
    setSelectedPowerup(powerupType);
    onActivatePowerup(powerupType);
  };

  if (playerPowerups.length === 0) {
    return (
      <div className="retro-container mt-4 p-4">
        <h2 className="retro-header mb-4" data-text="POWER-UPS">
          POWER-UPS
        </h2>
        <p className="text-[var(--retro-secondary)]">
          No power-ups in your inventory. Claim cells with power-ups to collect
          them.
        </p>
      </div>
    );
  }

  return (
    <div className="retro-container mt-4 p-4">
      <h2 className="retro-header mb-4" data-text="POWER-UPS">
        POWER-UPS
      </h2>

      <div className="flex flex-wrap gap-3">
        {Object.entries(powerupsByType).map(([type, powerups]) => {
          const powerupType = POWERUP_TYPES[type.toUpperCase()];
          if (!powerupType) return null;

          const count = powerups.length;

          return (
            <div
              key={type}
              className={`
                p-3 rounded border-2 flex flex-col items-center
                ${
                  selectedPowerup === type
                    ? "border-[var(--retro-complement)]"
                    : "border-[var(--retro-primary)]"
                }
                hover:border-[var(--retro-accent)] transition-all
              `}
              style={{
                backgroundColor: `${powerupType.color}22`, // Add transparency
              }}
            >
              <div className="flex items-center mb-2">
                <span className="text-2xl mr-2">{powerupType.icon}</span>
                <span className="text-[var(--retro-highlight)]">
                  {powerupType.name}
                </span>
                <span className="ml-2 text-[var(--retro-complement)] font-bold">
                  ×{count}
                </span>
              </div>

              <div className="text-xs text-center mb-3 text-[var(--retro-secondary)]">
                {powerupType.description}
              </div>

              <RetroButton
                variant="accent"
                onClick={() => handleActivate(type)}
                className="text-xs py-1 px-2"
              >
                USE POWER-UP
              </RetroButton>
            </div>
          );
        })}
      </div>
    </div>
  );
};
