/**
 * Pixel Territory - Power-up System
 * Handles power-up generation, selection and activation
 */

class PowerupSystem {
  constructor(gridVisualization) {
    this.grid = gridVisualization;
    this.powerups = {
      shield: {
        count: 2,
        icon: "🛡️",
        name: "Shield",
        description: "Protects your territory from capture for 60 seconds",
      },
      bomb: {
        count: 1,
        icon: "💣",
        name: "Bomb",
        description: "Claims a target cell and all adjacent cells",
      },
      teleport: {
        count: 3,
        icon: "✨",
        name: "Teleport",
        description: "Claims any unclaimed cell, regardless of adjacency",
      },
      colorBomb: {
        count: 1,
        icon: "🎨",
        name: "Color Bomb",
        description:
          "Converts all connected enemy territories of the same owner",
      },
    };

    this.powerupContainer = document.getElementById("powerup-container");
    this.activePowerup = null;

    this.init();

    // Make this accessible globally for the grid visualization
    window.powerupSystem = this;
  }

  init() {
    this.renderPowerups();
    this.setupEventListeners();
  }

  // Render powerup interface
  renderPowerups() {
    if (!this.powerupContainer) return;

    let html = '<h4>Power-ups</h4><div class="powerup-list">';

    Object.entries(this.powerups).forEach(([type, powerup]) => {
      const disabled = powerup.count <= 0;
      html += `
        <div class="powerup-item ${
          disabled ? "disabled" : ""
        }" data-type="${type}">
          <div class="powerup-icon">${powerup.icon}</div>
          <div class="powerup-info">
            <div class="powerup-name">${powerup.name}</div>
            <div class="powerup-count">x${powerup.count}</div>
          </div>
          <div class="powerup-tooltip">
            <div class="powerup-description">${powerup.description}</div>
            <div class="powerup-usage">Click to activate, then click on a territory to use.</div>
          </div>
        </div>
      `;
    });

    html += "</div>";
    this.powerupContainer.innerHTML = html;
  }

  // Set up event listeners
  setupEventListeners() {
    if (!this.powerupContainer) return;

    // Powerup selection
    this.powerupContainer.addEventListener("click", (e) => {
      const powerupItem = e.target.closest(".powerup-item");
      if (!powerupItem) return;

      const powerupType = powerupItem.dataset.type;
      if (this.powerups[powerupType].count <= 0) return; // Can't use if count is 0

      if (this.activePowerup === powerupType) {
        // Deselect if already active
        this.deactivatePowerup();
      } else {
        // Activate new powerup
        this.activatePowerup(powerupType);
      }
    });

    // Cancel powerup on escape key
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && this.activePowerup) {
        this.deactivatePowerup();
      }
    });

    // Cancel powerup on right-click
    document.addEventListener("contextmenu", (e) => {
      if (this.activePowerup) {
        e.preventDefault();
        this.deactivatePowerup();
      }
    });
  }

  // Activate a powerup
  activatePowerup(powerupType) {
    // Deactivate any existing powerup
    if (this.activePowerup) {
      document
        .querySelector(`.powerup-item[data-type="${this.activePowerup}"]`)
        ?.classList.remove("active");
    }

    this.activePowerup = powerupType;
    document
      .querySelector(`.powerup-item[data-type="${powerupType}"]`)
      ?.classList.add("active");

    // Notify grid visualization
    if (this.grid) {
      this.grid.setActivePowerup(powerupType);
    }

    // Show usage message
    this.showNotification(
      `${this.powerups[powerupType].name} activated! Click on a territory to use.`
    );
  }

  // Deactivate the current powerup
  deactivatePowerup() {
    if (!this.activePowerup) return;

    document
      .querySelector(`.powerup-item[data-type="${this.activePowerup}"]`)
      ?.classList.remove("active");

    this.activePowerup = null;

    // Notify grid visualization
    if (this.grid) {
      this.grid.clearActivePowerup();
    }
  }

  // Use a powerup (called by grid when powerup is applied)
  usePowerup(powerupType) {
    if (!this.powerups[powerupType]) return;

    // Decrease count
    this.powerups[powerupType].count--;

    // Re-render powerups
    this.renderPowerups();

    // Show notification
    this.showNotification(
      `${this.powerups[powerupType].name} used successfully!`
    );
  }

  // Add a powerup (e.g., from daily rewards)
  addPowerup(powerupType, count = 1) {
    if (!this.powerups[powerupType]) return;

    this.powerups[powerupType].count += count;
    this.renderPowerups();

    // Show notification
    this.showNotification(
      `Received ${count} ${this.powerups[powerupType].name} powerup${
        count > 1 ? "s" : ""
      }!`
    );
  }

  // Show a notification message
  showNotification(message, duration = 3000) {
    let notificationContainer = document.getElementById(
      "notification-container"
    );

    if (!notificationContainer) {
      notificationContainer = document.createElement("div");
      notificationContainer.id = "notification-container";
      document.body.appendChild(notificationContainer);
    }

    const notification = document.createElement("div");
    notification.className = "notification";
    notification.textContent = message;

    notificationContainer.appendChild(notification);

    // Animate in
    setTimeout(() => {
      notification.classList.add("show");
    }, 10);

    // Remove after duration
    setTimeout(() => {
      notification.classList.remove("show");

      // Remove from DOM after animation
      setTimeout(() => {
        notification.remove();
      }, 300);
    }, duration);
  }

  // Generate random powerups (e.g., daily)
  generateRandomPowerups() {
    const powerupTypes = Object.keys(this.powerups);
    const randomIndex = Math.floor(Math.random() * powerupTypes.length);
    const randomType = powerupTypes[randomIndex];
    const count = Math.floor(Math.random() * 2) + 1; // 1 or 2 powerups

    this.addPowerup(randomType, count);
  }
}

// Export for module use
if (typeof module !== "undefined" && module.exports) {
  module.exports = PowerupSystem;
}
