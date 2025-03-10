import React from "react";
import { POWERUP_TYPES } from "../utils/powerupUtils";

/**
 * Displays a powerup icon with optional count
 * @param {Object} props Component properties
 * @param {string} props.type Powerup type
 * @param {number} props.count Number of this powerup
 * @param {string} props.size Size variant (sm, md, lg)
 * @param {boolean} props.showTooltip Whether to show tooltip on hover
 * @param {Function} props.onClick Click handler
 */
export const PowerupDisplay = ({
  type,
  count = 1,
  size = "md",
  showTooltip = true,
  onClick,
}) => {
  // Get powerup information
  const powerupType = type ? type.toUpperCase() : null;
  const powerupInfo =
    powerupType && POWERUP_TYPES[powerupType]
      ? POWERUP_TYPES[powerupType]
      : {
          name: type ? type.charAt(0).toUpperCase() + type.slice(1) : "Unknown",
          description: "Unknown powerup",
          icon: "❓",
          color: "#999999",
        };

  // Determine size class
  const sizeClass =
    {
      sm: "w-6 h-6 text-xs",
      md: "w-10 h-10 text-base",
      lg: "w-16 h-16 text-2xl",
    }[size] || "w-10 h-10 text-base";

  return (
    <div className="relative group">
      <div
        className={`${sizeClass} rounded-full flex items-center justify-center cursor-pointer
          transition-transform hover:scale-110 relative`}
        style={{
          backgroundColor: powerupInfo.color,
          boxShadow: `0 0 8px ${powerupInfo.color}`,
        }}
        onClick={onClick}
      >
        <span>{powerupInfo.icon}</span>
        {count > 1 && (
          <div className="absolute -top-1 -right-1 bg-black rounded-full w-5 h-5 flex items-center justify-center text-xs">
            {count}
          </div>
        )}
      </div>

      {showTooltip && (
        <div
          className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 bg-black 
          text-white p-2 rounded text-xs whitespace-nowrap z-10 opacity-0 group-hover:opacity-100 
          pointer-events-none transition-opacity"
        >
          <div className="font-bold mb-1">{powerupInfo.name}</div>
          <div>{powerupInfo.description}</div>
        </div>
      )}
    </div>
  );
};

export default PowerupDisplay;
