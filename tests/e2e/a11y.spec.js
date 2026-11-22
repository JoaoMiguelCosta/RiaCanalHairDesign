// Auditoria automatizada (axe-core) das rotas e de estados interativos.
// Deteta violações comuns de WCAG 2.x A/AA; não substitui uma avaliação
// manual (leitor de ecrã, teclado, contraste em contexto, conteúdo).
import AxeBuilder from "@axe-core/playwright";
import { test, expect, gotoHome, scrollToSection, touchDevice, VIEWPORTS } from "./fixtures.js";

const TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];

/** Resumo legível: regra, impacto e seletores dos elementos afetados. */
const summarize = (violations) =>
  violations.map((v) => ({
    rule: v.id,
    impact: v.impact,
    help: v.help,
    targets: v.nodes.slice(0, 5).map((n) => n.target.join(" ")),
  }));

async function expectNoViolations(page, { include } = {}) {
  let builder = new AxeBuilder({ page }).withTags(TAGS);
  if (include) builder = builder.include(include);
  const { violations } = await builder.analyze();
  expect(summarize(violations)).toEqual([]);
}

/** Percorre a Home para que o conteúdo lazy (imagens) esteja carregado. */
async function loadWholeHome(page) {
  await page.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += 700) {
      window.scrollTo(0, y);
      document.body.scrollTo?.(0, y);
      await new Promise((r) => requestAnimationFrame(() => r()));
    }
    window.scrollTo(0, 0);
    document.body.scrollTo?.(0, 0);
  });
}

test.describe("Rotas (desktop)", () => {
  test.use({ viewport: VIEWPORTS.desktop });

  test("Home", async ({ page }) => {
    await gotoHome(page);
    await loadWholeHome(page);
    await expectNoViolations(page);
  });

  for (const path of ["/termos", "/privacidade", "/pagina-inexistente"]) {
    test(path, async ({ page }) => {
      await page.goto(path);
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
      await expectNoViolations(page);
    });
  }
});

test.describe("Rotas (mobile)", () => {
  test.use(touchDevice(VIEWPORTS.mobile));

  test("Home", async ({ page }) => {
    await gotoHome(page);
    await loadWholeHome(page);
    await expectNoViolations(page);
  });

  test("Termos", async ({ page }) => {
    await page.goto("/termos");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expectNoViolations(page);
  });
});

test.describe("Estados interativos", () => {
  test("menu mobile aberto", async ({ browser }) => {
    const context = await browser.newContext(touchDevice(VIEWPORTS.mobile));
    const page = await context.newPage();
    await context.route((url) => url.hostname !== "127.0.0.1", (route) => route.abort());
    await gotoHome(page);
    await page.getByRole("button", { name: "Menu de navegação" }).tap();
    await expect(page.locator("#mobile-menu")).toBeVisible();
    await expectNoViolations(page);
    await context.close();
  });

  test("submenu desktop aberto", async ({ page }) => {
    await page.setViewportSize(VIEWPORTS.desktop);
    await gotoHome(page);
    const btn = page.getByRole("button", { name: "SOBRE NÓS" });
    await btn.focus();
    await page.keyboard.press("Enter");
    await expect(page.getByRole("list", { name: "Submenu de SOBRE NÓS" })).toBeVisible();
    await expectNoViolations(page, { include: "header" });
  });

  test("slider focado e animações pausadas", async ({ page }) => {
    await page.setViewportSize(VIEWPORTS.desktop);
    await gotoHome(page);
    await scrollToSection(page, "Transformations");
    await page.getByRole("button", { name: "Pausar animação das transformações" }).click();
    await page.locator("#Transformations").getByRole("slider").first().focus();
    await expectNoViolations(page, { include: "#Transformations" });

    await scrollToSection(page, "Testimonials");
    await page.getByRole("button", { name: "Pausar rotação dos testemunhos" }).click();
    await expectNoViolations(page, { include: "#Testimonials" });
  });

  test("som do vídeo ativado", async ({ page }) => {
    await page.setViewportSize(VIEWPORTS.desktop);
    await gotoHome(page);
    await scrollToSection(page, "Space");
    const sound = page.getByRole("button", { name: "Som do vídeo" });
    await sound.scrollIntoViewIfNeeded();
    await sound.click();
    await expect(sound).toHaveAttribute("aria-pressed", "true");
    await expectNoViolations(page, { include: "#Space" });
  });

  test("cartão do portefólio aberto por toque", async ({ browser }) => {
    const context = await browser.newContext(touchDevice(VIEWPORTS.mobile));
    const page = await context.newPage();
    await context.route((url) => url.hostname !== "127.0.0.1", (route) => route.abort());
    await gotoHome(page);
    await scrollToSection(page, "Works");
    const toggle = page.locator("#Works").getByRole("button", { name: "Coloração Vibrante" });
    await toggle.scrollIntoViewIfNeeded();
    await toggle.tap();
    await expect(toggle).toHaveAttribute("aria-pressed", "true");
    await expectNoViolations(page, { include: "#Works" });
    await context.close();
  });
});
