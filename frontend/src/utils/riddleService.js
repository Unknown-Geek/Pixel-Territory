// Riddle service to manage riddles and prevent repetition

// Collection of riddles with questions and answers
const riddles = [
  {
    question:
      "I speak without a mouth and hear without ears. I have no body, but I come alive with wind. What am I?",
    answer: "echo",
  },
  {
    question: "The more you take, the more you leave behind. What am I?",
    answer: "footsteps",
  },
  {
    question:
      "What has keys but no locks, space but no room, and you can enter but not go in?",
    answer: "keyboard",
  },
  {
    question: "I'm tall when I'm young, and I'm short when I'm old. What am I?",
    answer: "candle",
  },
  {
    question: "What is always in front of you but can't be seen?",
    answer: "future",
  },
  {
    question: "What gets wet while drying?",
    answer: "towel",
  },
  {
    question: "What has a head and a tail, but no body?",
    answer: "coin",
  },
  {
    question: "What can you break, even if you never pick it up or touch it?",
    answer: "promise",
  },
  {
    question: "What has one eye but can't see?",
    answer: "needle",
  },
  {
    question: "What can you catch but not throw?",
    answer: "cold",
  },
];

// Keep track of used riddles to avoid repetition
let usedRiddleIndices = [];

/**
 * Gets a random riddle that hasn't been used recently
 * @returns {Object} A riddle with question and answer properties
 */
export const getRandomRiddle = () => {
  // If all riddles have been used, reset the tracking
  if (usedRiddleIndices.length >= riddles.length) {
    usedRiddleIndices = [];
  }

  // Get available riddle indices
  const availableIndices = riddles
    .map((_, index) => index)
    .filter((index) => !usedRiddleIndices.includes(index));

  // Select a random index from available ones
  const randomIndex =
    availableIndices[Math.floor(Math.random() * availableIndices.length)];

  // Mark this riddle as used
  usedRiddleIndices.push(randomIndex);

  return riddles[randomIndex];
};

/**
 * Validates if the provided answer matches the riddle's answer
 * @param {string} riddleQuestion - The question to match
 * @param {string} userAnswer - The user's answer
 * @returns {boolean} True if the answer is correct
 */
export const checkRiddleAnswer = (riddleQuestion, userAnswer) => {
  const riddle = riddles.find((r) => r.question === riddleQuestion);
  if (!riddle) return false;

  return riddle.answer.toLowerCase() === userAnswer.toLowerCase();
};

/**
 * Reset used riddles tracking
 */
export const resetRiddleTracking = () => {
  usedRiddleIndices = [];
};
