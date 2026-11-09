import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#17304F",
        cream: "#F8F0E3",
        mint: "#DDF3E8",
        sky: "#DCE8FD",
        peach: "#FBE6C8",
        forest: "#277A5B",
        accent: "#F2A33A",
        slateText: "#49647B",
      },
      fontFamily: {
        sans: ["Lexend", "system-ui", "sans-serif"],
        dyslexic: ["OpenDyslexic", "Lexend", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
