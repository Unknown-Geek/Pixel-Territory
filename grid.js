/**
 * Pixel Territory Grid Visualization
 * Handles rendering and interaction with the game grid
 */

class GridVisualization {
  constructor(containerId, gridSize = 20) {
    this.container = document.getElementById(containerId);
    this.gridSize = gridSize;
    this.cellSize = 25; // default size, will be adjusted for responsiveness
    this.grid = [];
    this.selectedCell = null;
    this.playerColors = new Map();
    this.currentPlayerId = null;

    // Add new properties for interactive features
    this.selectedCell = null;
    this.validExpansionCells = [];
    this.activePowerup = null;

    this.init();
  }

  // Initialize the grid and event listeners
  init() {
    this.createGridDOM();
    this.setupEventListeners();
    this.adjustForScreenSize();
    this.renderGrid();
  }

  // Create the DOM structure for the grid
  createGridDOM() {
    this.container.innerHTML = "";
    this.container.className = "pixel-territory-grid";

    for (let y = 0; y < this.gridSize; y++) {
      for (let x = 0; x < this.gridSize; x++) {
        const cell = document.createElement("div");
        cell.className = "grid-cell";
        cell.dataset.x = x;
        cell.dataset.y = y;
        this.container.appendChild(cell);
      }
    }
  }

  // Set up event listeners for grid interaction
  setupEventListeners() {
    // Handle cell click events
    this.container.addEventListener("click", (e) => {
      if (e.target.classList.contains("grid-cell")) {
        this.handleCellClick(e.target);
      }
    });

    // Handle cell hover events
    this.container.addEventListener("mouseover", (e) => {
      if (e.target.classList.contains("grid-cell")) {
        this.handleCellHover(e.target);
      }
    });

    this.container.addEventListener("mouseout", (e) => {
      if (e.target.classList.contains("grid-cell")) {
        this.handleCellHoverExit(e.target);
      }
    });

    // Handle responsive resizing
    window.addEventListener("resize", () => {
      this.adjustForScreenSize();
    });
  }

  // Adjust grid for different screen sizes
  adjustForScreenSize() {
    const containerWidth = this.container.clientWidth;
    const newCellSize = Math.floor(containerWidth / this.gridSize);
    this.cellSize = newCellSize;

    document.documentElement.style.setProperty(
      "--cell-size",
      `${this.cellSize}px`
    );
  }

  // Update grid with new data from the server
  updateGrid(gridData) {
    this.grid = gridData;
    this.renderGrid();
  }

  // Render the entire grid based on current data
  renderGrid() {
    const cells = this.container.querySelectorAll(".grid-cell");

    cells.forEach((cell, index) => {
      const x = parseInt(cell.dataset.x);
      const y = parseInt(cell.dataset.y);
      const cellData = this.getCellData(x, y);

      this.renderCell(cell, cellData);
    });
  }

  // Get data for a specific cell
  getCellData(x, y) {
    // This would fetch from the actual game state
    // For now, return mock data
    return (
      this.grid[y * this.gridSize + x] || {
        owner: null,
        color: null,
        power: 0,
        timestamp: null,
      }
    );
  }

  // Render an individual cell
  renderCell(cellElement, cellData) {
    // Reset classes
    cellElement.className = "grid-cell";

    if (cellData.owner) {
      // Add owner-specific styling
      cellElement.classList.add("owned");
      cellElement.style.backgroundColor = this.getPlayerColor(cellData.owner);

      // Add pattern class for colorblind accessibility
      const patternClass = this.getPlayerPattern(cellData.owner);
      cellElement.classList.add(patternClass);

      // Adjust brightness based on power level
      const powerBrightness = 50 + cellData.power * 5;
      cellElement.style.filter = `brightness(${powerBrightness}%)`;

      // Add data attributes for accessibility and info display
      cellElement.dataset.owner = cellData.owner;
      cellElement.dataset.power = cellData.power;

      // Show shield status if cell is shielded
      if (cellData.shielded) {
        cellElement.classList.add("shielded");
      }
    } else {
      cellElement.style.backgroundColor = "#ccc";
    }
  }

