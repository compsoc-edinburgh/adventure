import type { Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        christmasGreen: "#516152",
        christmasGreenAccent: "#c1cebd",
        christmasBeige: "#f4ebdc",
        christmasBeigeAccent: "#e5d7c3",
        christmasRed: "#882626",
        christmasRedAccent: "#b53635",
        christmasDark: "#464646",
      },
    },
    fontFamily: {
      sans: ["\"Noto Sans\"", "sans-serif"],
      display: ["\"Fredericka the Great\"", "sans-serif"],
    },
  },
  plugins: [],
} satisfies Config;
