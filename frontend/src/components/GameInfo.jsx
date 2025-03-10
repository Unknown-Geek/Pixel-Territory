import React from "react";
import { POWERUP_TYPES } from "../utils/powerupUtils";

export const GameInfo = () => {
  return (
    <div className="mt-6 retro-container p-4 max-w-3xl mx-auto">
      <h2 className="retro-header mb-4" data-text="HOW TO PLAY">
        HOW TO PLAY
      </h2>
      <div className="space-y-2 text-[var(--retro-secondary)]">
        <p>
          • Claim territory by clicking on cells adjacent to your existing
          territory.
        </p>
        <p>• Build the largest empire to win!</p>
        <p>• Game resets daily at midnight UTC.</p>
        <p>• Power increases over time (1 point per minute, max 10)</p>
        <p>• Collect power-ups to gain special abilities</p>
      </div>

      <h3 className="retro-header mt-6 mb-3" data-text="POWER-UPS">
        POWER-UPS
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {Object.values(POWERUP_TYPES).map((powerup) => (
          <div
            key={powerup.id}
            className="power-up-item flex items-start gap-2 p-2"
          >
            <div className="text-2xl mt-1">{powerup.icon}</div>
            <div>
              <div className="text-[var(--retro-highlight)] mb-1">
                {powerup.name}
              </div>
              <div className="text-xs text-[var(--retro-secondary)]">
                {powerup.description}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