  // Get consistent color for a player based on their ID
  getPlayerColor(playerId) {
    if (!this.playerColors.has(playerId)) {
      // Generate unique color using playerId as seed
      const hue = (playerId * 137.5) % 360;
      const color = `hsl(${hue}, 70%, 60%)`;
      this.playerColors.set(playerId, color);
    }
    return this.playerColors.get(playerId);
  }

  // Get pattern for colorblind accessibility
  getPlayerPattern(playerId) {
    // Create patterns based on player ID for colorblind accessibility
    const patterns = [
      "dots",
      "stripes-horizontal",
      "stripes-vertical",
      "stripes-diagonal",
      "crosshatch",
      "circles",
      "zigzag",
      "chevron",
    ];

    return patterns[(playerId - 1) % patterns.length];
  }

  // Handle cell click - attempt to claim territory
  handleCellClick(cellElement) {
    const x = parseInt(cellElement.dataset.x);
    const y = parseInt(cellElement.dataset.y);

    // Check if there's an active powerup
    if (this.activePowerup) {
      this.applyPowerup(x, y);
      return;
    }

    // If no cell is currently selected, select this one
    if (!this.selectedCell) {
      // Only allow selection of cells owned by current player
      const cellData = this.getCellData(x, y);
      if (cellData.owner === this.currentPlayerId) {
        this.selectCell(cellElement, x, y);
      }
      return;
    }

    // If this is the currently selected cell, deselect it
    if (this.selectedCell.x === x && this.selectedCell.y === y) {
      this.deselectCurrentCell();
      return;
    }

    // If this is a valid expansion cell, attempt to claim
    if (this.isValidExpansionCell(x, y)) {
      this.confirmClaim(x, y);
    } else {
      // Otherwise, select this cell if it belongs to the player
      const cellData = this.getCellData(x, y);
      if (cellData.owner === this.currentPlayerId) {
        this.deselectCurrentCell();
        this.selectCell(cellElement, x, y);
      }
    }
  }

  // Select a cell
  selectCell(cellElement, x, y) {
    // Deselect any previously selected cell
    this.deselectCurrentCell();

    // Mark this cell as selected
    this.selectedCell = { element: cellElement, x, y };
    cellElement.classList.add("selected-cell");

    // Show valid expansion options
    this.showValidExpansionOptions(x, y);
  }

  // Deselect the current cell
  deselectCurrentCell() {
    if (!this.selectedCell) return;

    this.selectedCell.element.classList.remove("selected-cell");
    this.selectedCell = null;

    // Clear expansion indicators
    this.clearExpansionIndicators();
  }

  // Show indicators for valid expansion from the selected cell
  showValidExpansionOptions(x, y) {
    this.validExpansionCells = [];
    const adjacentCoords = [
      [x - 1, y],
      [x + 1, y],
      [x, y - 1],
      [x, y + 1],
    ];

    adjacentCoords.forEach(([adjX, adjY]) => {
      if (
        adjX >= 0 &&
        adjX < this.gridSize &&
        adjY >= 0 &&
        adjY < this.gridSize
      ) {
        const adjCell = this.getCellElement(adjX, adjY);
        const adjCellData = this.getCellData(adjX, adjY);

        // If cell is unclaimed or belongs to another player with less power
        const selectedCellData = this.getCellData(x, y);
        let isValid = false;
        let successProbability = 1; // Default to 100% for unclaimed

        if (!adjCellData.owner) {
          // Unclaimed cell is always valid for expansion
          isValid = true;
        } else if (adjCellData.owner !== this.currentPlayerId) {
          // Enemy cell is valid if we have more power
          const attackingPower = selectedCellData.power;
          const defendingPower = adjCellData.power;

          if (attackingPower > defendingPower) {
            isValid = true;
            // Calculate success probability based on power difference
            successProbability = Math.min(
              0.9,
              0.5 + (attackingPower - defendingPower) / (2 * defendingPower)
            );
          }
        }

        if (isValid) {
          // Add color-coding based on success probability
          if (!adjCellData.owner) {
            // Unclaimed territory - green
            adjCell.classList.add("valid-expansion");
          } else {
            // Color code based on probability of success
            if (successProbability > 0.7) {
              adjCell.classList.add("valid-expansion-high");
            } else if (successProbability > 0.4) {
              adjCell.classList.add("valid-expansion-medium");
            } else {
              adjCell.classList.add("valid-expansion-low");
            }
          }

          // Store success probability for use in tooltip
          adjCell.dataset.successProbability = Math.round(
            successProbability * 100
          );

          this.validExpansionCells.push({
            x: adjX,
            y: adjY,
            successProbability: successProbability,
          });
        }
      }
    });
  }

