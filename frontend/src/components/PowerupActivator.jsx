import React from "react";
import { RetroButton } from "./RetroButton";
import { POWERUP_TYPES } from "../utils/powerupUtils";

export const PowerupActivator = ({
  isOpen,
  powerupType,
  onClose,
  onActivate,
  onTargetSelect,
}) => {
  if (!isOpen || !powerupType) return null;

  const powerupInfo = POWERUP_TYPES[powerupType.toUpperCase()];

  const handleClick = () => {
    if (
      powerupType === "teleport" ||
      powerupType === "bomb" ||
      powerupType === "colorBomb"
    ) {
      onTargetSelect(powerupType);
      onClose();
    } else {
      onActivate(powerupType);
      onClose();
    }
  };

  return (
    <div className="retro-modal-backdrop">
      <div
        className="retro-container relative max-w-md w-full"
        style={{
          backgroundColor: `${powerupInfo?.color}22` || "var(--retro-black)",
        }}
      >
        <button onClick={onClose} className="retro-close">
          &times;
        </button>

        <div className="flex items-center mb-4">
          <span className="text-4xl mr-3">{powerupInfo?.icon || "?"}</span>
          <h2 className="text-xl">{powerupInfo?.name || "Power-up"}</h2>
        </div>

        <p className="mb-6 text-[var(--retro-secondary)]">
          {powerupInfo?.description ||
            "This power-up gives you special abilities."}
        </p>

        {powerupType === "teleport" && (
          <div className="bg-[var(--retro-black)] p-3 mb-6 rounded border border-[var(--retro-accent)]">
            <p className="text-[var(--retro-accent)]">
              Select any cell on the grid to claim it, even if it's not adjacent
              to your territory.
            </p>
          </div>
        )}

        {powerupType === "bomb" && (
          <div className="bg-[var(--retro-black)] p-3 mb-6 rounded border border-[var(--retro-accent)]">
            <p className="text-[var(--retro-accent)]">
              Select a target cell. The bomb will claim a 3×3 area centered on
              your target.
            </p>
          </div>
        )}

        {powerupType === "colorBomb" && (
          <div className="bg-[var(--retro-black)] p-3 mb-6 rounded border border-[var(--retro-accent)]">
            <p className="text-[var(--retro-accent)]">
              Select a target cell. The color bomb will convert all adjacent
              enemy territories to your color.
            </p>
          </div>
        )}

        {powerupType === "shield" && (
          <div className="bg-[var(--retro-black)] p-3 mb-6 rounded border border-[var(--retro-accent)]">
            <p className="text-[var(--retro-accent)]">
              Select one of your territories to protect it for 5 minutes.
            </p>
          </div>
        )}

        <div className="flex justify-end gap-2">
          <RetroButton onClick={onClose}>CANCEL</RetroButton>
          <RetroButton onClick={handleClick} variant="accent">
            {powerupType === "teleport" ||
            powerupType === "bomb" ||
            powerupType === "colorBomb"
              ? "SELECT TARGET"
              : "ACTIVATE"}
          </RetroButton>
        </div>
      </div>
    </div>
  );
};
