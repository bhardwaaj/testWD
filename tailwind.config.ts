import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#02040a",
        foreground: "hsl(210 40% 98%)",
        card: "#050814",
        "card-muted": "#070b1d",
        border: "rgba(16, 185, 129, 0.4)",
        primary: {
          DEFAULT: "hsl(142 70% 45%)",
          foreground: "hsl(210 40% 98%)",
        },
        success: "hsl(142 76% 36%)",
        danger: "hsl(0 72% 51%)",
      },
      boxShadow: {
        card: "0 24px 60px rgba(0,0,0,0.8)",
      },
    },
  },
  plugins: [],
};

export default config;

