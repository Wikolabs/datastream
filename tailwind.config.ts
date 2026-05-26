import type { Config } from "tailwindcss";
export default {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["'Syncopate'", "sans-serif"],
        body: ["'Space Mono'", "sans-serif"],
      },
    },
  },
  plugins: [],
} satisfies Config;
