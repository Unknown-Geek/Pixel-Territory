import React from "react";

export const Leaderboard = ({ players }) => {
  return (
    <div className="mt-6 bg-white p-4 rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4">Territory Leaders</h2>
      <ul className="space-y-2">
        {Object.entries(players)
          .sort(([, a], [, b]) => b.cellCount - a.cellCount)
          .slice(0, 5)
          .map(([username, data]) => (
            <li key={username} className="flex items-center gap-2">
              <span
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: data.color }}
              />
              <span className="font-medium">{username}</span>
              <span className="text-gray-600 ml-auto">
                {data.cellCount} cells
              </span>
            </li>
          ))}
      </ul>
    </div>
  );
};
