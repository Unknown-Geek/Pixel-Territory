import React from "react";
import { POWERUP_TYPES } from "../utils/powerupUtils";

/**
 * Displays a single power-up with icon and optional count
 */
export const PowerupDisplay = ({ type, count = 1, size = "md" }) => {
  const powerupType = POWERUP_TYPES[type.toUpperCase()];
  if (!powerupType) return null;

  const sizeClasses = {
    sm: "w-6 h-6 text-sm",
    md: "w-8 h-8 text-base",
    lg: "w-12 h-12 text-xl",
  };

  return (
    <div
      className={`relative flex items-center justify-center rounded-full ${sizeClasses[size]}`}
      style={{
        backgroundColor: powerupType.color + "33", // Add transparency
        boxShadow: `0 0 5px ${powerupType.color}`,
      }}
    >
      <span className="z-10">{powerupType.icon}</span>
      {count > 1 && (
        <span className="absolute -top-1 -right-1 bg-[var(--retro-complement)] text-black text-xs rounded-full w-4 h-4 flex items-center justify-center">
          {count}
        </span>
      )}
    </div>
  );
};
