module.exports = {
  presets: [require("shared-ui/tailwind-preset")],
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
    "../shared-ui/src/**/*.{js,jsx}",
  ],
};
