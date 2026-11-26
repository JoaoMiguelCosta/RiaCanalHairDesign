// Responsividade (Fase 9): overflow horizontal na matriz de viewports, header
// perto do breakpoint de 1024px, grelha de Equipa & Serviços e menu mobile em
// ecrãs com pouca altura (landscape, zoom).
import { test, expect, expectPage, gotoHome, touchDevice } from "./fixtures.js";

const MATRIX = [
  [320, 568],
  [360, 740],
  [390, 844],
  [430, 932],
  [844, 390],
  [768, 1024],
  [1023, 768],
  [1024, 768],
  [1025, 768],
  [1100, 800],
  [1280, 720],
  [1440, 900],
  [1920, 1080],
];
const ROUTES = ["/", "/termos", "/privacidade", "/nao-existe"];

/**
 * Elementos visíveis que saem do viewport na horizontal e não estão contidos
 * por um antepassado que os corte dentro do ecrã (ex.: imagens do slider
 * Antes/Depois, intencionalmente maiores do que a sua janela).
 */
const horizontalOffenders = (page) =>
  page.evaluate(() => {
    const vw = document.documentElement.clientWidth;
    const clippedInside = (el) => {
      for (let p = el.parentElement; p && p !== document.body; p = p.parentElement) {
        if (/(hidden|clip|auto|scroll)/.test(getComputedStyle(p).overflowX)) {
          const r = p.getBoundingClientRect();
          if (r.left >= -1 && r.right <= vw + 1) return true;
        }
      }
      return false;
    };
    const out = [];
    for (const el of document.querySelectorAll("body *")) {
      const r = el.getBoundingClientRect();
      if (!r.width || !r.height) continue;
      const cs = getComputedStyle(el);
      if (cs.visibility === "hidden" || cs.position === "fixed") continue;
      if ((r.right > vw + 1 || r.left < -1) && !clippedInside(el)) {
        out.push(`${el.tagName.toLowerCase()}.${String(el.className).split(" ")[0]} [${Math.round(r.left)}, ${Math.round(r.right)}]`);
      }
    }
    return out;
  });

test.describe("Sem conteúdo fora do ecrã na horizontal", () => {
  for (const [width, height] of MATRIX) {
    test(`${width}×${height}: Home, legais e 404`, async ({ page }) => {
      await page.setViewportSize({ width, height });
      for (const route of ROUTES) {
        await page.goto(route);
        await expectPage(page.getByRole("heading", { level: 1 })).toBeVisible();
        await page.evaluate(() => document.fonts.ready);
        expect(await horizontalOffenders(page), `${route} @ ${width}px`).toEqual([]);
        // o documento não tem scroll horizontal
        expect(await page.evaluate(() => document.scrollingElement.scrollWidth)).toBeLessThanOrEqual(width);
      }
    });
  }
});

test.describe("Header desktop perto do breakpoint", () => {
  for (const width of [1025, 1060, 1100, 1150]) {
    test(`${width}px: todos os links do header dentro do ecrã`, async ({ page }) => {
      await page.setViewportSize({ width, height: 800 });
      await gotoHome(page);
      const rights = await page
        .locator("header")
        .locator("a, button")
        .evaluateAll((els) =>
          els
            .filter((e) => e.getBoundingClientRect().width > 0)
            .map((e) => ({ name: e.getAttribute("aria-label") || e.textContent.trim(), right: e.getBoundingClientRect().right }))
        );
      expect(rights.length).toBeGreaterThan(8);
      for (const { name, right } of rights) expect(right, name).toBeLessThanOrEqual(width);
      // a navegação continua numa só linha (altura de um item)
      const navHeights = await page
        .getByRole("navigation", { name: "Navegação principal" })
        .locator(":scope > ul > li")
        .evaluateAll((lis) => new Set(lis.map((li) => Math.round(li.getBoundingClientRect().top))).size);
      expect(navHeights).toBe(1);
    });
  }
});

test.describe("Equipa & Serviços entre 968px e 1200px", () => {
  for (const width of [968, 1024, 1100, 1199]) {
    test(`${width}px: blocos de Estética e Unhas não são cortados`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await gotoHome(page);
      const section = page.locator("#TeamAndServices");
      await section.scrollIntoViewIfNeeded();
      const outside = await section.evaluate((s, vw) =>
        [...s.querySelectorAll("*")]
          .map((el) => el.getBoundingClientRect())
          .filter((r) => r.width && (r.left < -1 || r.right > vw + 1)).length,
      width);
      expect(outside).toBe(0);
      await expect(section.getByRole("button", { name: "VER PORTFÓLIO" })).toHaveCount(3);
      for (const btn of await section.getByRole("button", { name: "VER PORTFÓLIO" }).all()) {
        await btn.scrollIntoViewIfNeeded();
        await expect(btn).toBeInViewport({ ratio: 1 });
      }
    });
  }
});

