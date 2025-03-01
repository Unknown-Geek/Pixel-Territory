import { generateRiddle } from './geminiService';

class RiddleManager {
  constructor() {
    this.riddles = [];
    this.playerHistory = new Map(); // Track riddles shown to each player
    this.isGenerating = false;
  }

  async generateRiddleBatch(count = 50) {
    if (this.isGenerating) return;
    this.isGenerating = true;
    
    const newRiddles = [];
    for (let i = 0; i < count; i++) {
      try {
        const riddle = await generateRiddle();
        if (riddle) {
          newRiddles.push({ ...riddle, id: Date.now() + i });
        }
      } catch (error) {
        console.error('Error generating riddle:', error);
      }
    }
    
    this.riddles.push(...newRiddles);
    this.isGenerating = false;
  }

  async getNextRiddle(playerId) {
    // Initialize player history if not exists
    if (!this.playerHistory.has(playerId)) {
      this.playerHistory.set(playerId, new Set());
    }

    // Get player's solved riddles
    const playerSolved = this.playerHistory.get(playerId);

    // Find a riddle the player hasn't seen
    const availableRiddle = this.riddles.find(riddle => !playerSolved.has(riddle.id));

    // If running low on unseen riddles, generate more
    if (this.riddles.length - playerSolved.size < 10) {
      this.generateRiddleBatch();
    }

    // If no available riddle, wait for new batch or use fallback
    if (!availableRiddle) {
      return {
        id: 'fallback',
        question: "What goes up but never comes down?",
        answer: "age"
      };
    }

    return availableRiddle;
  }

  markRiddleSolved(playerId, riddleId) {
    if (!this.playerHistory.has(playerId)) {
      this.playerHistory.set(playerId, new Set());
    }
    this.playerHistory.get(playerId).add(riddleId);
  }
}

export const riddleManager = new RiddleManager();
