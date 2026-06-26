import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./content/**/*.{md,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          "var(--font-golos-text)",
          "ui-sans-serif",
          "system-ui",
          "sans-serif",
        ],
        heading: ["var(--font-sansation)", "var(--font-golos-text)", "sans-serif"],
        onest: ["var(--font-onest)", "var(--font-golos-text)", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
