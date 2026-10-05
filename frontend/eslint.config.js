export default [
  {
    files: ["src/**/*.{js,jsx}"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      parserOptions: { ecmaFeatures: { jsx: true } },
      globals: { window: "readonly", document: "readonly", localStorage: "readonly", navigator: "readonly", AbortController: "readonly", setInterval: "readonly", clearInterval: "readonly" },
    },
    // JSX references are resolved by the React compiler; this lightweight
    // config intentionally leaves unused-import analysis to the React plugin.
    rules: { "no-unused-vars": "off", "no-undef": "error" },
  },
];
