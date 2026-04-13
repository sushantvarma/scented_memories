import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        cream: "#FAF7F2",
        "warm-white": "#FFFDF9",
        sand: "#E8DDD0",
        taupe: "#C4B5A5",
        brown: "#8B6F5E",
        espresso: "#3D2B1F",
        gold: "#C9A96E",
        "gold-light": "#E8D5B0",
      },
      fontFamily: {
        serif: ["Cormorant Garamond", "Georgia", "serif"],
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      letterSpacing: {
        widest: "0.2em",
      },
    },
  },
  plugins: [],
};

export default config;
