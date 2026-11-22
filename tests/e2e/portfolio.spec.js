// Portefólio num browser real: filtros, revelação da descrição por
// hover/foco (CSS) e por toque, e o atalho "VER PORTFÓLIO".
import { test, expect, gotoHome, scrollToSection, touchDevice, VIEWPORTS } from "./fixtures.js";

const works = (page) => page.locator("#Works");
const filter = (page, name) => works(page).getByRole("button", { name, exact: true });
const firstTitle = (page) => works(page).getByRole("heading", { level: 3 }).first();
const overlayOpacity = (card) =>
  card.evaluate((el) => Number(getComputedStyle(el.querySelector("[class*='imageOverlay']")).opacity));

test.describe("Portefólio — desktop", () => {
  test.use({ viewport: VIEWPORTS.desktop });

  test("filtros mudam o conteúdo e o estado aria-pressed", async ({ page }) => {
    await gotoHome(page);
    await scrollToSection(page, "Works");
    await expect(filter(page, "Cabeleireiro")).toHaveAttribute("aria-pressed", "true");
    await expect(firstTitle(page)).toHaveText("Coloração Vibrante");

    await filter(page, "Estética").click();
    await expect(filter(page, "Estética")).toHaveAttribute("aria-pressed", "true");
    await expect(filter(page, "Cabeleireiro")).toHaveAttribute("aria-pressed", "false");
    await expect(firstTitle(page)).toHaveText("Design de Sobrancelha");

    await filter(page, "Unhas").focus();
    await page.keyboard.press("Enter");
    await expect(filter(page, "Unhas")).toHaveAttribute("aria-pressed", "true");
    await expect(firstTitle(page)).toHaveText("Unhas de Gel Francesa");
  });

  test("a descrição aparece com foco de teclado e com hover", async ({ page }) => {
    await gotoHome(page);
    await scrollToSection(page, "Works");
    const card = works(page).getByRole("group", { name: "Coloração Vibrante" });
    expect(await overlayOpacity(card)).toBe(0);

    await filter(page, "Unhas").focus();
    await filter(page, "Cabeleireiro").focus();
    await page.keyboard.press("Tab"); // Estética
    await page.keyboard.press("Tab"); // Unhas
    await page.keyboard.press("Tab"); // 1.º cartão
    await expect(card).toBeFocused();
    await expect.poll(() => overlayOpacity(card)).toBe(1);
    await expect(card.locator("p")).toBeVisible();

    await card.blur();
    await expect.poll(() => overlayOpacity(card)).toBe(0);
    await card.hover();
    await expect.poll(() => overlayOpacity(card)).toBe(1);
  });

  test("VER PORTFÓLIO leva ao portefólio com o filtro do profissional", async ({ page }) => {
    await gotoHome(page);
    const buttons = page.getByRole("button", { name: "VER PORTFÓLIO" });
    await buttons.nth(1).scrollIntoViewIfNeeded();
    await buttons.nth(1).click(); // Sabrina → Estética
    await expect(page).toHaveURL(/#Works$/);
    await expect(filter(page, "Estética")).toHaveAttribute("aria-pressed", "true");
    await expect(works(page)).toBeInViewport();

    await buttons.nth(2).scrollIntoViewIfNeeded();
    await buttons.nth(2).click(); // Mary → Unhas
    await expect(filter(page, "Unhas")).toHaveAttribute("aria-pressed", "true");
    await expect(works(page)).toBeInViewport();
  });

  test("?service= válido seleciona o filtro inicial", async ({ page }) => {
    await gotoHome(page, "/?service=Unhas");
    await expect(filter(page, "Unhas")).toHaveAttribute("aria-pressed", "true");
  });
});

test.describe("Portefólio — ecrã tátil", () => {
  test.use(touchDevice(VIEWPORTS.mobile));

  test("tocar abre/fecha o cartão; tocar fora fecha", async ({ page }) => {
    await gotoHome(page);
    await scrollToSection(page, "Works");
    const toggle = works(page).getByRole("button", { name: "Coloração Vibrante" });
    const card = toggle.locator("..");
    await toggle.scrollIntoViewIfNeeded();
    await expect(toggle).toHaveAttribute("aria-pressed", "false");
    expect(await overlayOpacity(card)).toBe(0);

    await toggle.tap();
    await expect(toggle).toHaveAttribute("aria-pressed", "true");
    await expect.poll(() => overlayOpacity(card)).toBe(1);

    await page.locator("#Works h2").tap(); // fora da grelha
    await expect(toggle).toHaveAttribute("aria-pressed", "false");
  });

  test("mudar de filtro fecha o cartão aberto", async ({ page }) => {
    await gotoHome(page);
    await scrollToSection(page, "Works");
    const toggle = works(page).getByRole("button", { name: "Coloração Vibrante" });
    await toggle.scrollIntoViewIfNeeded();
    await toggle.tap();
    await filter(page, "Estética").tap();
    await filter(page, "Cabeleireiro").tap();
    await expect(works(page).getByRole("button", { name: "Coloração Vibrante" })).toHaveAttribute(
      "aria-pressed",
      "false"
    );
  });
});
