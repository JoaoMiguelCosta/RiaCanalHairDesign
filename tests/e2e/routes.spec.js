// Rotas, histórico, foco e skip link num browser real (build de produção).
import { test, expect, expectPage, gotoHome, TAB_SKIPS_LINKS } from "./fixtures.js";

const TITLE = "Ria Canal Hair Design";
const main = (page) => page.locator("main#main");
const isMainFocused = (page) => page.evaluate(() => document.activeElement?.id === "main");

test.describe("Carregamento direto", () => {
  for (const [path, h1, title] of [
    ["/", /Ria Canal/, TITLE],
    ["/termos", "Termos & Condições", `Termos & Condições | ${TITLE}`],
    ["/privacidade", "Política de Privacidade", `Política de Privacidade | ${TITLE}`],
    ["/rota-inexistente", /Página não encontrada/, `Página não encontrada | ${TITLE}`],
  ]) {
    test(`${path} → título e h1`, async ({ page }) => {
      await page.goto(path);
      await expectPage(page.getByRole("heading", { level: 1 })).toHaveText(h1);
      await expect(page).toHaveTitle(title);
      await expect(page.locator("main")).toHaveCount(1);
    });
  }

  test("o carregamento inicial não move o foco", async ({ page }) => {
    await page.goto("/termos");
    await expectPage(page.getByRole("heading", { level: 1 })).toBeVisible();
    expect(await page.evaluate(() => document.activeElement === document.body)).toBe(true);
  });
});

test.describe("Navegação SPA e histórico", () => {
  test("Home → Termos → Privacidade, com Back/Forward", async ({ page }) => {
    await gotoHome(page);
    await page.getByRole("link", { name: "Termos & Condições" }).click();
    await expect(page).toHaveURL(/\/termos$/);
    await expect(page).toHaveTitle(`Termos & Condições | ${TITLE}`);
    await expect.poll(() => isMainFocused(page)).toBe(true);

    await page.getByRole("link", { name: "Voltar à página inicial" }).click();
    await expect(page).toHaveURL(/\/$/);
    // link legal do footer (o placeholder do mapa tem outro, mais descritivo)
    await page.locator("footer").getByRole("link", { name: "Política de Privacidade" }).click();
    await expect(page).toHaveTitle(`Política de Privacidade | ${TITLE}`);

    await page.goBack();
    await expect(page).toHaveURL(/\/$/);
    await expect(page).toHaveTitle(TITLE);
    await expect.poll(() => isMainFocused(page)).toBe(true);

    await page.goBack();
    await expect(page).toHaveURL(/\/termos$/);
    await expectPage(page.getByRole("heading", { level: 1 })).toHaveText("Termos & Condições");

    await page.goForward();
    await expect(page).toHaveURL(/\/$/);
  });

  test("navegação interna repõe o scroll no topo", async ({ page }) => {
    await gotoHome(page);
    const link = page.getByRole("link", { name: "Termos & Condições" });
    await link.scrollIntoViewIfNeeded();
    await link.click();
    await expectPage(page.getByRole("heading", { level: 1 })).toHaveText("Termos & Condições");
    await expect
      .poll(() => page.evaluate(() => Math.max(document.scrollingElement.scrollTop, document.body.scrollTop)))
      .toBe(0);
  });

  test("404 → Home pelo link de regresso", async ({ page }) => {
    await page.goto("/nao-existe/abc");
    await page.getByRole("link", { name: "Voltar à página inicial" }).click();
    await expectPage(page.getByRole("heading", { level: 1 })).toHaveText(/Ria Canal/);
    await expect.poll(() => isMainFocused(page)).toBe(true);
  });
});

test.describe("Skip link", () => {
  test("é o 1.º controlo, fica visível com foco e leva ao <main> sem alterar o URL", async ({ page, browserName }) => {
    await gotoHome(page);
    const skip = page.getByRole("link", { name: "Saltar para o conteúdo" });

    // WebKit: Tab não foca links (Safari por omissão); verifica-se o resto
    // (visível com foco, Enter leva ao <main>) com o foco colocado no link.
    if (TAB_SKIPS_LINKS(browserName)) await skip.focus();
    else await page.keyboard.press("Tab");
    await expect(skip).toBeFocused();
    const box = await skip.boundingBox();
    expect(box && box.width > 1 && box.height > 1 && box.y >= 0).toBe(true);
    await expect(skip).toBeInViewport();

    await page.keyboard.press("Enter");
    await expect(main(page)).toBeFocused();
    expect(new URL(page.url()).hash).toBe("");

    // o Tab seguinte continua dentro do conteúdo principal
    await page.keyboard.press("Tab");
    expect(await page.evaluate(() => document.getElementById("main").contains(document.activeElement))).toBe(true);
  });

  test("também funciona nas páginas legais", async ({ page, browserName }) => {
    await page.goto("/privacidade");
    await expectPage(page.getByRole("heading", { level: 1 })).toBeVisible(); // página lazy montada
    if (TAB_SKIPS_LINKS(browserName)) await page.getByRole("link", { name: "Saltar para o conteúdo" }).focus();
    else await page.keyboard.press("Tab");
    await page.keyboard.press("Enter");
    await expect(main(page)).toBeFocused();
  });
});
