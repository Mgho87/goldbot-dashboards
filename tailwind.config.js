/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Deep Diamond blue — primary brand colour.
        brand: {
          50: "#eef4ff",
          100: "#d9e6ff",
          200: "#b8ceff",
          300: "#8aaef5",
          400: "#5681e6",
          500: "#2f5fd0",
          600: "#1f4bb0",
          700: "#1b3e8f",
          800: "#173372",
          900: "#0f2750",
        },
        // Rich, clear gold (not pale champagne).
        gold: {
          50: "#fbf6e7",
          100: "#f6e9bf",
          200: "#edd488",
          300: "#ddb84a",
          400: "#cca227",
          500: "#b8860b",
          600: "#9c6f0a",
          700: "#7c5808",
        },
        // Soft executive surfaces.
        canvas: "#eef1f6",
        surface: "#ffffff",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "var(--font-inter)", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(16,24,40,0.04), 0 6px 18px -8px rgba(16,24,40,0.12)",
        "card-hover": "0 2px 4px rgba(16,24,40,0.06), 0 12px 28px -10px rgba(16,24,40,0.18)",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.5s cubic-bezier(0.16, 1, 0.3, 1) both",
      },
    },
  },
  plugins: [],
};
