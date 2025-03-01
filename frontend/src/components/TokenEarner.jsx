import React, { useState, useEffect } from "react";
import { riddleManager } from "../utils/riddleManager";
import { getRandomQuestion } from "../utils/questions";

export const TokenEarner = ({ onTokensEarned, onClose, currentPlayer }) => {
  const [currentRiddle, setCurrentRiddle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [answer, setAnswer] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    loadNewRiddle();
  }, [currentPlayer]);

  const loadNewRiddle = async () => {
    setLoading(true);
    const riddle = await riddleManager.getNextRiddle(currentPlayer);
    setCurrentRiddle(riddle);
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
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
        <div className="bg-white p-6 rounded-lg max-w-md w-full">
          <p className="text-center">Loading new riddle...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center">
      <div className="retro-container bg-black max-w-md w-full">
        <h2 className="text-xl mb-4">RIDDLE QUEST</h2>
        <p className="text-sm mb-4">{currentRiddle.question}</p>

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            className="w-full p-2 bg-black border-2 border-[#00ff00] text-[#00ff00] mb-2"
            placeholder="ENTER ANSWER"
          />
          {error && <p className="text-red-500 text-xs mb-2">{error}</p>}

          <div className="flex justify-end gap-2">
            <button type="button" onClick={onClose} className="retro-button">
              CANCEL
            </button>
            <button type="submit" className="retro-button">
              SUBMIT
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
