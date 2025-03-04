import React, { useState, useEffect } from "react";

export const HistoricalLeaderboard = ({ onClose }) => {
  const [historicalData, setHistoricalData] = useState([]);
  const [selectedDay, setSelectedDay] = useState(0);
  const [loading, setLoading] = useState(true);

  const days = [
    "Today",
    "1 day ago",
    "2 days ago",
    "3 days ago",
    "4 days ago",
    "5 days ago",
    "6 days ago",
  ];

  // Mock data for demonstration
  const mockData = [
    [
      { name: "RetroGamer", color: "#FF7EDB", cellCount: 248 },
      { name: "Pixel8Bit", color: "#3BF75F", cellCount: 192 },
      { name: "SynthWave", color: "#FFD319", cellCount: 145 },
      { name: "NeonRider", color: "#2DE2E6", cellCount: 121 },
      { name: "ArcadePro", color: "#FE4450", cellCount: 87 },
    ],
    [
      { name: "Pixel8Bit", color: "#3BF75F", cellCount: 215 },
      { name: "RetroGamer", color: "#FF7EDB", cellCount: 189 },
      { name: "NeonRider", color: "#2DE2E6", cellCount: 156 },
      { name: "SynthWave", color: "#FFD319", cellCount: 122 },
      { name: "ArcadePro", color: "#FE4450", cellCount: 103 },
    ],
    // Additional mock data for other days...
  ];

  useEffect(() => {
    // Simulate loading data from an API
    const fetchHistoricalData = async () => {
      setLoading(true);
      setTimeout(() => {
        setHistoricalData(mockData);
        setLoading(false);
      }, 1000);
    };

    fetchHistoricalData();
  }, []);

  return (
    <div className="retro-modal-backdrop">
      <div className="retro-container relative max-w-md w-full">
        <button onClick={onClose} className="retro-close">
          &times;
        </button>

        <h2
          className="retro-header text-xl mb-6"
          data-text="HISTORICAL LEADERBOARD"
        >
          HISTORICAL LEADERBOARD
        </h2>

        <div className="mb-6 flex flex-wrap justify-center">
          {days.map((day, index) => (
            <button
              key={day}
              onClick={() => setSelectedDay(index)}
              className={`retro-day-selector ${
                selectedDay === index ? "active" : ""
              }`}
            >
              {day}
            </button>
          ))}
        </div>

        <div className="space-y-2 scanlines">
          {loading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-pulse">Loading data...</div>
            </div>
          ) : historicalData[selectedDay]?.length ? (
            <div>
              {historicalData[selectedDay].map((player, index) => (
                <div key={player.name} className="leaderboard-item">
                  <div className="text-retro-complement font-bold mr-3">
                    #{index + 1}
                  </div>
                  <span
                    className="w-6 h-6 rounded-full mr-3"
                    style={{
                      backgroundColor: player.color,
                      boxShadow: `0 0 6px ${player.color}`,
                    }}
                  />
                  <span className="font-medium flex-1">{player.name}</span>
                  <span className="text-retro-highlight">
                    <span className="text-retro-accent">
                      {player.cellCount}
                    </span>{" "}
                    cells
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-retro-secondary">
              No data available for this day
            </div>
          )}
        </div>

        <div className="mt-6 text-center">
          <button onClick={onClose} className="retro-button">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
