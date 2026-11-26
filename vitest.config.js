// vitest.config.js
// Testes unitários e de componentes (jsdom). Reutiliza plugins e aliases do
// vite.config.js; os testes end-to-end (browser real) vivem em tests/e2e e
// correm com Playwright (playwright.config.js).
import { defineConfig, mergeConfig } from "vitest/config";
import viteConfig from "./vite.config.js";

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      environment: "jsdom",
      // scripts/: plugins de build (ex.: HTML por rota, Fase 8)
      include: ["src/**/*.test.{js,jsx}", "scripts/**/*.test.js"],
      setupFiles: ["./tests/setup/vitest.setup.js"],
      // Cada teste começa com mocks/spies/globais repostos
      restoreMocks: true,
      unstubGlobals: true,
      coverage: {
        provider: "v8",
        include: ["src/**/*.{js,jsx}"],
        exclude: ["src/**/*.test.{js,jsx}", "src/content/**", "src/app/main.jsx"],
        reporter: ["text-summary", "text", "html"],
        reportsDirectory: "coverage",
      },
    },
  })
);
