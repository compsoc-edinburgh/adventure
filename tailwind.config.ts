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
      keyframes: {
        slidein: {
          "0%": { transform: "scaleY(0)" },
          "100%": { transform: "scaleY(1)" },
        },
      },
      animation: {
        slidein: "slidein 0.25s ease-in-out forwards",
      },
    },
    fontFamily: {
      sans: ["\"Noto Sans\"", "sans-serif"],
      display: ["\"Fredericka the Great\"", "sans-serif"],
    },
  },
  plugins: [],
} satisfies Config;
