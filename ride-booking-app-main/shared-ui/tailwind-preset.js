const tokens = require("./src/tokens");

/**
 * Every app's tailwind.config.js does:
 *   presets: [require("shared-ui/tailwind-preset")]
 * That's what makes "bg-primary" or "text-danger" mean the same
 * color in the rider app, driver app, and admin dashboard.
 */
module.exports = {
  theme: {
    extend: {
      colors: tokens.colors,
      fontFamily: tokens.fontFamily,
      borderRadius: tokens.borderRadius,
    },
  },
};
