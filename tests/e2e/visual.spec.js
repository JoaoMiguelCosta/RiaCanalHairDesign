// Regressão visual de um conjunto reduzido de blocos estáveis.
// Condições controladas: viewport fixo, sem rede externa, webfonts servidas
// pelo próprio site (Montserrat/Playfair Display, as mesmas que o visitante
// vê; até à remoção da Google Fonts as baselines usavam fontes de recurso do
// sistema), relógio JS parado, movimento reduzido (sliders e testemunhos
// começam em pausa), imagens carregadas.
// As baselines são específicas do SO/browser (sufixo -chromium-win32): num
// ambiente diferente (ex.: CI em Linux) têm de ser geradas lá.
import { test, expect, gotoHome, pauseClock, VIEWPORTS } from "./fixtures.js";

test.use({ viewport: VIEWPORTS.desktop });

// Nos blocos abaixo do topo, o header sticky sobrepõe-se ao elemento
// capturado: é escondido nesses testes, para não acoplar snapshots.
const hideStickyHeader = (page) =>
  // opacity (não visibility): o menu desktop define visibility própria
  page.addStyleTag({ content: "header { opacity: 0 !important; }" });

/** Espera pelas fontes e pelas imagens (lazy) do bloco indicado. */
async function settle(page, locator) {
  await locator.scrollIntoViewIfNeeded();
  await page.evaluate(() => document.fonts.ready);
  await expect
    .poll(() =>
      locator.evaluate((root) =>
        [...root.querySelectorAll("img")].every((img) => img.complete && img.naturalWidth > 0)
      )
    )
    .toBe(true);
  await page.mouse.move(0, 0);
}

test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.clock.install();
  await gotoHome(page);
  await pauseClock(page);
});

test("header", async ({ page }) => {
  const header = page.locator("header");
  await settle(page, header);
  await expect(header).toHaveScreenshot("header.png");
});

test("hero", async ({ page }) => {
  const hero = page.locator("#Start");
  await settle(page, hero);
  // o fundo é uma imagem CSS (preload AVIF): espera pelo seu carregamento
  await page.waitForLoadState("networkidle");
  await expect(hero).toHaveScreenshot("hero.png");
});

test("slider Antes/Depois a 50 %", async ({ page }) => {
  const card = page.locator("#Transformations article").first();
  await settle(page, card);
  await expect(card.getByRole("slider")).toHaveAttribute("aria-valuenow", "50");
  await hideStickyHeader(page);
  await expect(card).toHaveScreenshot("before-after-card.png");
});

test("testemunhos em pausa", async ({ page }) => {
  // a secção (~1005px) tem de caber no viewport: a captura para além do
  // viewport é instável no Chromium (zonas por pintar no topo ou no fundo)
  await page.setViewportSize({ width: 1440, height: 1200 });
  const section = page.locator("#Testimonials");
  await settle(page, section);
  await expect(page.getByRole("button", { name: "Retomar rotação dos testemunhos" })).toBeVisible();
  // animations "allow": em pausa nada se move; "disabled" faria avançar a
  // barra até ao fim e dispararia animationend (troca de cartão)
  await hideStickyHeader(page);
  await expect(section).toHaveScreenshot("testimonials-paused.png", { animations: "allow" });
});

test("footer", async ({ page }) => {
  const footer = page.locator("footer");
  await settle(page, footer);
  await hideStickyHeader(page);
  await expect(footer).toHaveScreenshot("footer.png");
});
