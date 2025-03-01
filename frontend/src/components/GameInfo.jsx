import React from "react";

export const GameInfo = () => {
  return (
    <div className="mt-6 bg-white p-4 rounded-lg shadow max-w-3xl mx-auto">
      <h2 className="text-xl font-bold mb-4">How to Play</h2>
      <div className="space-y-2 text-gray-600">
        <p>
          • Claim territory by clicking on cells adjacent to your existing
          territory.
        </p>
        <p>• Build the largest empire to win!</p>
        <p>• Game resets daily at midnight UTC.</p>
        <p>• Power increases over time (1 point per minute, max 10)</p>
      </div>
    </div>
  );
};
