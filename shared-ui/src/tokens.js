/**
 * Design tokens — the single source of truth for how the app looks.
 * Every app (rider, driver, admin) pulls colors/fonts from here via
 * tailwind-preset.js, instead of each person picking their own.
 *
 * Change a color here → it updates everywhere. Don't hardcode hex
 * values in individual app components.
 */

module.exports = {
  colors: {
    primary: {
      DEFAULT: "#0F62FE", // main brand blue — buttons, links, active states
      dark: "#0043CE",
      light: "#D0E2FF",
    },
    secondary: {
      DEFAULT: "#24A148", // success / "online" / "completed" green
      dark: "#198038",
      light: "#DEFBE6",
    },
    danger: {
      DEFAULT: "#DA1E28", // cancel / errors / "offline"
      light: "#FFF1F1",
    },
    warning: {
      DEFAULT: "#F1C21B", // pending / arriving / awaiting verification
      light: "#FCF4D6",
    },
    neutral: {
      50: "#F9FAFB",
      100: "#F2F4F8",
      200: "#DDE1E6",
      400: "#A2A9B0",
      600: "#697077",
      800: "#343A3F",
      900: "#161616",
    },
  },
  fontFamily: {
    sans: ["Inter", "system-ui", "sans-serif"],
  },
  borderRadius: {
    sm: "6px",
    md: "10px",
    lg: "16px",
    full: "9999px",
  },
  spacing: {
    // Tailwind already gives us a spacing scale (p-1, p-2, ...);
    // this is just documentation of what to use where.
    // xs=4px(1) sm=8px(2) md=16px(4) lg=24px(6) xl=32px(8)
  },
};
