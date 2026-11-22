// Menus (desktop e mobile) e navegação por âncoras num browser real.
import { test, expect, gotoHome, touchDevice, VIEWPORTS } from "./fixtures.js";

const activeName = (page) =>
  page.evaluate(() => {
    const el = document.activeElement;
    return (el.getAttribute("aria-label") || el.textContent || "").trim();
  });

const focusInside = (page, selector) =>
  page.evaluate((sel) => Boolean(document.activeElement?.closest(sel)), selector);

/** Prime Tab até o elemento com o nome indicado ficar focado. */
async function tabTo(page, name, max = 30) {
  for (let i = 0; i < max; i++) {
    await page.keyboard.press("Tab");
    if ((await activeName(page)) === name) return;
  }
  throw new Error(`"${name}" não foi alcançado com Tab`);
}

test.describe("Menu desktop", () => {
  test.use({ viewport: VIEWPORTS.desktop });

  test("todos os itens de topo são alcançáveis por Tab, sem passar por submenus fechados", async ({ page }) => {
    await gotoHome(page);
    const nav = page.getByRole("navigation", { name: "Navegação principal" });
    const labels = await nav.locator(":scope > ul > li > :is(a, button)").allTextContents();
    expect(labels.map((l) => l.trim())).toEqual([
      "INÍCIO",
      "SOBRE NÓS",
      "PORTFÓLIO",
      "ESPAÇO",
      "INSTAGRAM",
      "CLIENTES",
      "CONTACTOS",
    ]);

    await tabTo(page, "INÍCIO");
    for (const label of labels.slice(1)) {
      await page.keyboard.press("Tab");
      expect(await activeName(page)).toBe(label.trim());
    }
  });

  test("Enter/Espaço abrem o submenu; Escape fecha e devolve o foco", async ({ page }) => {
    await gotoHome(page);
    const btn = page.getByRole("button", { name: "PORTFÓLIO", exact: true });
    const submenu = page.getByRole("list", { name: "Submenu de PORTFÓLIO" });

    await tabTo(page, "PORTFÓLIO");
    await page.keyboard.press("Enter");
    await expect(btn).toHaveAttribute("aria-expanded", "true");
    await expect(submenu).toBeVisible();

    await page.keyboard.press("Tab");
    expect(await activeName(page)).toBe("TRABALHOS");
    await page.keyboard.press("Escape");
    await expect(btn).toHaveAttribute("aria-expanded", "false");
    await expect(btn).toBeFocused();
    await expect(submenu).toBeHidden();

    await page.keyboard.press("Space");
    await expect(btn).toHaveAttribute("aria-expanded", "true");
    await page.keyboard.press("Space");
    await expect(btn).toHaveAttribute("aria-expanded", "false");
  });

  test("sair do submenu com Tab fecha-o", async ({ page }) => {
    await gotoHome(page);
    const btn = page.getByRole("button", { name: "SOBRE NÓS" });
    await tabTo(page, "SOBRE NÓS");
    await page.keyboard.press("Enter");
    await page.keyboard.press("Tab"); // QUEM SOMOS
    await page.keyboard.press("Tab"); // EQUIPA & SERVIÇOS
    expect(await activeName(page)).toBe("EQUIPA & SERVIÇOS");
    await page.keyboard.press("Tab"); // sai para PORTFÓLIO
    expect(await activeName(page)).toBe("PORTFÓLIO");
    await expect(btn).toHaveAttribute("aria-expanded", "false");
  });

  test("hover abre o submenu (CSS) e os links navegam por âncora", async ({ page }) => {
    await gotoHome(page);
    await page.getByRole("button", { name: "PORTFÓLIO", exact: true }).hover();
    const link = page.getByRole("link", { name: "TRANSFORMAÇÕES" });
    await expect(link).toBeVisible();
    await link.click();
    await expect(page).toHaveURL(/#Transformations$/);
    await expect(page.locator("#Transformations")).toBeInViewport();
  });

  test("links diretos levam à secção, abaixo do header sticky", async ({ page }) => {
    await gotoHome(page);
    await page.getByRole("link", { name: "ESPAÇO", exact: true }).click();
    await expect(page).toHaveURL(/#Space$/);
    const section = page.locator("#Space");
    await expect(section).toBeInViewport();
    const headerBottom = await page.locator("header").evaluate((h) => h.getBoundingClientRect().bottom);
    await expect
      .poll(() => section.evaluate((s) => Math.round(s.getBoundingClientRect().top)))
      .toBeGreaterThanOrEqual(Math.floor(headerBottom) - 2);
  });
});

test.describe("Menu mobile (tátil)", () => {
  test.use(touchDevice(VIEWPORTS.mobile));

  test("abre com aria-expanded, foco no 1.º link e bloqueia o scroll", async ({ page }) => {
    await gotoHome(page);
    const btn = page.getByRole("button", { name: "Menu de navegação" });
    await expect(btn).toHaveAttribute("aria-expanded", "false");
    await btn.tap();
    await expect(btn).toHaveAttribute("aria-expanded", "true");
    // o overlay mobile (#mobile-menu); o <nav> desktop tem o mesmo nome
    const nav = page.locator("#mobile-menu");
    await expect(nav).toBeVisible();
    await expect(nav).toHaveAccessibleName("Navegação principal");
    await expect(nav.getByRole("link").first()).toBeFocused();
    expect(await page.evaluate(() => document.body.style.overflow)).toBe("hidden");
  });

  test("Escape fecha e devolve o foco ao botão; o scroll fica desbloqueado", async ({ page }) => {
    await gotoHome(page);
    const btn = page.getByRole("button", { name: "Menu de navegação" });
    await btn.tap();
    await page.keyboard.press("Escape");
    await expect(btn).toHaveAttribute("aria-expanded", "false");
    await expect(btn).toBeFocused();
    expect(await page.evaluate(() => document.body.style.overflow)).toBe("");
    expect(await page.locator("main").evaluate((m) => m.inert)).toBe(false);
  });

  test("um link leva à secção e fecha o menu", async ({ page }) => {
    await gotoHome(page);
    await page.getByRole("button", { name: "Menu de navegação" }).tap();
    await page.locator("#mobile-menu").getByRole("link", { name: "CLIENTES" }).tap();
    await expect(page).toHaveURL(/#Testimonials$/);
    await expect(page.getByRole("button", { name: "Menu de navegação" })).toHaveAttribute("aria-expanded", "false");
    await expect(page.locator("#Testimonials")).toBeInViewport();
  });

  test("com o menu aberto, o conteúdo coberto não recebe foco", async ({ page }) => {
    await gotoHome(page);
    await page.getByRole("button", { name: "Menu de navegação" }).tap();
    for (let i = 0; i < 15; i++) {
      await page.keyboard.press("Tab");
      expect(await focusInside(page, "main, footer")).toBe(false);
    }
    expect(await page.locator("main").evaluate((m) => m.inert)).toBe(true);
  });

  test("passar a desktop fecha o menu e liberta o scroll", async ({ page }) => {
    await gotoHome(page);
    await page.getByRole("button", { name: "Menu de navegação" }).tap();
    await page.setViewportSize(VIEWPORTS.desktop);
    await expect.poll(() => page.evaluate(() => document.body.style.overflow)).toBe("");
    expect(await page.locator("main").evaluate((m) => m.inert)).toBe(false);
    await expect(page.locator("#mobile-menu")).toBeHidden();
    await expect.poll(() => page.evaluate(() => document.activeElement?.id)).toBe("main");
  });
});

test.describe("Menu em tablet e mobile pequeno", () => {
  for (const [name, viewport] of [
    ["tablet", VIEWPORTS.tablet],
    ["mobile pequeno", VIEWPORTS.smallMobile],
  ]) {
    test(`${name}: botão de menu visível e funcional`, async ({ page }) => {
      await page.setViewportSize(viewport);
      await gotoHome(page);
      const btn = page.getByRole("button", { name: "Menu de navegação" });
      await expect(btn).toBeVisible();
      await btn.click();
      await expect(page.locator("#mobile-menu").getByRole("link")).toHaveCount(7);
      await page.keyboard.press("Escape");
      await expect(btn).toHaveAttribute("aria-expanded", "false");
    });
  }
});

// Landmarks "Navegação principal": só a navegação visualmente disponível
// pode estar na árvore de acessibilidade (getByRole ignora o que está oculto).
test.describe("Landmarks de navegação", () => {
  const mainNavs = (page) => page.getByRole("navigation", { name: "Navegação principal" });

  test("desktop: um único landmark, o menu desktop", async ({ page }) => {
    await page.setViewportSize(VIEWPORTS.desktop);
    await gotoHome(page);
    await expect(mainNavs(page)).toHaveCount(1);
    await expect(mainNavs(page)).not.toHaveId("mobile-menu");
    await expect(mainNavs(page).getByRole("button", { name: "SOBRE NÓS" })).toBeVisible();
  });

  for (const [name, viewport] of [
    ["mobile", VIEWPORTS.mobile],
    ["tablet", VIEWPORTS.tablet],
  ]) {
    test(`${name}: nenhum landmark com o menu fechado; só o mobile com o menu aberto`, async ({ page }) => {
      await page.setViewportSize(viewport);
      await gotoHome(page);
      await expect(mainNavs(page)).toHaveCount(0);

      await page.getByRole("button", { name: "Menu de navegação" }).click();
      await expect(mainNavs(page)).toHaveCount(1);
      await expect(mainNavs(page)).toHaveId("mobile-menu");

      await page.keyboard.press("Escape");
      await expect(mainNavs(page)).toHaveCount(0);
    });
  }

  test("redimensionar desktop → mobile → desktop mantém um landmark coerente", async ({ page }) => {
    await page.setViewportSize(VIEWPORTS.desktop);
    await gotoHome(page);
    await expect(mainNavs(page)).toHaveCount(1);
    await page.setViewportSize(VIEWPORTS.mobile);
    await expect(mainNavs(page)).toHaveCount(0);
    await page.setViewportSize(VIEWPORTS.desktop);
    await expect(mainNavs(page)).toHaveCount(1);
    await expect(mainNavs(page)).not.toHaveId("mobile-menu");
  });
});
