/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ["Fraunces", "Georgia", "serif"],
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
      },
      colors: {
        warm: {
          bg: "#FAF9F6",
          surface: "#FFFFFF",
          border: "#ECEAE4",
        },
        ink: {
          primary: "#1A1A1E",
          muted: "#6B6B75",
        },
        terracotta: {
          DEFAULT: "#C4622D",
          hover: "#B05423",
          light: "rgba(196, 98, 45, 0.15)",
        },
        category: {
          comedy: "#E8A23D",
          theatre: "#8B5FBF",
          music: "#D9527A",
          literature: "#3D8B7A",
          art: "#C4622D",
        },
      },
      boxShadow: {
        card: "0 2px 12px rgba(0, 0, 0, 0.06)",
        "card-hover": "0 6px 20px rgba(0, 0, 0, 0.08)",
        floating: "0 8px 30px rgba(0, 0, 0, 0.08)",
      },
      borderRadius: {
        card: "12px",
        cta: "8px",
      },
    },
  },
  plugins: [],
}


