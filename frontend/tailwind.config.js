/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,jsx}",
    "./src/components/**/*.{js,jsx}",
    "./src/app/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#121212",
        card: "#1A1A1A",
        gold: {
          DEFAULT: "#F5C518",
          hover: "#C9860A",
          muted: "rgba(245, 197, 24, 0.15)",
        },
        text: {
          DEFAULT: "#F0F0F0",
          muted: "#888899",
        }
      },
      fontFamily: {
        noto: ["Noto Kufi Arabic", "sans-serif"],
      },
      backgroundImage: {
        "gold-gradient": "linear-gradient(135deg, #F5C518, #C9860A)",
        "dark-gradient": "linear-gradient(180deg, #1A1A1A, #121212)",
      },
      animation: {
        "float": "float 6s ease-in-out infinite",
        "spin-slow": "spin 12s linear infinite",
        "pulse-gold": "pulse-gold 3s ease-in-out infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0) rotate(0deg)" },
          "50%": { transform: "translateY(-20px) rotate(5deg)" },
        },
        "pulse-gold": {
          "0%, 100%": { opacity: 1, transform: "scale(1)" },
          "50%": { opacity: 0.5, transform: "scale(1.05)" },
        }
      }
    },
  },
      fontFamily: {
        ginto: ['ABC Ginto Nord', 'Outfit', 'sans-serif'],
      },
      plugins: [],
};
