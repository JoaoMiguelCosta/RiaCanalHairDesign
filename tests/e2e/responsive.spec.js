// Responsividade (Fase 9): overflow horizontal na matriz de viewports, header
// perto do breakpoint de 1024px, grelha de Equipa & Serviços e menu mobile em
// ecrãs com pouca altura (landscape, zoom).
import { test, expect, gotoHome, touchDevice } from "./fixtures.js";

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
        await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
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
