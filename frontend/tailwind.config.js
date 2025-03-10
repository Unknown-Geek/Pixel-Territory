/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      gridTemplateColumns: {
        20: "repeat(20, minmax(0, 1fr))",
      },
      animation: {
        rise: "rise 0.3s ease-out forwards",
        pulse: "pulse 2s infinite",
        "pulse-glow": "pulse-glow 1.5s ease-in-out infinite alternate",
      },
      keyframes: {
        rise: {
          "0%": { transform: "translateY(20px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        pulse: {
          "0%, 100%": { opacity: "0.4" },
          "50%": { opacity: "0.8" },
        },
        "pulse-glow": {
          from: {
            boxShadow:
              "0 0 5px var(--retro-accent), 0 0 10px var(--retro-accent)",
          },
          to: {
            boxShadow:
              "0 0 10px var(--retro-accent), 0 0 20px var(--retro-accent), 0 0 30px var(--retro-complement)",
          },
        },
      },
    },
  },
  plugins: [],
};
