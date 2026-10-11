/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Light Green + White Design System
        primary: "#22C55E",          // Fresh Green
        primaryDark: "#16A34A",      // Darker Green for hover/emphasis
        secondary: "#4ADE80",        // Light accent green
        background: "#F0FDF4",       // Light Green Background tint
        pageBg: "#FAFDFA",           // Soft white with light green tint
        cardBg: "#FFFFFF",           // Clean white card background
        cardBorder: "#D1FAE5",       // Thin light-green border
        hoverBg: "#DCFCE7",          // Hover state light green
        
        // Typography tokens
        mainText: "#1F2937",         // Text Primary (Dark grey for high contrast readability)
        mutedText: "#6B7280",        // Text Secondary
        subtleText: "#9CA3AF",       // Subtle tertiary text
        
        // Status tokens
        success: "#16A34A",
        warning: "#F97316",
        error: "#EF4444",
        info: "#22C55E",

        // Retained semantic aliases mapped to Light Green theme
        primaryAccent: "#22C55E",
        primaryHover: "#16A34A",
        secondaryAccent: "#4ADE80",
        secondaryHover: "#22C55E",
        cyanAccent: "#10B981",
        emeraldAccent: "#22C55E",
        secondaryBg: "#F0FDF4",
      },
      boxShadow: {
        'soft-card': '0 4px 20px -2px rgba(34, 197, 94, 0.08), 0 2px 8px -2px rgba(0, 0, 0, 0.04)',
        'soft-hover': '0 12px 30px -4px rgba(34, 197, 94, 0.16), 0 4px 12px -2px rgba(0, 0, 0, 0.04)',
        'glow-green': '0 0 25px -4px rgba(34, 197, 94, 0.35)',
        'glow-soft': '0 0 18px 0 rgba(74, 222, 128, 0.25)',
        'button-primary': '0 4px 14px 0 rgba(34, 197, 94, 0.39)',
        'navbar-soft': '0 2px 14px 0 rgba(0, 0, 0, 0.04)',
      },
      borderRadius: {
        'card': '18px',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 5s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        }
      }
    },
  },
  plugins: [],
};
