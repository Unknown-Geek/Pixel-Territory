import React from "react";
import { RetroButton } from "./RetroButton";

/**
 * Dialog for confirming territory claims and attacks
 * @param {Object} props Component properties
 * @param {boolean} props.isOpen Whether the dialog is visible
 * @param {Object} props.targetCell Data about the cell being claimed/attacked
 * @param {Object} props.sourceCell Data about the cell initiating the claim
 * @param {string} props.playerName Current player name
 * @param {number} props.cost Token cost for claiming
 * @param {number} props.playerTokens Current player token count
 * @param {Function} props.onConfirm Handler for confirmation
 * @param {Function} props.onCancel Handler for cancellation
 */
export const ClaimConfirmationDialog = ({
  isOpen,
  targetCell,
  sourceCell,
  playerName,
  cost = 10,
  playerTokens = 0,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen || !targetCell) return null;

  const isAttack = !!targetCell.owner;
  const attackerPower = sourceCell ? sourceCell.power || 1 : 1;
  const defenderPower = targetCell.power || 0;
  const notEnoughTokens = playerTokens < cost;

  // Calculate success probability
  const successProbability = isAttack
    ? Math.min(
        0.9,
        0.5 + (attackerPower - defenderPower) / (2 * Math.max(1, defenderPower))
      )
    : 1.0; // 100% for unclaimed cells

  // Format probability as percentage
  const successPercentage = Math.round(successProbability * 100);

  // Get probability color class
  const getProbabilityClass = () => {
    if (successProbability > 0.7) return "text-[var(--retro-success)]";
    if (successProbability > 0.4) return "text-[var(--retro-complement)]";
    return "text-[var(--retro-error)]";
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 px-4"
      onClick={onCancel}
    >
      <div
        className="retro-container max-w-md w-full animate-rise"
        onClick={(e) => e.stopPropagation()}
      >
        <h3
          className="retro-header mb-4"
          data-text={isAttack ? "TERRITORY ATTACK" : "TERRITORY CLAIM"}
        >
          {isAttack ? "TERRITORY ATTACK" : "TERRITORY CLAIM"}
        </h3>

        <div className="p-4 bg-[var(--retro-black)] mb-4">
          {isAttack ? (
            <>
              <div className="mb-2 flex justify-between items-center">
                <div className="flex items-center">
                  <span
                    className="w-3 h-3 rounded-full mr-2"
                    style={{ backgroundColor: targetCell.color }}
                  ></span>
                  <span>Target territory: {targetCell.owner}</span>
                </div>
                <span className="font-bold">Power: {defenderPower}</span>
              </div>

              <div className="my-2 text-center">VS</div>

              <div className="mb-2 flex justify-between items-center">
                <div className="flex items-center">
                  <span
                    className="w-3 h-3 rounded-full mr-2"
                    style={{ backgroundColor: sourceCell?.color }}
                  ></span>
                  <span>Your territory</span>
                </div>
                <span className="font-bold">Power: {attackerPower}</span>
              </div>

              <div className="mt-4 text-center">
                <span className="text-[var(--retro-secondary)]">
                  Success chance:{" "}
                </span>
                <span className={`text-lg font-bold ${getProbabilityClass()}`}>
                  {successPercentage}%
                </span>
              </div>
            </>
          ) : (
            <>
              <p className="text-[var(--retro-secondary)] mb-2">
                Claiming this unclaimed territory will cost:
              </p>
              <p className="text-center text-2xl text-[var(--retro-complement)]">
                {cost} <span className="text-sm">TOKENS</span>
              </p>

              {notEnoughTokens && (
                <div className="mt-2 p-2 bg-[var(--retro-black)] border border-[var(--retro-error)] text-[var(--retro-error)] text-center">
                  You don't have enough tokens (you have {playerTokens})
                </div>
              )}

              <div className="mt-3 text-xs text-[var(--retro-secondary)]">
                Expand your empire by claiming territories! Each claim costs{" "}
                {cost} tokens.
              </div>
            </>
          )}
        </div>

        <div className="flex justify-between">
          <RetroButton onClick={onCancel}>CANCEL</RetroButton>

          <RetroButton
            variant={
              isAttack
                ? successProbability < 0.5
                  ? "danger"
                  : "accent"
                : "primary"
            }
            disabled={notEnoughTokens}
            onClick={onConfirm}
          >
            {isAttack ? "ATTACK" : "CLAIM"}
          </RetroButton>
        </div>
      </div>
    </div>
  );
};

export default ClaimConfirmationDialog;