  // Clear expansion indicators
  clearExpansionIndicators() {
    document
      .querySelectorAll(
        ".valid-expansion, .valid-expansion-high, .valid-expansion-medium, .valid-expansion-low"
      )
      .forEach((cell) => {
        cell.classList.remove(
          "valid-expansion",
          "valid-expansion-high",
          "valid-expansion-medium",
          "valid-expansion-low"
        );
        delete cell.dataset.successProbability;
      });
    this.validExpansionCells = [];
  }

  // Check if a cell is valid for expansion
  isValidExpansionCell(x, y) {
    return this.validExpansionCells.some(
      (cell) => cell.x === x && cell.y === y
    );
  }

  // Show confirmation dialog for claiming a cell
  confirmClaim(x, y) {
    const cellData = this.getCellData(x, y);
    const isOccupied = !!cellData.owner;
    const attackingPower = this.getCellData(
      this.selectedCell.x,
      this.selectedCell.y
    ).power;
    let confirmMessage;

    if (!isOccupied) {
      confirmMessage = `Claim this territory using 10 tokens?`;
    } else {
      const defenderName = `Player ${cellData.owner}`;
      const defenderPower = cellData.power;
      confirmMessage = `Attack ${defenderName}'s territory? (Power: ${attackingPower} vs ${defenderPower})`;
    }

    this.showConfirmationDialog(confirmMessage, () => {
      this.attemptClaimCell(x, y, this.selectedCell.x, this.selectedCell.y);
      this.deselectCurrentCell();
    });
  }

  // Show a confirmation dialog
  showConfirmationDialog(message, confirmCallback) {
    // Create dialog if it doesn't exist
    let dialogOverlay = document.getElementById("dialog-overlay");
    if (!dialogOverlay) {
      dialogOverlay = document.createElement("div");
      dialogOverlay.id = "dialog-overlay";

      const dialogBox = document.createElement("div");
      dialogBox.className = "dialog-box";

      const dialogContent = document.createElement("div");
      dialogContent.className = "dialog-content";

      const buttonContainer = document.createElement("div");
      buttonContainer.className = "dialog-buttons";

      const confirmButton = document.createElement("button");
      confirmButton.className = "dialog-button confirm-button";
      confirmButton.textContent = "Confirm";

      const cancelButton = document.createElement("button");
      cancelButton.className = "dialog-button cancel-button";
      cancelButton.textContent = "Cancel";

      buttonContainer.appendChild(cancelButton);
      buttonContainer.appendChild(confirmButton);

      dialogBox.appendChild(dialogContent);
      dialogBox.appendChild(buttonContainer);
      dialogOverlay.appendChild(dialogBox);

      document.body.appendChild(dialogOverlay);
    }

    // Update dialog content
    const dialogContent = dialogOverlay.querySelector(".dialog-content");
    dialogContent.textContent = message;

    // Set up event listeners
    const confirmButton = dialogOverlay.querySelector(".confirm-button");
    const cancelButton = dialogOverlay.querySelector(".cancel-button");

    const confirmHandler = () => {
      confirmCallback();
      this.closeConfirmationDialog();
    };

    const cancelHandler = () => {
      this.closeConfirmationDialog();
    };

    // Remove existing listeners
    const newConfirmButton = confirmButton.cloneNode(true);
    const newCancelButton = cancelButton.cloneNode(true);

    confirmButton.parentNode.replaceChild(newConfirmButton, confirmButton);
    cancelButton.parentNode.replaceChild(newCancelButton, cancelButton);

    // Add new listeners
    newConfirmButton.addEventListener("click", confirmHandler);
    newCancelButton.addEventListener("click", cancelHandler);

    // Show the dialog
    dialogOverlay.style.display = "flex";
  }

