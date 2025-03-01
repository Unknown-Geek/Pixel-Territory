const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY; // Replace with your actual API key
const API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateText";

export const generateRiddle = async () => {
  try {
    const response = await fetch(`${API_URL}?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt: {
          text: "Generate a short riddle with its answer. Format it as JSON with 'question' and 'answer' fields. The riddle should be family-friendly and easy to medium difficulty.",
        },
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to generate riddle");
    }

    const data = await response.json();
    // Parse the response to extract riddle and answer
    const riddleJson = JSON.parse(data.candidates[0].text);
    return {
      question: riddleJson.question,
      answer: riddleJson.answer.toLowerCase().trim(),
    };
  } catch (error) {
    console.error("Error generating riddle:", error);
    return null;
  }
};
