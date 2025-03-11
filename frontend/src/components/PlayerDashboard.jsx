import React, { useState, useEffect } from "react";
import { RetroButton } from "./RetroButton";
import { PowerupDisplay } from "./PowerupDisplay";

export const PlayerDashboard = ({
  gameState,
  playerName,
  onEarnTokens,
  onAllianceAction,
}) => {
  const [activeTab, setActiveTab] = useState("stats");
  const [statHistory, setStatHistory] = useState([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const player = gameState.players[playerName];

  // Calculate player power based on time since last action
  const calculatePower = () => {
    if (!player || !player.lastAction) return 1;
    const minutesPassed = Math.floor((Date.now() - player.lastAction) / 60000);
    return Math.min(10, minutesPassed + 1);
  };

  // Group powerups by type
  const groupedPowerups =
    player?.powerups?.reduce((acc, powerup) => {
      if (!acc[powerup.type]) {
        acc[powerup.type] = [];
      }
      acc[powerup.type].push(powerup);
      return acc;
    }, {}) || {};

  // Force refresh stats every 30 seconds to update power values
  useEffect(() => {
    const timer = setInterval(() => {
      setRefreshTrigger((prev) => prev + 1);
    }, 30000);

    return () => clearInterval(timer);
  }, []);

  // Track history for statistics
  useEffect(() => {
    // Update history every minute for the chart
    const interval = setInterval(() => {
      if (player) {
        setStatHistory((prevHistory) => {
          // Keep last 30 data points
          const newHistory = [
            ...prevHistory.slice(-29),
            {
              territories: calculateTerritoryCount(),
              power: calculatePower(),
              timestamp: Date.now(),
            },
          ];

          // Store in localStorage for persistence
          localStorage.setItem(
            `playerStats_${playerName}`,
            JSON.stringify(newHistory),
          );

          return newHistory;
        });
      }
    }, 60000); // Update every minute

    // Load existing history from localStorage
    const storedHistory = localStorage.getItem(`playerStats_${playerName}`);
    if (storedHistory) {
      try {
        setStatHistory(JSON.parse(storedHistory));
      } catch (e) {
        console.error("Failed to load player history:", e);
        setStatHistory([]);
      }
    } else {
      // Initialize with current value if no history exists
      if (player) {
        setStatHistory([
          {
            territories: calculateTerritoryCount(),
            power: calculatePower(),
            timestamp: Date.now(),
          },
        ]);
      }
    }

    return () => clearInterval(interval);
  }, [playerName, player]);

  // Calculate territory count
  const calculateTerritoryCount = () => {
    if (!gameState.grid) return 0;

    let count = 0;
    for (let y = 0; y < gameState.grid.length; y++) {
      for (let x = 0; x < gameState.grid[y].length; x++) {
        if (gameState.grid[y][x].owner === playerName) {
          count++;
        }
      }
    }
    return count;
  };

  // Format timestamp for display
  const formatTime = (timestamp) => {
    if (!timestamp) return "Unknown";
    return new Date(timestamp).toLocaleTimeString();
  };

  // Format date for display
  const formatDate = (timestamp) => {
    if (!timestamp) return "Unknown";
    return new Date(timestamp).toLocaleDateString();
  };

  // Get player's current alliance details
  const getAllianceDetails = () => {
    if (!gameState.alliances) return null;

    for (const key in gameState.alliances) {
      const alliance = gameState.alliances[key];
      if (alliance.members.includes(playerName)) {
        const allyNames = alliance.members.filter(
          (name) => name !== playerName,
        );
        return {
          id: key,
          allies: allyNames,
          formed: alliance.formed,
          score: alliance.members.reduce((total, name) => {
            return total + (gameState.players[name]?.cellCount || 0);
          }, 0),
        };
      }
    }
    return null;
  };

  // Get pending alliance invitations
  const getPendingInvites = () => {
    if (!gameState.allianceInvites) return [];
    return gameState.allianceInvites.filter(
      (invite) => invite.to === playerName && invite.status === "pending",
    );
  };

  const alliance = getAllianceDetails();
  const pendingInvites = getPendingInvites();
  const territoryCount = calculateTerritoryCount();
  const power = calculatePower();

  // Calculate player captures and losses
  const battleStats = {
    captures: player?.captures || 0,
    losses: player?.losses || 0,
  };

  if (!player)
    return <div className="text-center p-6">Loading player data...</div>;

  return (
    <div className="retro-container">
      <h2 className="retro-header mb-4" data-text="PLAYER DASHBOARD">
        PLAYER DASHBOARD
      </h2>

      <div className="mb-4 border-b-2 border-[var(--retro-shadow)] pb-2">
        <div className="tabs flex flex-wrap">
          <button
            className={`px-4 py-2 mr-2 mb-2 ${
              activeTab === "stats"
                ? "bg-[var(--retro-primary)] text-black"
                : "bg-[var(--retro-shadow)]"
            }`}
            onClick={() => setActiveTab("stats")}
          >
            STATS
          </button>
          <button
            className={`px-4 py-2 mr-2 mb-2 ${
              activeTab === "inventory"
                ? "bg-[var(--retro-primary)] text-black"
                : "bg-[var(--retro-shadow)]"
            }`}
            onClick={() => setActiveTab("inventory")}
          >
            INVENTORY
          </button>
          <button
            className={`px-4 py-2 mr-2 mb-2 ${
              activeTab === "alliances"
                ? "bg-[var(--retro-primary)] text-black"
                : "bg-[var(--retro-shadow)]"
            }`}
            onClick={() => setActiveTab("alliances")}
          >
            ALLIANCES
          </button>
          <button
            className={`px-4 py-2 mb-2 ${
              activeTab === "history"
                ? "bg-[var(--retro-primary)] text-black"
                : "bg-[var(--retro-shadow)]"
            }`}
            onClick={() => setActiveTab("history")}
          >
            HISTORY
          </button>
        </div>
      </div>

      {/* Stats Tab */}
      {activeTab === "stats" && (
        <div>
          <div
            className="player-header p-4"
            style={{ backgroundColor: player.color }}
          >
            <h3 className="text-xl font-bold">{playerName}</h3>
            <div className="flex items-center">
              <span className="mr-2">Power:</span>
              <div className="progress-bar h-4 w-24 bg-[var(--retro-shadow)] rounded overflow-hidden">
                <div
                  className="h-full bg-[var(--retro-accent)]"
                  style={{ width: `${power * 10}%` }}
                ></div>
              </div>
              <span className="ml-2">{power}/10</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 my-4">
            <div className="stat-box p-3 border-2 border-[var(--retro-primary)] text-center">
              <div className="text-3xl font-bold text-[var(--retro-primary)]">
                {territoryCount}
              </div>
              <div className="text-sm text-[var(--retro-secondary)]">
                TERRITORIES
              </div>
            </div>
            <div className="stat-box p-3 border-2 border-[var(--retro-accent)] text-center">
              <div className="text-3xl font-bold text-[var(--retro-accent)]">
                {player.tokens || 0}
              </div>
              <div className="text-sm text-[var(--retro-secondary)]">
                TOKENS
              </div>
            </div>
            <div className="stat-box p-3 border-2 border-[var(--retro-complement)] text-center">
              <div className="text-3xl font-bold text-[var(--retro-complement)]">
                {battleStats.captures}
              </div>
              <div className="text-sm text-[var(--retro-secondary)]">
                CAPTURES
              </div>
            </div>
            <div className="stat-box p-3 border-2 border-[var(--retro-error)] text-center">
              <div className="text-3xl font-bold text-[var(--retro-error)]">
                {battleStats.losses}
              </div>
              <div className="text-sm text-[var(--retro-secondary)]">
                LOSSES
              </div>
            </div>
          </div>

          <div className="mt-6 p-3 border border-[var(--retro-shadow)] rounded">
            <h4 className="text-sm text-[var(--retro-highlight)] mb-3">
              TERRITORY PROGRESS
            </h4>
            <div className="h-6 bg-[var(--retro-shadow)] rounded overflow-hidden">
              <div
                className="h-full bg-[var(--retro-primary)]"
                style={{
                  width: `${Math.min(100, (territoryCount / 100) * 100)}%`,
                }}
              ></div>
            </div>
            <div className="mt-2 flex justify-between text-xs text-[var(--retro-secondary)]">
              <span>0</span>
              <span>25</span>
              <span>50</span>
              <span>75</span>
              <span>100+</span>
            </div>
          </div>

          <div className="flex justify-center mt-6">
            <RetroButton
              variant="complement"
              onClick={onEarnTokens}
              className="animate-pulse"
            >
              EARN MORE TOKENS
            </RetroButton>
          </div>
        </div>
      )}

      {/* Inventory Tab */}
      {activeTab === "inventory" && (
        <div>
          <h3 className="text-lg mb-4 text-[var(--retro-highlight)]">
            Power-ups
          </h3>

          {Object.keys(groupedPowerups).length > 0 ? (
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(groupedPowerups).map(([type, items]) => (
                <div
                  key={type}
                  className="p-3 border border-[var(--retro-secondary)] rounded-md"
                >
                  <div className="flex items-center">
                    <PowerupDisplay
                      type={type}
                      count={items.length}
                      size="md"
                    />
                    <div className="ml-3">
                      <div className="text-[var(--retro-highlight)]">
                        {type.toUpperCase()}
                      </div>
                      <div className="text-sm text-[var(--retro-secondary)]">
                        {items.length} available
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-[var(--retro-secondary)] p-6">
              No power-ups available. Collect them by finding them on the grid!
            </div>
          )}

          <h3 className="text-lg mt-6 mb-4 text-[var(--retro-highlight)]">
            Achievements
          </h3>
          <div className="grid grid-cols-3 gap-2">
            {["First Territory", "Power Player", "Alliance Master"].map(
              (achievement, index) => (
                <div
                  key={index}
                  className="p-2 border border-[var(--retro-shadow)] text-center opacity-50"
                >
                  <div className="text-2xl mb-1">🏆</div>
                  <div className="text-xs text-[var(--retro-secondary)]">
                    {achievement}
                  </div>
                </div>
              ),
            )}
          </div>
        </div>
      )}

      {/* Alliances Tab */}
      {activeTab === "alliances" && (
        <div>
          <h3 className="text-lg mb-4 text-[var(--retro-highlight)]">
            Alliance Status
          </h3>

          {alliance ? (
            <div className="mb-6 p-4 bg-[var(--retro-black)] border border-[var(--retro-accent)] rounded">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-md text-[var(--retro-complement)]">
                  Active Alliance
                </h4>
                <span className="text-xs text-[var(--retro-secondary)]">
                  Formed: {formatDate(alliance.formed)}
                </span>
              </div>

              <div className="mb-4">
                <div className="text-sm text-[var(--retro-secondary)] mb-1">
                  Alliance Members:
                </div>
                <div className="flex flex-col space-y-2">
                  {alliance.allies.map((ally) => (
                    <div
                      key={ally}
                      className="flex items-center p-2 bg-[var(--retro-shadow)] rounded"
                    >
                      <span
                        className="w-3 h-3 rounded-full mr-2"
                        style={{
                          backgroundColor:
                            gameState.players[ally]?.color || "#999",
                        }}
                      ></span>
                      <span className="text-[var(--retro-highlight)]">
                        {ally}
                      </span>
                      <span className="ml-auto text-xs">
                        {gameState.players[ally]?.cellCount || 0} territories
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mb-4 p-3 border border-dashed border-[var(--retro-secondary)]">
                <div className="text-sm text-[var(--retro-secondary)] mb-2">
                  Combined Power:
                </div>
                <div className="text-2xl text-center text-[var(--retro-accent)]">
                  {alliance.score} <span className="text-sm">territories</span>
                </div>
              </div>

              <RetroButton
                variant="danger"
                fullWidth
                onClick={() =>
                  onAllianceAction &&
                  onAllianceAction({
                    type: "leave",
                    playerId: playerName,
                  })
                }
              >
                BREAK ALLIANCE
              </RetroButton>
            </div>
          ) : (
            <>
              <div className="mb-4 p-4 bg-[var(--retro-black)] text-center">
                <p className="mb-2 text-[var(--retro-secondary)]">
                  You are not currently in an alliance
                </p>
                <p className="text-sm text-[var(--retro-highlight)]">
                  Form alliances with other subreddits to protect territories
                  and combine forces with them !
                </p>
              </div>

              {pendingInvites.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-md text-[var(--retro-highlight)] mb-3">
                    Pending Invitations
                  </h4>
                  <div className="space-y-3">
                    {pendingInvites.map((invite, index) => (
                      <div
                        key={index}
                        className="p-3 border border-[var(--retro-complement)] rounded"
                      >
                        <div className="flex items-center mb-2">
                          <span
                            className="w-3 h-3 rounded-full mr-2"
                            style={{
                              backgroundColor:
                                gameState.players[invite.from]?.color || "#999",
                            }}
                          ></span>
                          <span className="text-[var(--retro-complement)]">
                            {invite.from}
                          </span>
                          <span className="ml-auto text-xs text-[var(--retro-secondary)]">
                            {formatDate(invite.timestamp)}
                          </span>
                        </div>
                        <div className="flex space-x-2 mt-3">
                          <RetroButton
                            variant="accent"
                            className="text-xs py-1 px-3"
                            onClick={() =>
                              onAllianceAction &&
                              onAllianceAction({
                                type: "accept",
                                inviteId: invite.id,
                              })
                            }
                          >
                            ACCEPT
                          </RetroButton>
                          <RetroButton
                            variant="danger"
                            className="text-xs py-1 px-3"
                            onClick={() =>
                              onAllianceAction &&
                              onAllianceAction({
                                type: "reject",
                                inviteId: invite.id,
                              })
                            }
                          >
                            REJECT
                          </RetroButton>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <h4 className="text-md text-[var(--retro-highlight)] mb-3">
                Send Alliance Request
              </h4>
              <div className="mt-4 p-4 bg-[var(--retro-black)] border border-[var(--retro-secondary)]">
                <div className="mb-4">
                  <label className="block mb-1 text-sm" htmlFor="ally-select">
                    Select Subreddit:
                  </label>
                  <select
                    id="ally-select"
                    className="w-full bg-[var(--retro-shadow)] text-[var(--retro-highlight)] p-2 rounded"
                  >
                    <option value="">Choose a subreddit</option>
                    {Object.keys(gameState.players)
                      .filter((name) => name !== playerName)
                      .map((name) => (
                        <option key={name} value={name}>
                          {name}
                        </option>
                      ))}
                  </select>
                </div>
                <RetroButton
                  variant="complement"
                  fullWidth
                  onClick={() => {
                    const allyName =
                      document.getElementById("ally-select").value;
                    if (allyName && onAllianceAction) {
                      onAllianceAction({
                        type: "invite",
                        from: playerName,
                        to: allyName,
                      });
                    }
                  }}
                >
                  SEND REQUEST
                </RetroButton>
              </div>
            </>
          )}
        </div>
      )}

      {/* History Tab */}
      {activeTab === "history" && (
        <div>
          <h3 className="text-lg mb-4 text-[var(--retro-highlight)]">
            Territory History
          </h3>

          <div className="h-40 border border-[var(--retro-shadow)] p-2 mb-6 relative">
            {statHistory.length > 0 ? (
              <div className="h-full flex items-end">
                {statHistory.map((entry, index) => {
                  const maxValue = Math.max(
                    ...statHistory.map((e) => e.territories),
                  );
                  const height =
                    maxValue > 0 ? (entry.territories / maxValue) * 100 : 0;
                  return (
                    <div
                      key={index}
                      className="flex-1 bg-[var(--retro-primary)] mx-0.5 transition-all duration-300 relative group"
                      style={{ height: `${height}%` }}
                    >
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 bg-black text-white text-xs p-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none">
                        {entry.territories} territories
                        <br />
                        {formatTime(entry.timestamp)}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-[var(--retro-secondary)]">
                No history data available yet
              </div>
            )}

            {/* Add average line */}
            {statHistory.length > 0 && (
              <div
                className="absolute left-0 right-0 border-dashed border-t border-[var(--retro-accent)]"
                style={{
                  bottom: `${
                    (statHistory.reduce(
                      (sum, entry) => sum + entry.territories,
                      0,
                    ) /
                      statHistory.length /
                      Math.max(...statHistory.map((e) => e.territories))) *
                    100
                  }%`,
                }}
              ></div>
            )}
          </div>

          <h3 className="text-lg mb-4 text-[var (--retro-highlight)]">
            Recent Activity
          </h3>
          <div className="border border-[var(--retro-shadow)] p-2 max-h-48 overflow-y-auto">
            <ul className="text-xs space-y-2 text-[var(--retro-secondary)]">
              <li className="flex justify-between">
                <span>Territory claimed at (10,15)</span>
                <span>{formatTime(Date.now() - 120000)}</span>
              </li>
              <li className="flex justify-between">
                <span>Lost territory at (8,12)</span>
                <span>{formatTime(Date.now() - 300000)}</span>
              </li>
              <li className="flex justify-between">
                <span>Shield powerup collected</span>
                <span>{formatTime(Date.now() - 900000)}</span>
              </li>
              {/* Add more activity entries if available */}
              {player.recentActivity?.map((activity, index) => (
                <li key={index} className="flex justify-between">
                  <span>{activity.description}</span>
                  <span>{formatTime(activity.timestamp)}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-4 flex justify-center">
            <RetroButton
              variant="secondary"
              className="text-xs"
              onClick={() => {
                // Clear history functionality
                if (
                  confirm("Are you sure you want to clear your history data?")
                ) {
                  localStorage.removeItem(`playerStats_${playerName}`);
                  setStatHistory([]);
                }
              }}
            >
              CLEAR HISTORY DATA
            </RetroButton>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlayerDashboard;
