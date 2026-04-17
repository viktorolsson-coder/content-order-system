import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eef4ff",
          100: "#d9e3ff",
          500: "#4f6bff",
          600: "#3a55f0",
          700: "#2f44c6",
        },
      },
    },
  },
  plugins: [],
};

export default config;
