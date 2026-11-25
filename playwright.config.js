// playwright.config.js
// Testes end-to-end num browser real contra o build de produção local.
// O servidor (vite preview) é criado e encerrado pela própria suite, numa
// porta fixa e sem reutilizar processos antigos.
import { defineConfig, devices } from "@playwright/test";

const PORT = 4318;
const BASE_URL = `http://127.0.0.1:${PORT}`;
const DESKTOP = { width: 1440, height: 900 };
const VISUAL_SPEC = "**/visual.spec.js";
const BUILD_OUTPUT_SPEC = "**/buildOutput.spec.js";

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
  // Projetos (os viewports tablet/mobile e o toque são definidos por teste):
  // - chromium: suite funcional completa;
  // - chromium-visual: só visual.spec.js. Projeto próprio porque as baselines
  //   dependem do SO (sufixo -win32) e a CI corre-o num runner Windows; o
  //   caminho mantém o nome "-chromium-" das baselines aprovadas;
  // - firefox / webkit: a mesma suite funcional, exceto o que não depende do
  //   browser (buildOutput.spec.js lê o dist/) e os gestos de toque via CDP
  //   (test.skip com motivo explícito, ver fixtures.js).
  // Scripts: test:e2e (chromium + chromium-visual), test:e2e:cross (firefox +
  // webkit), test:e2e:all (todos).
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"], viewport: DESKTOP },
      testIgnore: [VISUAL_SPEC],
    },
    {
      name: "chromium-visual",
      use: { ...devices["Desktop Chrome"], viewport: DESKTOP },
      testMatch: [VISUAL_SPEC],
      snapshotPathTemplate: "{testDir}/{testFilePath}-snapshots/{arg}-chromium-{platform}{ext}",
    },
    {
      name: "firefox",
      use: { ...devices["Desktop Firefox"], viewport: DESKTOP },
      testIgnore: [VISUAL_SPEC, BUILD_OUTPUT_SPEC],
    },
    {
      name: "webkit",
      use: { ...devices["Desktop Safari"], viewport: DESKTOP },
      testIgnore: [VISUAL_SPEC, BUILD_OUTPUT_SPEC],
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
