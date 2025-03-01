export const questions = [
  {
    id: 1,
    question:
      "What has keys, but no locks; space, but no room; and you can enter, but not go in?",
    answer: "keyboard",
    difficulty: "easy",
  },
  {
    id: 2,
    question: "What gets wetter and wetter the more it dries?",
    answer: "towel",
    difficulty: "easy",
  },
  {
    id: 3,
    question:
      "I am taken from a mine and shut up in a wooden case, from which I am never released, and yet I am used by everyone.",
    answer: "pencil",
    difficulty: "medium",
  },
  // Add more questions as needed
];

export const getRandomQuestion = () => {
  return questions[Math.floor(Math.random() * questions.length)];
};
