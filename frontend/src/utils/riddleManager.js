import { getRandomQuestion } from "./questions";

class RiddleManager {
  constructor() {
    this.riddlePool = [];
    this.solvedRiddles = {};
    this.playerSolveCount = {};
    this.lastSolveTime = {};
    // Configurable limits
    this.maxRiddlesPerPeriod = 5;
    this.cooldownPeriodHours = 5;
  }

  setLimits(maxRiddles, cooldownHours) {
    this.maxRiddlesPerPeriod = maxRiddles;
    this.cooldownPeriodHours = cooldownHours;
  }

  generateRiddleBatch() {
    // Generate a pool of riddles to use
    const riddleCount = 20;
    this.riddlePool = [];

    for (let i = 0; i < riddleCount; i++) {
      const question = getRandomQuestion();
      this.riddlePool.push({
        id: `riddle-${Date.now()}-${i}`,
        question: question.question,
        answer: question.answer,
      });
    }
  }

  canSolveMoreRiddles(playerName) {
    if (!this.playerSolveCount[playerName]) {
      return true; // First time solving
    }

    // Check if player is within the solve limit for the current period
    if (this.playerSolveCount[playerName] < this.maxRiddlesPerPeriod) {
      return true;
    }

    // Check if cooldown period has passed since last solve
    const lastSolveTime = this.lastSolveTime[playerName] || 0;
    const currentTime = Date.now();
    const cooldownMs = this.cooldownPeriodHours * 60 * 60 * 1000;

    if (currentTime - lastSolveTime >= cooldownMs) {
      // Reset counter if cooldown period has passed
      this.playerSolveCount[playerName] = 0;
      return true;
    }

    return false;
  }

  getRiddlesRemaining(playerName) {
    if (!this.playerSolveCount[playerName]) {
      return this.maxRiddlesPerPeriod;
    }
    return Math.max(
      0,
      this.maxRiddlesPerPeriod - this.playerSolveCount[playerName]
    );
  }

  getCooldownTimeRemaining(playerName) {
    if (
      !this.lastSolveTime[playerName] ||
      this.getRiddlesRemaining(playerName) > 0
    ) {
      return 0; // No cooldown if player hasn't solved any riddles or has solves remaining
    }

    const lastSolveTime = this.lastSolveTime[playerName];
    const currentTime = Date.now();
    const cooldownMs = this.cooldownPeriodHours * 60 * 60 * 1000;
    const timeElapsed = currentTime - lastSolveTime;

    return Math.max(0, cooldownMs - timeElapsed);
  }

  async getNextRiddle(playerName) {
    // Check if player can solve more riddles
    if (!this.canSolveMoreRiddles(playerName)) {
      return {
        error: true,
        cooldownMs: this.getCooldownTimeRemaining(playerName),
        message: `You've reached the limit of ${this.maxRiddlesPerPeriod} riddles. Please wait before trying again.`,
      };
    }

    // Ensure we have riddles
    if (this.riddlePool.length === 0) {
      this.generateRiddleBatch();
    }

    // If player hasn't solved any riddles yet, initialize their record
    if (!this.solvedRiddles[playerName]) {
      this.solvedRiddles[playerName] = [];
    }

    // Find a riddle the player hasn't solved yet
    const unsolved = this.riddlePool.filter(
      (riddle) => !this.solvedRiddles[playerName].includes(riddle.id)
    );

    // If all riddles are solved, generate new batch
    if (unsolved.length === 0) {
      this.generateRiddleBatch();
      return this.getNextRiddle(playerName);
    }

    // Return a random unsolved riddle
    const randomIndex = Math.floor(Math.random() * unsolved.length);
    return unsolved[randomIndex];
  }

  markRiddleSolved(playerName, riddleId) {
    // Initialize player records if needed
    if (!this.solvedRiddles[playerName]) {
      this.solvedRiddles[playerName] = [];
    }
    if (!this.playerSolveCount[playerName]) {
      this.playerSolveCount[playerName] = 0;
    }

    // Add to solved riddles
    this.solvedRiddles[playerName].push(riddleId);

    // Update solve count and timestamp
    this.playerSolveCount[playerName]++;
    this.lastSolveTime[playerName] = Date.now();

    // Save to localStorage for persistence
    this.saveState();
  }

  saveState() {
    try {
      localStorage.setItem(
        "riddleManager_solvedRiddles",
        JSON.stringify(this.solvedRiddles)
      );
      localStorage.setItem(
        "riddleManager_playerSolveCount",
        JSON.stringify(this.playerSolveCount)
      );
      localStorage.setItem(
        "riddleManager_lastSolveTime",
        JSON.stringify(this.lastSolveTime)
      );
    } catch (e) {
      console.error("Failed to save riddle manager state:", e);
    }
  }

  loadState() {
    try {
      const solvedRiddles = localStorage.getItem("riddleManager_solvedRiddles");
      const playerSolveCount = localStorage.getItem(
        "riddleManager_playerSolveCount"
      );
      const lastSolveTime = localStorage.getItem("riddleManager_lastSolveTime");

      if (solvedRiddles) this.solvedRiddles = JSON.parse(solvedRiddles);
      if (playerSolveCount)
        this.playerSolveCount = JSON.parse(playerSolveCount);
      if (lastSolveTime) this.lastSolveTime = JSON.parse(lastSolveTime);
    } catch (e) {
      console.error("Failed to load riddle manager state:", e);
    }
  }
}

export const riddleManager = new RiddleManager();

// Load saved state when the module is imported
riddleManager.loadState();