// 844×390 (landscape), 568×320 (landscape pequeno), 320×256 (≈ 1280×1024 a
// 400%). Antes da Fase 9 o overlay começava em --header-h (acima do fundo
// real do header), centrava a lista sem scroll e cortava o 1.º e o último item.
for (const viewport of [
  { width: 844, height: 390 },
  { width: 568, height: 320 },
  { width: 320, height: 256 },
]) {
  test.describe(`Menu mobile ${viewport.width}×${viewport.height}`, () => {
    test.use(touchDevice(viewport));

    test("o overlay começa no fundo do header e todos os itens são alcançáveis", async ({ page }) => {
      await gotoHome(page);
      await page.getByRole("button", { name: "Menu de navegação" }).tap();
      const nav = page.locator("#mobile-menu");
      await expect(nav).toBeVisible();

      const headerBottom = await page.locator("header").evaluate((h) => h.getBoundingClientRect().bottom);
      const navTop = await nav.evaluate((n) => n.getBoundingClientRect().top);
      expect(Math.abs(navTop - headerBottom)).toBeLessThanOrEqual(1);

      const links = nav.getByRole("link");
      await expect(links).toHaveCount(7);
      for (const link of await links.all()) {
        await link.scrollIntoViewIfNeeded();
        await expect(link).toBeInViewport({ ratio: 0.95 }); // tolerância sub-pixel
        const top = await link.evaluate((a) => a.getBoundingClientRect().top);
        expect(top, "item não fica por baixo do header").toBeGreaterThanOrEqual(headerBottom);
      }

      // o último item funciona (fecha o menu e leva à secção)
      await links.last().tap();
      await expect(page).toHaveURL(/#Location$/);
      await expect(page.getByRole("button", { name: "Menu de navegação" })).toHaveAttribute("aria-expanded", "false");
    });
  });
}

// ---------------------------------------------------------------------------
// Texto ampliado (Fase 10). Dois mecanismos reais do browser:
// - preferência de tamanho de letra (Chrome "Tamanho do tipo de letra",
//   Firefox font.size.variable): o rem e o breakpoint de 64rem escalam;
// - só texto (tamanho mínimo de letra, zoom só de texto): o texto cresce e o
//   breakpoint não — o header passa a compacto (layout mobile) quando o
//   desktop não cabe (useHeaderCompact, header[data-compact]).
// As preferências só se definem no Firefox (firefoxUserPrefs); nos três
// motores usa-se ainda uma emulação CSS do pior caso (html { font-size }
// sem mexer no breakpoint), que NÃO substitui a funcionalidade real do
// browser — documentado em tests/README.md.
// ---------------------------------------------------------------------------

/** Controlos do header apresentados que saem do viewport na horizontal. */
const headerControlsOutside = (page) =>
  page.evaluate(() => {
    const vw = document.documentElement.clientWidth;
    const shown = (e) => {
      for (let n = e; n; n = n.parentElement) {
        const c = getComputedStyle(n);
        if (c.display === "none" || c.visibility === "hidden" || Number(c.opacity) === 0) return false;
      }
      return true;
    };
    return [...document.querySelectorAll("header a[href], header button")]
      .filter((e) => e.getBoundingClientRect().width > 0 && shown(e))
      .filter((e) => {
        const r = e.getBoundingClientRect();
        return r.right > vw + 0.5 || r.left < -0.5;
      })
      .map((e) => (e.getAttribute("aria-label") || e.textContent).trim());
  });

const isCompact = (page) => page.locator("header").evaluate((h) => h.hasAttribute("data-compact"));

/**
 * Espera que o header deixe de mudar de modo/tamanho: `need` frames seguidos
 * (rAF) com o mesmo modo e altura. Contam-se frames, não amostras no tempo:
 * o useHeaderCompact reavalia no rAF seguinte ao ResizeObserver, e no WebKit
 * cada amostra pelo protocolo demorava 300–500 ms, pelo que duas amostras
 * iguais podiam cair ambas antes dessa reavaliação (ainda compacto, já com a
 * altura nova — CI, Fase 11). O estado intermédio dura no máximo 2 frames.
 * Uma oscilação real continua a falhar (limite de frames).
 */
async function headerSettled(page, need = 5, maxFrames = 300) {
  const result = await page.locator("header").evaluate(
    async (h, [need, maxFrames]) => {
      const read = () => `${h.hasAttribute("data-compact")}:${Math.round(h.getBoundingClientRect().height)}`;
      const seen = [];
      for (let run = 0, prev = null; seen.length < maxFrames; ) {
        await new Promise((r) => requestAnimationFrame(r));
        const now = read();
        run = now === prev ? run + 1 : 1;
        prev = now;
        seen.push(now);
        if (run >= need) return { settled: true };
      }
      return { settled: false, last: seen.slice(-20) };
    },
    [need, maxFrames]
  );
  expect(result, "header sem estabilizar").toEqual({ settled: true });
}

test.describe("Header com texto ampliado", () => {
  test("letra por omissão: o header desktop nunca fica compacto", async ({ page }) => {
    for (const width of [1025, 1100, 1280, 1440, 1920]) {
      await page.setViewportSize({ width, height: 800 });
      await gotoHome(page);
      await headerSettled(page);
      expect(await isCompact(page), `${width}px`).toBe(false);
      await expect(page.getByRole("navigation", { name: "Navegação principal" })).toHaveCount(1);
      expect(await headerControlsOutside(page), `${width}px`).toEqual([]);
    }
  });

  // Firefox real com preferências de letra: um browser próprio por cenário
  for (const [label, prefs] of [
    ["preferência de letra 125 %", { "font.size.variable.x-western": 20 }],
    ["preferência de letra 200 %", { "font.size.variable.x-western": 32 }],
    ["letra mínima 20 px (só texto)", { "font.minimum-size.x-western": 20 }],
    ["letra mínima 32 px (só texto)", { "font.minimum-size.x-western": 32 }],
  ]) {
    test(`Firefox, ${label}: todos os controlos do header dentro do ecrã`, async ({ playwright, browserName, baseURL }) => {
      test.skip(browserName !== "firefox", "preferências de letra reais só configuráveis no Firefox (firefoxUserPrefs)");
      test.slow(); // um browser por cenário, várias larguras
      const browser = await playwright.firefox.launch({ firefoxUserPrefs: prefs });
      try {
        for (const width of [1025, 1300, 1440, 1600, 1920, 2100]) {
          const page = await browser.newPage({ viewport: { width, height: 900 } });
          const errors = [];
          page.on("pageerror", (e) => errors.push(e));
          await page.route((url) => new URL(url).origin !== new URL(baseURL).origin, (r) => r.abort());
          await page.goto(`${baseURL}/`);
          await expectPage(page.getByRole("heading", { level: 1 })).toBeVisible();
          await headerSettled(page);
          expect(await headerControlsOutside(page), `${width}px`).toEqual([]);
          expect(await page.evaluate(() => document.scrollingElement.scrollWidth), `${width}px`).toBeLessThanOrEqual(width);
          expect(errors).toEqual([]);
          await page.close();
        }
      } finally {
        await browser.close();
      }
    });
  }

  test("pior caso emulado (texto a 200 % sem mexer no breakpoint): compacto, menu por teclado", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await gotoHome(page);
    await page.addStyleTag({ content: "html { font-size: 200% !important; }" });
    await headerSettled(page);
    expect(await isCompact(page)).toBe(true);
    expect(await headerControlsOutside(page)).toEqual([]);
    // navegação desktop oculta: um único landmark com este nome (o do overlay
    // só existe quando aberto)
    await expect(page.getByRole("navigation", { name: "Navegação principal" })).toHaveCount(0);

    // sem oscilação: nenhuma mudança de modo num intervalo estável
    await page.evaluate(() => {
      window.__layoutChanges = 0;
      window.addEventListener("headerlayoutchange", () => window.__layoutChanges++);
    });
    await page.waitForTimeout(500);
    expect(await page.evaluate(() => window.__layoutChanges)).toBe(0);

    const button = page.getByRole("button", { name: "Menu de navegação" });
    await button.focus();
    await page.keyboard.press("Enter");
    await expect(button).toHaveAttribute("aria-expanded", "true");
    const menu = page.locator("#mobile-menu");
    await expect(menu).toBeVisible();
    await expect(menu.getByRole("link").first()).toBeFocused();
    await page.keyboard.press("Escape");
    await expect(button).toHaveAttribute("aria-expanded", "false");
    await expect(button).toBeFocused();
  });

  test("sair do modo compacto fecha o menu aberto e devolve o foco ao conteúdo", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await gotoHome(page);
    const zoom = await page.addStyleTag({ content: "html { font-size: 200% !important; }" });
    await headerSettled(page);
    const button = page.getByRole("button", { name: "Menu de navegação" });
    await button.click();
    await expect(page.locator("#mobile-menu")).toBeVisible();

    await zoom.evaluate((el) => el.remove()); // texto volta ao normal
    await headerSettled(page);
    expect(await isCompact(page)).toBe(false);
    await expect(page.locator("#mobile-menu")).toBeHidden();
    await expect(page.locator("main#main")).toBeFocused();
    expect(await page.evaluate(() => document.documentElement.style.overflow)).toBe("");
  });
});
