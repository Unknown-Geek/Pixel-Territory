/**
 * Pixel Territory - Player Dashboard
 * Handles player statistics, leaderboard, and alliance management
 */

class PlayerDashboard {
  constructor() {
    this.players = new Map();
    this.alliances = new Map();
    this.currentPlayerId = null;
    this.statsContainer = document.getElementById("player-stats");
    this.leaderboardContainer = document.getElementById("leaderboard-content");
    this.allianceContainer = document.getElementById("alliance-management");

    // Add history tracking
    this.playerHistory = new Map();
    this.sortBy = "territories";
    this.sortDirection = "desc";

    this.init();
  }

  init() {
    this.setupEventListeners();
    this.createMockData(); // For demonstration
    this.render();
  }

  setupEventListeners() {
    // Player selection change
    const playerSelector = document.getElementById("playerSelector");
    if (playerSelector) {
      playerSelector.addEventListener("change", () => {
        this.setCurrentPlayer(parseInt(playerSelector.value));
        this.render();
      });
    }

    // Alliance form submission
    const allianceForm = document.getElementById("alliance-form");
    if (allianceForm) {
      allianceForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const allyId = parseInt(document.getElementById("ally-id").value);
        this.createAlliance(this.currentPlayerId, allyId);
        document.getElementById("ally-id").value = "";
        this.render();
      });
    }
  }

  // Create mock data for demonstration purposes
  createMockData() {
    // Mock players
    for (let i = 1; i <= 8; i++) {
      this.players.set(i, {
        id: i,
        name: `Player ${i}`,
        territories: Math.floor(Math.random() * 100),
        power: Math.floor(Math.random() * 1000),
        tokens: Math.floor(Math.random() * 50),
        captures: Math.floor(Math.random() * 80),
        losses: Math.floor(Math.random() * 40),
        joinedDate: new Date(
          Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000
        ),
        lastActive: new Date(
          Date.now() - Math.random() * 3 * 24 * 60 * 60 * 1000
        ),
        color: `hsl(${(i * 137.5) % 360}, 70%, 60%)`,
      });

      // Create mock history data
      this.playerHistory.set(i, {
        territories: this.generateMockHistory(30, 100),
        power: this.generateMockHistory(30, 1000),
        timestamps: this.generateTimestamps(30),
      });
    }

    // Mock alliances
    this.alliances.set("1-3", {
      members: [1, 3],
      formed: new Date(Date.now() - Math.random() * 10 * 24 * 60 * 60 * 1000),
      territories:
        this.players.get(1).territories + this.players.get(3).territories,
      combinedPower: this.players.get(1).power + this.players.get(3).power,
    });

    this.alliances.set("2-4", {
      members: [2, 4],
      formed: new Date(Date.now() - Math.random() * 15 * 24 * 60 * 60 * 1000),
      territories:
        this.players.get(2).territories + this.players.get(4).territories,
      combinedPower: this.players.get(2).power + this.players.get(4).power,
    });

    // Set current player
    this.currentPlayerId = 1;
  }

  // Generate mock history data
  generateMockHistory(days, max) {
    const history = [];
    let lastValue = Math.floor((Math.random() * max) / 2);

    for (let i = 0; i < days; i++) {
      const change = Math.floor(Math.random() * 10) - 4; // -4 to +5
      lastValue = Math.max(0, Math.min(max, lastValue + change));
      history.push(lastValue);
    }

    return history;
  }

  // Generate timestamps for history
  generateTimestamps(days) {
    const timestamps = [];
    const now = Date.now();

    for (let i = days - 1; i >= 0; i--) {
      timestamps.push(new Date(now - i * 24 * 60 * 60 * 1000));
    }

    return timestamps;
  }

  // Set current player
  setCurrentPlayer(playerId) {
    this.currentPlayerId = playerId;
  }

  // Create alliance between two players
  createAlliance(player1Id, player2Id) {
    if (player1Id === player2Id) return false;

    // Check if players exist
    if (!this.players.has(player1Id) || !this.players.has(player2Id))
      return false;

    // Check if alliance already exists
    const allianceKey = [player1Id, player2Id].sort().join("-");
    if (this.alliances.has(allianceKey)) return false;

    // Create alliance
    this.alliances.set(allianceKey, {
      members: [player1Id, player2Id],
      formed: new Date(),
      territories:
        this.players.get(player1Id).territories +
        this.players.get(player2Id).territories,
      combinedPower:
        this.players.get(player1Id).power + this.players.get(player2Id).power,
    });

    return true;
  }

  // Check if two players are allies
  areAllies(player1Id, player2Id) {
    const allianceKey = [player1Id, player2Id].sort().join("-");
    return this.alliances.has(allianceKey);
  }

  // Get player alliances
  getPlayerAlliances(playerId) {
    const playerAlliances = [];

    this.alliances.forEach((alliance, key) => {
      if (alliance.members.includes(playerId)) {
        const allyId = alliance.members.find((id) => id !== playerId);
        playerAlliances.push({
          allianceKey: key,
          ally: this.players.get(allyId),
          formed: alliance.formed,
          territories: alliance.territories,
          combinedPower: alliance.combinedPower,
        });
      }
    });

    return playerAlliances;
  }

  // Render the entire dashboard
  render() {
    this.renderPlayerStats();
    this.renderLeaderboard();
    this.renderAllianceManagement();
  }

  // Render the player statistics panel
  renderPlayerStats() {
    if (!this.statsContainer) return;

    const player = this.players.get(this.currentPlayerId);
    if (!player) return;

    this.statsContainer.innerHTML = `
      <div class="stats-card">
        <div class="player-header" style="background-color: ${player.color}">
          <h3>${player.name}</h3>
          <div class="player-tokens">${player.tokens} tokens</div>
        </div>
        <div class="stats-grid">
          <div class="stat-item">
            <div class="stat-value">${player.territories}</div>
            <div class="stat-label">Territories</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">${player.power}</div>
            <div class="stat-label">Power</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">${player.captures}</div>
            <div class="stat-label">Captures</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">${player.losses}</div>
            <div class="stat-label">Losses</div>
          </div>
        </div>
        <div class="player-history">
          <div>Joined: ${this.formatDate(player.joinedDate)}</div>
          <div>Last Active: ${this.formatDate(player.lastActive)}</div>
        </div>
      </div>
      
      <div class="stats-visualization">
        <h4>Territory History (30 Days)</h4>
        ${this.renderHistoryChart(this.currentPlayerId, "territories")}
        
        <h4>Power History (30 Days)</h4>
        ${this.renderHistoryChart(this.currentPlayerId, "power")}
      </div>
    `;
  }

  // Render a history chart for a specific player and stat type
  renderHistoryChart(playerId, statType) {
    const history = this.playerHistory.get(playerId);
    if (!history) return "<div>No history data available</div>";

    const data = history[statType];
    const timestamps = history.timestamps;

    // Find max value for scaling
    const maxValue = Math.max(...data);
    const minValue = Math.min(...data);

    // Create history bars
    let barsHtml = "";
    data.forEach((value, index) => {
      const heightPercentage = maxValue > 0 ? (value / maxValue) * 100 : 0;
      barsHtml += `<div class="history-point" style="height: ${heightPercentage}%" data-value="${value}" data-date="${this.formatDate(
        timestamps[index]
      )}"></div>`;
    });

    // Display average line
    const avgValue = data.reduce((sum, val) => sum + val, 0) / data.length;
    const avgPercentage = maxValue > 0 ? (avgValue / maxValue) * 100 : 0;

    return `
      <div class="territory-history">
        <div class="horizontal-line" style="bottom: ${avgPercentage}%" title="Average: ${Math.round(
      avgValue
    )}"></div>
        <div class="history-bar">
          ${barsHtml}
        </div>
        <div class="time-labels">
          <span>${this.formatDate(timestamps[0])}</span>
          <span>${this.formatDate(timestamps[timestamps.length - 1])}</span>
        </div>
      </div>
    `;
  }

  // Render the leaderboard with sorting capability
  renderLeaderboard() {
    if (!this.leaderboardContainer) return;

    // Sort players based on current sort settings
    const sortedPlayers = Array.from(this.players.values()).sort((a, b) => {
      if (this.sortDirection === "asc") {
        return a[this.sortBy] - b[this.sortBy];
      } else {
        return b[this.sortBy] - a[this.sortBy];
      }
    });

    let leaderboardHTML = `
      <table class="leaderboard-table">
        <thead>
          <tr>
            <th>Rank</th>
            <th>Player</th>
            <th class="${
              this.sortBy === "territories" ? "sort-" + this.sortDirection : ""
            }" data-sort="territories">
              Territories <span class="sort-indicator"></span>
            </th>
            <th class="${
              this.sortBy === "power" ? "sort-" + this.sortDirection : ""
            }" data-sort="power">
              Power <span class="sort-indicator"></span>
            </th>
          </tr>
        </thead>
        <tbody>
    `;

    sortedPlayers.forEach((player, index) => {
      // Highlight current player
      const isCurrentPlayer = player.id === this.currentPlayerId;
      leaderboardHTML += `
        <tr class="${isCurrentPlayer ? "current-player" : ""}">
          <td>${index + 1}</td>
          <td>
            <span class="player-color" style="background-color: ${
              player.color
            }"></span>
            ${player.name}
          </td>
          <td>${player.territories}</td>
          <td>${player.power}</td>
        </tr>
      `;
    });

    leaderboardHTML += `
        </tbody>
      </table>
    `;

    this.leaderboardContainer.innerHTML = leaderboardHTML;

    // Add event listeners for sorting
    const headers = this.leaderboardContainer.querySelectorAll("th[data-sort]");
    headers.forEach((header) => {
      header.addEventListener("click", () => {
        const sortField = header.dataset.sort;

        // Toggle direction if same field, otherwise default to descending
        if (sortField === this.sortBy) {
          this.sortDirection = this.sortDirection === "asc" ? "desc" : "asc";
        } else {
          this.sortBy = sortField;
          this.sortDirection = "desc";
        }

        this.renderLeaderboard();
      });
    });
  }

  // Render the alliance management interface
  renderAllianceManagement() {
    if (!this.allianceContainer) return;

    const currentPlayer = this.players.get(this.currentPlayerId);
    if (!currentPlayer) return;

    const playerAlliances = this.getPlayerAlliances(this.currentPlayerId);

    let allianceHTML = `
      <div class="alliance-header">
        <h4>Your Alliances</h4>
        <small>${playerAlliances.length} active alliances</small>
      </div>
    `;

    if (playerAlliances.length > 0) {
      allianceHTML += `<div class="alliance-list">`;

      playerAlliances.forEach((alliance) => {
        allianceHTML += `
          <div class="alliance-item">
            <div class="ally-info">
              <span class="player-color" style="background-color: ${
                alliance.ally.color
              }"></span>
              <span class="ally-name">${alliance.ally.name}</span>
            </div>
            <div class="alliance-stats">
              <div><strong>Combined Territories:</strong> ${
                alliance.territories
              }</div>
              <div><strong>Combined Power:</strong> ${
                alliance.combinedPower
              }</div>
              <div><strong>Formed:</strong> ${this.formatDate(
                alliance.formed
              )}</div>
            </div>
            <button class="break-alliance" data-alliance="${
              alliance.allianceKey
            }">Break Alliance</button>
          </div>
        `;
      });

      allianceHTML += `</div>`;
    } else {
      allianceHTML += `<p class="no-alliances">You have no active alliances.</p>`;
    }

    allianceHTML += `
      <div class="alliance-form-container">
        <h4>Create New Alliance</h4>
        <form id="alliance-form">
          <div class="form-group">
            <label for="ally-id">Select Player ID:</label>
            <select id="ally-id" required>
              ${Array.from(this.players.keys())
                .filter(
                  (id) =>
                    id !== this.currentPlayerId &&
                    !this.areAllies(id, this.currentPlayerId)
                )
                .map(
                  (id) =>
                    `<option value="${id}">${
                      this.players.get(id).name
                    }</option>`
                )
                .join("")}
            </select>
          </div>
          <button type="submit" class="alliance-button">Form Alliance</button>
        </form>
      </div>
    `;

    this.allianceContainer.innerHTML = allianceHTML;

    // Add event listeners for breaking alliances
    const breakButtons =
      this.allianceContainer.querySelectorAll(".break-alliance");
    breakButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const allianceKey = button.dataset.alliance;
        this.alliances.delete(allianceKey);
        this.render();
      });
    });
  }

  // Helper function to format dates nicely
  formatDate(date) {
    if (!date) return "Unknown";
    const options = { month: "short", day: "numeric", year: "numeric" };
    return date.toLocaleDateString("en-US", options);
  }

  // Update player statistics based on grid data
  updatePlayerStats(gridData) {
    // Reset territory counts
    this.players.forEach((player) => {
      player.territories = 0;
      player.power = 0;
    });

    // Count territories and power from grid
    for (const cell of gridData) {
      if (cell && cell.owner && this.players.has(cell.owner)) {
        const player = this.players.get(cell.owner);
        player.territories++;
        player.power += cell.power || 0;
      }
    }

    // Update alliances
    this.alliances.forEach((alliance, key) => {
      const [player1Id, player2Id] = alliance.members;
      alliance.territories =
        this.players.get(player1Id).territories +
        this.players.get(player2Id).territories;
      alliance.combinedPower =
        this.players.get(player1Id).power + this.players.get(player2Id).power;
    });

    // Update history data for each player
    this.updateHistoryData();

    this.render();
  }

  // Update history data with current values
  updateHistoryData() {
    const now = new Date();

    this.players.forEach((player, playerId) => {
      if (!this.playerHistory.has(playerId)) {
        // Initialize history if it doesn't exist
        this.playerHistory.set(playerId, {
          territories: new Array(30).fill(0),
          power: new Array(30).fill(0),
          timestamps: this.generateTimestamps(30),
        });
      }

      const history = this.playerHistory.get(playerId);

      // Shift arrays and add new values
      history.territories.shift();
      history.territories.push(player.territories);

      history.power.shift();
      history.power.push(player.power);

      history.timestamps.shift();
      history.timestamps.push(now);
    });
  }
}

// Export for module use
if (typeof module !== "undefined" && module.exports) {
  module.exports = PlayerDashboard;
}
