// eslint.config.js
import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import pluginImport from "eslint-plugin-import";

export default [
  // Ignorar build
  { ignores: ["dist"] },

  // Base recomendada do ESLint (flat config: sem "extends")
  js.configs.recommended,

  // Regras do projeto
  {
    files: ["**/*.{js,jsx}"],
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
      import: pluginImport,
    },
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: { ...globals.browser },
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    settings: {
      "import/resolver": {
        alias: {
          map: [
            ["@app", "./src/app"],
            ["@pages", "./src/pages"],
            ["@widgets", "./src/widgets"],
            ["@features", "./src/features"],
            ["@entities", "./src/entities"],
            ["@shared", "./src/shared"],
            ["@lib", "./src/lib"],
            ["@content", "./src/content"],
            ["@services", "./src/services"],
            ["@media", "./src/content/media"],
          ],
          extensions: [".js", ".jsx", ".json", ".css"],
        },
      },
    },
    rules: {
      // React
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
      "react-refresh/only-export-components": "off",

      // Imports
      "import/no-unresolved": "error",

      // Qualidade
      "no-unused-vars": ["error", { varsIgnorePattern: "^[A-Z_]" }],
    },
  },
];
