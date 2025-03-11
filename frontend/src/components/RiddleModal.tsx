import React, { useState } from "react";
import { getRandomRiddle } from "../utils/riddleService";

export const RiddleModal = ({ isOpen, onClose, onCorrectAnswer }) => {
  const [answer, setAnswer] = useState("");
  const [currentRiddle] = useState(() => getRandomRiddle());

  const handleSubmit = (e) => {
    e.preventDefault();
    if (answer.toLowerCase().trim() === currentRiddle.answer) {
      onCorrectAnswer(10); // Award 10 tokens
      onClose();
    } else {
      alert("Wrong answer, try again!");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg max-w-md w-full">
        <h2 className="text-xl font-bold mb-4">Answer to Earn Tokens</h2>
        <p className="mb-4">{currentRiddle.question}</p>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            className="w-full p-2 border rounded mb-4"
            placeholder="Your answer"
          />
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 rounded"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded"
            >
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