  // Close the confirmation dialog
  closeConfirmationDialog() {
    const dialogOverlay = document.getElementById("dialog-overlay");
    if (dialogOverlay) {
      dialogOverlay.style.display = "none";
    }
  }

  // Modified claim cell to include source cell
  attemptClaimCell(x, y, sourceX, sourceY) {
    // This would make an API call to the server
    // For demo, we'll simulate success/failure
    const success = Math.random() > 0.3; // 70% success rate for demo

    const cellElement = this.getCellElement(x, y);
    const sourceCell = this.getCellData(sourceX, sourceY);

    if (success) {
      this.showSuccessfulClaimFeedback(cellElement);

      // Update local data to reflect the claim
      setTimeout(() => {
        const cellIndex = y * this.gridSize + x;
        this.grid[cellIndex] = {
          owner: this.currentPlayerId || 1,
          color: this.getPlayerColor(this.currentPlayerId || 1),
          power: Math.max(1, Math.floor(sourceCell.power * 0.7)), // Transfer some power from source cell
          timestamp: new Date().toISOString(),
        };

        // Reduce power in source cell
        const sourceCellIndex = sourceY * this.gridSize + sourceX;
        this.grid[sourceCellIndex].power = Math.floor(sourceCell.power * 0.5);

        // Re-render both cells
        this.renderCell(cellElement, this.grid[cellIndex]);
        this.renderCell(
          this.getCellElement(sourceX, sourceY),
          this.grid[sourceCellIndex]
        );

        // Update dashboard if it exists
        if (typeof PlayerDashboard !== "undefined" && window.dashboard) {
          window.dashboard.updatePlayerStats(this.grid);
        }
      }, 500);
    } else {
      this.showFailedClaimFeedback(cellElement);
    }
  }

  // Set active powerup
  setActivePowerup(powerupType) {
    this.activePowerup = powerupType;
    document.body.classList.add("powerup-active");
    document.body.classList.add(`powerup-${powerupType}`);

    // Deselect current cell when activating powerup
    this.deselectCurrentCell();
  }

  // Clear active powerup
  clearActivePowerup() {
    if (!this.activePowerup) return;

    document.body.classList.remove("powerup-active");
    document.body.classList.remove(`powerup-${this.activePowerup}`);
    this.activePowerup = null;
  }

  // Apply powerup to a cell
  applyPowerup(x, y) {
    if (!this.activePowerup) return;

    const powerupType = this.activePowerup;
    const cellElement = this.getCellElement(x, y);
    const cellData = this.getCellData(x, y);

    let success = false;

    switch (powerupType) {
      case "shield":
        // Can only shield your own territory
        if (cellData.owner === this.currentPlayerId) {
          this.applyShield(x, y);
          success = true;
        }
        break;

      case "bomb":
        // Can only bomb enemy or unclaimed territory
        if (cellData.owner !== this.currentPlayerId) {
          this.applyBomb(x, y);
          success = true;
        }
        break;

      case "teleport":
        // Can claim any unclaimed territory
        if (!cellData.owner) {
          this.applyTeleport(x, y);
          success = true;
        }
        break;

      case "colorBomb":
        // Can only use on enemy territory
        if (cellData.owner && cellData.owner !== this.currentPlayerId) {
          this.applyColorBomb(x, y);
          success = true;
        }
        break;
    }

    if (success) {
      // Powerup was used successfully
      this.clearActivePowerup();

      // Notify powerup system
      if (window.powerupSystem) {
        window.powerupSystem.usePowerup(powerupType);
      }
    } else {
      // Feedback for invalid powerup use
      this.showInvalidClaimFeedback(cellElement);
    }
  }

  // Apply shield powerup
  applyShield(x, y) {
    const cellElement = this.getCellElement(x, y);
    const cellIndex = y * this.gridSize + x;

    // Add shield to cell
    cellElement.classList.add("shielded");
    this.grid[cellIndex].shielded = true;
    this.grid[cellIndex].shieldExpires = Date.now() + 60000; // 1 minute shield

    // Show shield animation
    cellElement.classList.add("shield-animation");
    setTimeout(() => cellElement.classList.remove("shield-animation"), 1000);
  }

