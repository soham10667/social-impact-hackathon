/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#080B14",
        secondaryBg: "#111827",
        cardBg: "#151D2E",
        primaryAccent: "#3B82F6",
        secondaryAccent: "#8B5CF6",
        mainText: "#F8FAFC",
        mutedText: "#B6C2D2",
        success: "#22C55E",
        warning: "#F59E0B",
        error: "#EF4444",
      },
    },
  },
  plugins: [],
};
