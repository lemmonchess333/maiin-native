/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        background: "#0F0F14",
        surface: "#1A1A24",
        brand: "#8b5cf6",
        running: "#FF6B6B",
        teal: "#2dd4bf",
        success: "#34d399",
        warning: "#f59e0b",
        border: "#2A2A3A",
      },
    },
  },
  plugins: [],
};
