import type { Config } from "tailwindcss";

const config: Config = {
  theme: {
    extend: {
      colors: {
        bg: {
          base: "#F5F7FF",
          surface: "#FFFFFF",
          raised: "#EEF1FB",
          border: "#DDE2F0",
        },
        brand: {
          DEFAULT: "#4F6EF7",
          soft: "#3D5CE5",
          muted: "#EAF0FF",
          glow: "rgba(79,110,247,0.08)",
        },
        text: {
          primary: "#0D1117",
          secondary: "#5A6482",
          muted: "#9BA3BE",
        },
        success: "#16A34A",
        danger: "#E11D48",
        warning: "#D97706",
      },
    },
  },
};

export default config;
