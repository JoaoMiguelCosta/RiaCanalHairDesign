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

// `isMobile` (meta viewport, layout de telemóvel) não existe no Firefox do
// Playwright, que recusa o contexto se a opção vier ativa; o toque
// (`hasTouch`) existe nos três motores.
const supportsIsMobile = (browserName) => browserName !== "firefox";

/** Telemóvel tátil para `test.use()`, em qualquer motor. */
export const touchDevice = (viewport = VIEWPORTS.mobile) => ({
  viewport,
  hasTouch: true,
  deviceScaleFactor: 2,
  isMobile: async ({ browserName }, use) => use(supportsIsMobile(browserName)),
});

/** O mesmo, para `browser.newContext()` (que só aceita valores). */
export const touchContextOptions = (browserName, viewport = VIEWPORTS.mobile) => ({
  viewport,
  hasTouch: true,
  deviceScaleFactor: 2,
  isMobile: supportsIsMobile(browserName),
});

/** Gestos de toque via CDP (Input.dispatchTouchEvent): só no Chromium. */
export const CDP_ONLY_REASON = "gesto de toque via CDP: API exclusiva do Chromium";

/**
 * WebKit (como o Safari por omissão) não move o foco para links com Tab, só
 * para controlos de formulário; no WebKit do Playwright nem Alt+Tab o faz.
 * Os testes de ordem de Tab entre links correm em Chromium e Firefox.
 */
export const TAB_SKIPS_LINKS = (browserName) => browserName === "webkit";
export const TAB_SKIPS_LINKS_REASON = "WebKit/Safari: Tab não foca links por omissão";

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

/**
 * Limite para a página lazy montar depois do `load`. O <h1> só existe quando
 * o chunk da Home chega, e esse pedido vai para o único `vite preview` que
 * serve todos os workers: com a suite em paralelo e vídeos a descarregar, o
 * chunk (79 KB) chegou a demorar 5,3 s (trace, Fase 10). Mais curto do que o
 * timeout do teste (30 s), para que um bloqueio real continue a falhar aqui.
 */
export const PAGE_READY_TIMEOUT = 15_000;

/**
 * `expect` para asserções que esperam por uma página lazy montada (o <h1>
 * de cada rota), no carregamento ou na 1.ª navegação SPA para essa rota.
 * Só estas usam PAGE_READY_TIMEOUT; as restantes mantêm os 5 s por defeito.
 */
export const expectPage = expect.configure({ timeout: PAGE_READY_TIMEOUT });

/** Abre a Home e espera pela página lazy montada. */
export async function gotoHome(page, path = "/") {
  await page.goto(path);
  await expectPage(page.getByRole("heading", { level: 1 })).toBeVisible();
}

/**
 * Para o relógio da página (page.clock já instalado) ~aheadMs à frente da
 * hora da própria página (não da do Node: sob carga, a página pode estar à
 * frente do processo de teste). O relógio continua a andar entre a leitura e
 * o pauseAt; se essa latência passar de aheadMs (visto no WebKit sob carga,
 * Fase 10), o pauseAt recusa um alvo no passado sem alterar o relógio — e é
 * seguro repetir com a hora atualizada. Outros erros não são absorvidos.
 */
export async function pauseClock(page, aheadMs = 1000, attempts = 5) {
  for (let i = 1; ; i++) {
    const pageNow = await page.evaluate(() => Date.now());
    try {
      await page.clock.pauseAt(pageNow + aheadMs);
      return;
    } catch (err) {
      if (i >= attempts || !/fast-forward to the past/.test(String(err))) throw err;
    }
  }
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
