import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ground: "#060607",
        panel: "#111113",
        ink: "#ededed",
        muted: "#8d8d93",
        line: "#232327",
        // The bulb in the lab's own logo. 8.6:1 on `ground`.
        ember: "#f7941d",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;
