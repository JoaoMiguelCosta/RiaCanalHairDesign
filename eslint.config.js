// eslint.config.js
import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import pluginImport from "eslint-plugin-import";

export default [
  // Ignorar build e artefactos gerados pelos testes (relatórios, resultados)
  { ignores: ["dist", "coverage", "playwright-report", "test-results", "blob-report"] },

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
            ["@shared", "./src/shared"],
            ["@content", "./src/content"],
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

  // Configurações de ferramentas e testes E2E: correm em Node (process, …).
  // Os E2E não contêm React: o `use` das fixtures do Playwright não é o
  // hook `use` do React, pelo que rules-of-hooks não se aplica ali.
  {
    files: ["*.config.js", "tests/**/*.js", "scripts/**/*.js"],
    languageOptions: { globals: { ...globals.node } },
  },
  {
    files: ["tests/e2e/**/*.js"],
    rules: { "react-hooks/rules-of-hooks": "off" },
  },
];
