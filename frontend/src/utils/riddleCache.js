class RiddleCache {
  constructor() {
    this.riddles = [];
    this.usedRiddleIds = new Set();
    this.generatingBatch = false;
  }

  async init() {
    const stored = localStorage.getItem("cachedRiddles");
    const usedIds = localStorage.getItem("usedRiddleIds");

    if (stored) {
      this.riddles = JSON.parse(stored);
      this.usedRiddleIds = new Set(JSON.parse(usedIds));
    }

    if (this.riddles.length < 10) {
      await this.generateBatch();
    }
  }

  async generateBatch() {
    if (this.generatingBatch) return;
    this.generatingBatch = true;

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateText`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_GEMINI_API_KEY}`,
          },
          body: JSON.stringify({
            prompt: {
              text: "Generate 20 unique riddles in JSON array format. Each riddle should have 'id', 'question', and 'answer' fields. Make them family-friendly and easy to medium difficulty.",
            },
          }),
        }
      );

      const data = await response.json();
      const newRiddles = JSON.parse(data.candidates[0].text);

      // Filter out any riddles we've already used
      const uniqueRiddles = newRiddles.filter(
        (r) => !this.usedRiddleIds.has(r.id)
      );
      this.riddles.push(...uniqueRiddles);

      // Save to localStorage
      this.saveToStorage();
    } catch (error) {
      console.error("Error generating riddles:", error);
    } finally {
      this.generatingBatch = false;
    }
  }

  getRiddle() {
    if (this.riddles.length < 5) {
      this.generateBatch(); // Generate more for next time
    }

    if (this.riddles.length === 0) {
      return {
        id: "fallback",
        question: "What gets wetter as it dries?",
        answer: "towel",
      };
    }

    // Get a random riddle from available ones
    const index = Math.floor(Math.random() * this.riddles.length);
    const riddle = this.riddles[index];

    // Remove the used riddle
    this.riddles.splice(index, 1);
    this.usedRiddleIds.add(riddle.id);

    this.saveToStorage();
    return riddle;
  }

  saveToStorage() {
    localStorage.setItem("cachedRiddles", JSON.stringify(this.riddles));
    localStorage.setItem(
      "usedRiddleIds",
      JSON.stringify([...this.usedRiddleIds])
    );
  }
}

export const riddleCache = new RiddleCache();