  // Apply bomb powerup
  applyBomb(x, y) {
    // Bomb affects target cell and adjacent cells
    const targetCoords = [
      [x, y],
      [x - 1, y],
      [x + 1, y],
      [x, y - 1],
      [x, y + 1],
    ];

    targetCoords.forEach(([bx, by]) => {
      if (bx >= 0 && bx < this.gridSize && by >= 0 && by < this.gridSize) {
        const bombElement = this.getCellElement(bx, by);
        const bombIndex = by * this.gridSize + bx;
        const bombData = this.getCellData(bx, by);

        // Only affect enemy or unclaimed cells
        if (!bombData.owner || bombData.owner !== this.currentPlayerId) {
          // Show bomb animation
          bombElement.classList.add("bomb-animation");
          setTimeout(
            () => bombElement.classList.remove("bomb-animation"),
            1000
          );

          // Set cell to claimed after animation
          setTimeout(() => {
            this.grid[bombIndex] = {
              owner: this.currentPlayerId,
              color: this.getPlayerColor(this.currentPlayerId),
              power: 3, // Bombs create moderate power
              timestamp: new Date().toISOString(),
            };
            this.renderCell(bombElement, this.grid[bombIndex]);

            // Update dashboard if it exists
            if (typeof PlayerDashboard !== "undefined" && window.dashboard) {
              window.dashboard.updatePlayerStats(this.grid);
            }
          }, 600);
        }
      }
    });
  }

  // Apply teleport powerup
  applyTeleport(x, y) {
    const cellElement = this.getCellElement(x, y);
    const cellIndex = y * this.gridSize + x;

    // Show teleport animation
    cellElement.classList.add("teleport-animation");
    setTimeout(() => cellElement.classList.remove("teleport-animation"), 1000);

    // Set cell to claimed after animation
    setTimeout(() => {
      this.grid[cellIndex] = {
        owner: this.currentPlayerId,
        color: this.getPlayerColor(this.currentPlayerId),
        power: 2, // Teleport creates medium power
        timestamp: new Date().toISOString(),
      };
      this.renderCell(cellElement, this.grid[cellIndex]);

      // Update dashboard if it exists
      if (typeof PlayerDashboard !== "undefined" && window.dashboard) {
        window.dashboard.updatePlayerStats(this.grid);
      }
    }, 500);
  }

  // Apply color bomb powerup
  applyColorBomb(x, y) {
    const cellElement = this.getCellElement(x, y);
    const cellIndex = y * this.gridSize + x;
    const targetOwner = this.grid[cellIndex].owner;

    // Show color bomb animation
    cellElement.classList.add("color-bomb-animation");
    setTimeout(
      () => cellElement.classList.remove("color-bomb-animation"),
      1000
    );

    // Convert this cell and all adjacent cells of the same owner
    const processedCells = new Set();
    const cellsToProcess = [[x, y]];

    // Breadth-first search to find all connected cells of the same owner
    while (cellsToProcess.length > 0) {
      const [cx, cy] = cellsToProcess.shift();
      const coordKey = `${cx},${cy}`;

      // Skip already processed cells
      if (processedCells.has(coordKey)) continue;
      processedCells.add(coordKey);

      const idx = cy * this.gridSize + cx;
      if (
        idx >= 0 &&
        idx < this.grid.length &&
        this.grid[idx] &&
        this.grid[idx].owner === targetOwner
      ) {
        // Convert this cell
        setTimeout(() => {
          this.grid[idx] = {
            owner: this.currentPlayerId,
            color: this.getPlayerColor(this.currentPlayerId),
            power: 1,
            timestamp: new Date().toISOString(),
          };
          this.renderCell(this.getCellElement(cx, cy), this.grid[idx]);

          // Update dashboard if it exists
          if (typeof PlayerDashboard !== "undefined" && window.dashboard) {
            window.dashboard.updatePlayerStats(this.grid);
          }
        }, 500);

        // Add adjacent cells to the queue
        const adjacent = [
          [cx - 1, cy],
          [cx + 1, cy],
          [cx, cy - 1],
          [cx, cy + 1],
        ];

        adjacent.forEach(([ax, ay]) => {
          if (ax >= 0 && ax < this.gridSize && ay >= 0 && ay < this.gridSize) {
            const adjIdx = ay * this.gridSize + ax;
            if (this.grid[adjIdx] && this.grid[adjIdx].owner === targetOwner) {
              const adjKey = `${ax},${ay}`;
              if (!processedCells.has(adjKey)) {
                cellsToProcess.push([ax, ay]);
              }
            }
          }
        });
      }
    }
  }

