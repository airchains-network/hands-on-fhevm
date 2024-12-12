import globals from "globals";
import prettier from "eslint-config-prettier";
import pluginPrettier from "eslint-plugin-prettier";
import pluginJs from "@eslint/js";

export default [
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node, // Add Node.js globals
      },
    },
  },
  // Specify the JavaScript environment and language options
  {
    languageOptions: {
      ecmaVersion: "latest", // Use the latest ECMAScript standard
      sourceType: "module", // Allow ECMAScript modules
    },
  },

  // Base ESLint recommended rules
  pluginJs.configs.recommended,

  // Prettier integration
  prettier,
  {
    plugins: {
      prettier: pluginPrettier, // Load Prettier plugin
    },
    rules: {
      "no-unused-vars": ["warn"], // Warn instead of off
      "prettier/prettier": "warn", // Show Prettier formatting issues as warnings
    },
  },
];
