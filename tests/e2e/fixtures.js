// tests/e2e/fixtures.js
// Base comum dos testes E2E:
// - sem rede externa: pedidos fora do servidor local (Google Fonts, Google
//   Maps, …) são abortados, para resultados determinísticos e offline;
// - erros JavaScript não tratados na página fazem falhar o teste;
// - `sameOriginRequests`: registo dos pedidos ao servidor local.
import { test as base, expect } from "@playwright/test";

export const VIEWPORTS = {
  desktop: { width: 1440, height: 900 },
  tablet: { width: 820, height: 1180 },
  mobile: { width: 390, height: 844 },
  smallMobile: { width: 360, height: 640 },
};

/** Opções de contexto para um telemóvel tátil (Chromium). */
export const touchDevice = (viewport = VIEWPORTS.mobile) => ({
  viewport,
  hasTouch: true,
  isMobile: true,
  deviceScaleFactor: 2,
});

export const test = base.extend({
  context: async ({ context, baseURL }, use) => {
    const origin = new URL(baseURL).origin;
    await context.route(
      (url) => url.origin !== origin && url.protocol.startsWith("http"),
      (route) => route.abort("blockedbyclient")
    );
    await use(context);
  },

  sameOriginRequests: async ({ page, baseURL }, use) => {
    const origin = new URL(baseURL).origin;
    const urls = [];
    page.on("request", (req) => {
      if (req.url().startsWith(origin)) urls.push(req.url());
    });
    await use(urls);
  },

  page: async ({ page }, use) => {
    const errors = [];
    page.on("pageerror", (err) => errors.push(err));
    await use(page);
    expect(errors, "erros JavaScript não tratados na página").toEqual([]);
  },
});

export { expect };

/** Abre a Home e espera pela página lazy montada. */
export async function gotoHome(page, path = "/") {
  await page.goto(path);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
}

/**
 * Para o relógio da página (page.clock já instalado). O alvo é calculado a
 * partir do relógio da própria página, não do Node: sob carga, a página pode
 * já estar à frente da hora do processo de teste ("fast-forward to the past").
 */
export async function pauseClock(page, aheadMs = 1000) {
  const pageNow = await page.evaluate(() => Date.now());
  await page.clock.pauseAt(pageNow + aheadMs);
}

/** Faz scroll até à secção e devolve o seu locator. */
export async function scrollToSection(page, id) {
  const section = page.locator(`#${id}`);
  await section.scrollIntoViewIfNeeded();
  return section;
}

/** Simula a mudança de visibilidade do separador (document.visibilityState). */
export async function setPageVisibility(page, state) {
  await page.evaluate((s) => {
    Object.defineProperty(document, "visibilityState", { configurable: true, get: () => s });
    Object.defineProperty(document, "hidden", { configurable: true, get: () => s === "hidden" });
    document.dispatchEvent(new Event("visibilitychange"));
  }, state);
}
