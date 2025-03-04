import { getRandomQuestion } from "./questions";

class RiddleManager {
  constructor() {
    this.riddlePool = [];
    this.solvedRiddles = {};
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

  async getNextRiddle(playerName) {
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
    if (!this.solvedRiddles[playerName]) {
      this.solvedRiddles[playerName] = [];
    }
    this.solvedRiddles[playerName].push(riddleId);
  }
}

export const riddleManager = new RiddleManager();
