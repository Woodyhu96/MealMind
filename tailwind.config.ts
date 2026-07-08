import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        paper: "#F5F5F7",
        ink: "#1D1D1F",
        muted: "#6E6E73",
        line: "#D9D9DE",
        sage: "#CFE5D5",
        citrus: "#F6D77A",
        tomato: "#F07F63",
        ocean: "#8AC5D8",
      },
      boxShadow: {
        soft: "0 22px 60px rgba(29, 29, 31, 0.10)",
      },
      fontFamily: {
        sans: [
          "Inter",
          "-apple-system",
          "BlinkMacSystemFont",
          "SF Pro Display",
          "SF Pro Text",
          "Segoe UI",
          "sans-serif",
        ],
      },
    },
  },
  plugins: [],
} satisfies Config;
