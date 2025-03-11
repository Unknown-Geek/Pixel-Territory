import React, { useState, useEffect } from "react";
import { riddleManager } from "../utils/riddleManager";
import { getRandomQuestion } from "../utils/questions";
import { RetroButton } from "./RetroButton";

export const TokenEarner = ({ onTokensEarned, onClose, currentPlayer }) => {
  const [currentRiddle, setCurrentRiddle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [answer, setAnswer] = useState("");
  const [error, setError] = useState("");
  const [cooldown, setCooldown] = useState(null);
  const [remainingRiddles, setRemainingRiddles] = useState(0);

  useEffect(() => {
    loadNewRiddle();
  }, [currentPlayer]);

  const formatTimeRemaining = (ms) => {
    const hours = Math.floor(ms / (60 * 60 * 1000));
    const minutes = Math.floor((ms % (60 * 60 * 1000)) / (60 * 1000));
    return `${hours}h ${minutes}m`;
  };

  const loadNewRiddle = async () => {
    setLoading(true);
    setError("");

    // Check remaining riddles
    const remaining = riddleManager.getRiddlesRemaining(currentPlayer);
    setRemainingRiddles(remaining);

    // If no riddles remaining, check cooldown
    if (remaining <= 0) {
      const cooldownMs = riddleManager.getCooldownTimeRemaining(currentPlayer);
      if (cooldownMs > 0) {
        setCooldown(cooldownMs);
        setLoading(false);
        return;
      }
    }

    const riddle = await riddleManager.getNextRiddle(currentPlayer);

    if (riddle.error) {
      setCooldown(riddle.cooldownMs);
      setError(riddle.message);
      setLoading(false);
      return;
    }

    setCurrentRiddle(riddle);
    setCooldown(null);
    setLoading(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!currentRiddle) return;

    if (answer.toLowerCase().trim() === currentRiddle.answer.toLowerCase()) {
      riddleManager.markRiddleSolved(currentPlayer, currentRiddle.id);
      onTokensEarned(10);
      onClose();
    } else {
      setError("Wrong answer, try again!");
      setAnswer("");
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">
        <div className="retro-container max-w-md w-full">
          <p className="text-center text-[var(--retro-highlight)]">
            Loading new riddle...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">
      <div className="retro-container max-w-md w-full">
        <h2 className="text-xl mb-4 text-[var(--retro-highlight)]">
          RIDDLE QUEST
        </h2>

        {cooldown ? (
          <div>
            <p className="text-[var(--retro-error)] mb-4">
              You've reached the limit of {riddleManager.maxRiddlesPerPeriod}{" "}
              riddles.
            </p>
            <p className="text-[var(--retro-secondary)] mb-6">
              Time until next riddles:{" "}
              <span className="text-[var(--retro-accent)]">
                {formatTimeRemaining(cooldown)}
              </span>
            </p>
            <div className="flex justify-end">
              <RetroButton onClick={onClose}>CLOSE</RetroButton>
            </div>
          </div>
        ) : (
          <>
            <div className="mb-4 flex flex-col space-y-2">
              <span className="text-xs text-[var(--retro-secondary)]">
                Riddles remaining:{" "}
                <span className="text-[var(--retro-accent)]">
                  {remainingRiddles}/{riddleManager.maxRiddlesPerPeriod}
                </span>
              </span>
              <span className="text-xs text-[var(--retro-secondary)]">
                Reward:{" "}
                <span className="text-[var(--retro-complement)]">
                  10 tokens
                </span>
              </span>
            </div>

            <p className="text-sm mb-6 text-[var(--retro-primary)]">
              {currentRiddle?.question}
            </p>

            <form onSubmit={handleSubmit}>
              <input
                type="text"
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                className="w-full p-2 bg-[var(--retro-black)] border-2 border-[var(--retro-primary)] text-[var(--retro-primary)] mb-2"
                placeholder="ENTER ANSWER"
              />
              {error && (
                <p className="text-[var(--retro-error)] text-xs mb-4">
                  {error}
                </p>
              )}

              <div className="flex justify-end gap-2 mt-4">
                <RetroButton variant="secondary" onClick={onClose}>
                  CANCEL
                </RetroButton>
                <RetroButton variant="accent" type="submit">
                  SUBMIT
                </RetroButton>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
};