  // Visual feedback for successful claim
  showSuccessfulClaimFeedback(cellElement) {
    cellElement.classList.add("claim-success");
    setTimeout(() => {
      cellElement.classList.remove("claim-success");
    }, 1000);
  }

  // Visual feedback for failed claim
  showFailedClaimFeedback(cellElement) {
    cellElement.classList.add("claim-failed");
    setTimeout(() => {
      cellElement.classList.remove("claim-failed");
    }, 1000);
  }

  // Visual feedback for invalid claim attempt
  showInvalidClaimFeedback(cellElement) {
    cellElement.classList.add("claim-invalid");
    setTimeout(() => {
      cellElement.classList.remove("claim-invalid");
    }, 1000);
  }

  // Handle cell hover to show tooltip
  handleCellHover(cellElement) {
    const x = parseInt(cellElement.dataset.x);
    const y = parseInt(cellElement.dataset.y);
    const cellData = this.getCellData(x, y);

    // Create/update tooltip
    let tooltip = document.getElementById("cell-tooltip");
    if (!tooltip) {
      tooltip = document.createElement("div");
      tooltip.id = "cell-tooltip";
      document.body.appendChild(tooltip);
    }

    // Format cell information
    let tooltipContent = `Position: (${x}, ${y})<br>`;
    if (cellData.owner) {
      tooltipContent += `Owner: Player ${cellData.owner}<br>`;
      tooltipContent += `Power: ${cellData.power}<br>`;
      tooltipContent += `Captured: ${this.formatTimestamp(cellData.timestamp)}`;

      if (cellData.shielded) {
        tooltipContent += `<br><span class="shield-info">🛡️ Shielded</span>`;
      }
    } else {
      tooltipContent += "Unclaimed Territory";
    }

    // Add success probability if this is a valid expansion cell
    if (cellElement.dataset.successProbability) {
      tooltipContent += `<br><span class="probability-info">Claim success: ${cellElement.dataset.successProbability}%</span>`;
    }

    tooltip.innerHTML = tooltipContent;

    // Position tooltip near the cell
    const rect = cellElement.getBoundingClientRect();
    tooltip.style.left = `${rect.right + 5}px`;
    tooltip.style.top = `${rect.top}px`;
    tooltip.style.display = "block";

    // Highlight valid adjacent cells if this is the player's territory
    if (cellData.owner === this.currentPlayerId) {
      this.highlightAdjacentCells(x, y);
    }
  }

  // Format timestamp for display
  formatTimestamp(timestamp) {
    if (!timestamp) return "Unknown";

    const date = new Date(timestamp);
    return date.toLocaleString();
  }

  // Highlight cells adjacent to the given coordinates
  highlightAdjacentCells(x, y) {
    const adjacentCoords = [
      [x - 1, y],
      [x + 1, y],
      [x, y - 1],
      [x, y + 1],
    ];

    adjacentCoords.forEach(([adjX, adjY]) => {
      if (
        adjX >= 0 &&
        adjX < this.gridSize &&
        adjY >= 0 &&
        adjY < this.gridSize
      ) {
        const adjCell = this.getCellElement(adjX, adjY);
        adjCell.classList.add("adjacent-cell");
      }
    });
  }

  // Handle cell hover exit
  handleCellHoverExit(cellElement) {
    const tooltip = document.getElementById("cell-tooltip");
    if (tooltip) {
      tooltip.style.display = "none";
    }

    // Remove adjacent cell highlighting
    const adjacentCells = document.querySelectorAll(".adjacent-cell");
    adjacentCells.forEach((cell) => {
      cell.classList.remove("adjacent-cell");
    });
  }

  // Set current player ID
  setPlayer(playerId) {
    this.currentPlayerId = playerId;
  }
}

// Export for module use
if (typeof module !== "undefined" && module.exports) {
  module.exports = GridVisualization;
}
