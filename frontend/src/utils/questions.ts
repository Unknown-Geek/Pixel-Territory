// A collection of riddles and trivia questions with answers

const questionPool = [
  {
    question: "I'm tall when I'm young, and I'm short when I'm old. What am I?",
    answer: "candle",
  },
  {
    question: "What is always in front of you but can't be seen?",
    answer: "future",
  },
  {
    question: "What can travel around the world while staying in a corner?",
    answer: "stamp",
  },
  {
    question: "What has many keys but can't open a single lock?",
    answer: "piano",
  },
  {
    question: "What gets wet while drying?",
    answer: "towel",
  },
  {
    question: "What can you break, even if you never pick it up or touch it?",
    answer: "promise",
  },
  {
    question: "What has a head and a tail, but no body?",
    answer: "coin",
  },
  {
    question:
      "What five-letter word becomes shorter when you add two letters to it?",
    answer: "short",
  },
  {
    question: "What has legs, but doesn't walk?",
    answer: "table",
  },
  {
    question: "What has one eye, but can't see?",
    answer: "needle",
  },
  {
    question: "What has a neck but no head?",
    answer: "bottle",
  },
  {
    question: "What is full of holes but still holds water?",
    answer: "sponge",
  },
  {
    question: "What can you catch but not throw?",
    answer: "cold",
  },
  {
    question:
      "I have cities, but no houses. I have mountains, but no trees. I have water, but no fish. What am I?",
    answer: "map",
  },
  {
    question: "What is so fragile that saying its name breaks it?",
    answer: "silence",
  },
];

export const getRandomQuestion = () => {
  const randomIndex = Math.floor(Math.random() * questionPool.length);
  return questionPool[randomIndex];
};
