import type { Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {},
    fontFamily: {
      sans: ["\"Noto Sans\"", "sans-serif"],
      display: ["\"Fredericka the Great\"", "sans-serif"],
    },
  },
  plugins: [],
} satisfies Config;
