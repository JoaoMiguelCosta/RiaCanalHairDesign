// playwright.config.js
// Testes end-to-end num browser real contra o build de produção local.
// O servidor (vite preview) é criado e encerrado pela própria suite, numa
// porta fixa e sem reutilizar processos antigos.
import { defineConfig, devices } from "@playwright/test";

const PORT = 4318;
const BASE_URL = `http://127.0.0.1:${PORT}`;

export default defineConfig({
  testDir: "tests/e2e",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: 0, // falhas intermitentes devem ser investigadas, não repetidas
  reporter: [["list"], ["html", { open: "never", outputFolder: "playwright-report" }]],
  outputDir: "test-results",
  use: {
    baseURL: BASE_URL,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "off",
  },
  expect: {
    toHaveScreenshot: { animations: "disabled", caret: "hide", maxDiffPixelRatio: 0.01 },
  },
  // Só Chromium: Firefox/WebKit não estão instalados neste ambiente (ver
  // tests/README.md). Os viewports tablet/mobile são definidos por teste.
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 } },
    },
  ],
  webServer: {
    command: `npm run build && npx vite preview --host 127.0.0.1 --port ${PORT} --strictPort`,
    url: BASE_URL,
    reuseExistingServer: false,
    timeout: 180_000,
    stdout: "ignore",
    stderr: "pipe",
  },
});
