import React from "react";
import { POWERUP_TYPES } from "../utils/powerupUtils";

/**
 * Displays a powerup icon with count
 *
 * @param {Object} props Component properties
 * @param {string} props.type Powerup type (e.g. "shield", "bomb")
 * @param {number} props.count Number of powerups
 * @param {string} props.size Size variant ("sm", "md", "lg")
 */
export const PowerupDisplay = ({ type, count = 1, size = "md" }) => {
  const powerup = POWERUP_TYPES[type?.toUpperCase()] || {
    name: "Unknown",
    description: "Mystery powerup",
    icon: "❓",
    color: "#999",
  };

  // Define size classes
  const sizeClasses = {
    sm: "w-6 h-6 text-sm",
    md: "w-10 h-10 text-base",
    lg: "w-12 h-12 text-lg",
  };

  const iconSize = {
    sm: "text-xs",
    md: "text-base",
    lg: "text-xl",
  };

  const countStyle = {
    sm: "text-[8px] w-3 h-3 -top-1 -right-1",
    md: "text-[10px] w-4 h-4 -top-1 -right-1",
    lg: "text-xs w-5 h-5 -top-1 -right-1",
  };

  return (
    <div
      className={`relative flex items-center justify-center ${sizeClasses[size]}`}
      title={`${powerup.name}: ${powerup.description}`}
    >
      <div
        className={`flex items-center justify-center rounded-full ${iconSize[size]}`}
        style={{
          backgroundColor: powerup.color,
          boxShadow: `0 0 5px ${powerup.color}`,
          width: "100%",
          height: "100%",
        }}
      >
        {powerup.icon}
      </div>

      {count > 1 && (
        <div
          className={`absolute ${countStyle[size]} bg-[var(--retro-background)] text-white 
            rounded-full flex items-center justify-center font-bold z-10`}
        >
          {count}
        </div>
      )}
    </div>
  );
};

export default PowerupDisplay;
