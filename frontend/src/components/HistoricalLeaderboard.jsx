import React, { useState, useEffect } from "react";

export const HistoricalLeaderboard = ({ onClose }) => {
  const [historicalData, setHistoricalData] = useState([]);
  const [selectedDay, setSelectedDay] = useState(0);

  const days = [
    "Today",
    "1 day ago",
    "2 days ago",
    "3 days ago",
    "4 days ago",
    "5 days ago",
    "6 days ago",
  ];

  useEffect(() => {
    // Fetch historical data from your database
    // This is a placeholder for the actual implementation
    const fetchHistoricalData = async () => {
      // const data = await fetchFromDatabase();
      // setHistoricalData(data);
    };
    fetchHistoricalData();
  }, []);

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <div className="flex justify-between mb-4">
        <h2 className="text-xl font-bold">Historical Leaderboard</h2>
        <button onClick={onClose} className="text-gray-500">
          &times;
        </button>
      </div>

      <div className="flex gap-2 mb-4">
        {days.map((day, index) => (
          <button
            key={day}
            onClick={() => setSelectedDay(index)}
            className={`px-3 py-1 rounded ${
              selectedDay === index ? "bg-blue-500 text-white" : "bg-gray-200"
            }`}
          >
            {day}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        {historicalData[selectedDay]?.map((player) => (
          <div key={player.name} className="flex items-center gap-2">
            <span
              className="w-4 h-4 rounded-full"
              style={{ backgroundColor: player.color }}
            />
            <span className="font-medium">{player.name}</span>
            <span className="text-gray-600 ml-auto">
              {player.cellCount} cells
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
