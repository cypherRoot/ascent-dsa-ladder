import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0C0D10",
        surface: "#15171C",
        surface2: "#1C1F26",
        line: "#2A2E37",
        line2: "#363B45",
        text: "#E8E9ED",
        muted: "#8A8F9C",
        faint: "#5A606C",
        accent: "#7C6CF6",
        accentSoft: "#9C90F8",
        easy: "#6EE7B7",
        medium: "#FBBF77",
        hard: "#F87171",
      },
      fontFamily: {
        display: ["var(--font-display)", "system-ui", "sans-serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      maxWidth: { shell: "1180px" },
    },
  },
  plugins: [],
};
export default config;
