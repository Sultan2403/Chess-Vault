/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        vault: {
          canvas: "#FDFBF7", surface: "#F5F0E6", muted: "#E5DED0",
          ink: "#3C2A21", secondary: "#6D5D51", gold: "#C5A059",
          goldDark: "#815B0D", wood: "#25160E", line: "#DED6C8",
        },
      },
      fontFamily: { display: ['"Libre Caslon Text"', "Georgia", "serif"], body: ["Karla", "Arial", "sans-serif"] },
      borderRadius: { vault: "0.25rem" },
      keyframes: {
        "rise-in": { "0%": { opacity: "0", transform: "translateY(16px)" }, "100%": { opacity: "1", transform: "translateY(0)" } },
        "paper-shift": { "0%, 100%": { transform: "translateY(0)" }, "50%": { transform: "translateY(-4px)" } },
      },
      animation: { "rise-in": "rise-in 600ms cubic-bezier(.22,1,.36,1) both", "paper-shift": "paper-shift 5s ease-in-out infinite" },
    },
  },
  plugins: [],
};
