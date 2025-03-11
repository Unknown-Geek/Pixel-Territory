import React, { useEffect } from "react";
import { RetroButton } from "./RetroButton";
import { POWERUP_TYPES } from "../utils/powerupUtils";

/**
 * Modal for powerup activation and targeting
 *
 * @param {Object} props Component properties
 * @param {boolean} props.isOpen Whether the modal is visible
 * @param {Object} props.powerupType Type of powerup being activated
 * @param {Function} props.onClose Handler for closing the modal
 * @param {Function} props.onActivate Handler for activating the powerup
 * @param {Function} props.onTargetSelect Handler for target selection
 * @param {boolean} props.resetActive Whether a game reset is happening
 */
export const PowerupActivator = ({
  isOpen,
  powerupType,
  onClose,
  onActivate,
  onTargetSelect,
  resetActive = false,
}) => {
  useEffect(() => {
    // When reset is active, make sure powerups are available
    if (resetActive && onActivate) {
      onActivate();
    }
  }, [resetActive, onActivate]);

  if (!isOpen || !powerupType) return null;

  const powerupInfo = POWERUP_TYPES[powerupType.toUpperCase()] || {
    name: powerupType,
    description: "Unknown powerup",
    icon: "❓",
    color: "#999",
    targetInstructions: "Select a target",
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="retro-container max-w-md w-full animate-rise"
        style={{
          borderColor: powerupInfo.color,
          boxShadow: `0 0 20px ${powerupInfo.color}`,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center mr-4 text-xl"
            style={{
              backgroundColor: powerupInfo.color,
              boxShadow: `0 0 10px ${powerupInfo.color}`,
            }}
          >
            {powerupInfo.icon}
          </div>
          <h3 className="text-xl">{powerupInfo.name}</h3>
        </div>

        <p className="mb-6 text-[var(--retro-secondary)]">
          {powerupInfo.description}
        </p>

        <div className="p-3 mb-6 bg-[var(--retro-black)] text-center">
          <p className="text-[var(--retro-highlight)]">
            {powerupInfo.targetInstructions || "Select a target on the grid"}
          </p>
        </div>

        <div className="flex justify-between">
          <RetroButton onClick={onClose}>CANCEL</RetroButton>

          <RetroButton
            variant="accent"
            onClick={() => onTargetSelect(powerupType)}
          >
            CONTINUE
          </RetroButton>
        </div>
      </div>
    </div>
  );
};

export default PowerupActivator;
