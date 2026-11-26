// Fragmentos da Home num browser real (Fase 9): links diretos (/#Location),
// carregamento lazy, refresh, Back/Forward e alinhamento abaixo do header.
import { test, expect, expectPage, gotoHome, touchDevice, VIEWPORTS } from "./fixtures.js";

// Secções da Home com id público (links do header/footer)
const SECTIONS = [
  "AboutUs",
  "TeamAndServices",
  "Works",
  "Transformations",
  "Space",
  "Instagram",
  "Testimonials",
  "Location",
];

const scrollPos = (page) =>
  page.evaluate(() => Math.max(document.scrollingElement.scrollTop, document.body.scrollTop));

/** Distância entre o topo da secção e o fundo do header sticky (px). */
const offsetFromHeader = (page, id) =>
  page.evaluate((id) => {
    const el = document.getElementById(id);
    const header = document.querySelector("header");
    if (!el || !header) return null;
    return Math.round(el.getBoundingClientRect().top - header.getBoundingClientRect().bottom);
  }, id);

/**
 * A secção fica alinhada logo abaixo do header (nem tapada, nem afastada) e
 * mantém-se assim (sem saltos posteriores). Espera pelo fim de um eventual
 * scroll suave.
 */
async function expectAligned(page, id) {
  await expect
    .poll(async () => {
      const off = await offsetFromHeader(page, id);
      return off !== null && off >= -1 && off <= 2;
    }, { timeout: 10_000 })
    .toBe(true);
  await page.waitForTimeout(300);
  const off = await offsetFromHeader(page, id);
  expect(off, "a secção continua alinhada").toBeGreaterThanOrEqual(-1);
  expect(off).toBeLessThanOrEqual(2);
  await expect(page.locator(`#${id}`)).toBeInViewport();
}

/** Espera pela Home montada (o chunk atrasado pode demorar sob carga). */
const homeMounted = (page) =>
  expect(page.locator("#main h1")).toBeAttached({ timeout: 15_000 });

/**
 * Atrasa o chunk lazy da Home, como numa ligação real: o browser tenta
 * resolver o fragmento antes de a secção existir e desiste (localmente o
 * chunk chega quase instantaneamente e esconde o defeito).
 */
async function delayHomeChunk(page) {
  await page.route(/\/assets\/home-[\w-]+\.js$/, async (route) => {
    await new Promise((r) => setTimeout(r, 800));
    await route.continue();
  });
}

test.describe("Links diretos para secções da Home (chunk lazy atrasado)", () => {
  for (const [name, use] of [
    ["desktop", { viewport: VIEWPORTS.desktop }],
    ["mobile", touchDevice(VIEWPORTS.mobile)],
  ]) {
    test.describe(name, () => {
      test.use(use);
      for (const id of SECTIONS) {
        test(`abrir /#${id} mostra a secção abaixo do header`, async ({ page }) => {
          await delayHomeChunk(page);
          await page.goto(`/#${id}`);
          await homeMounted(page);
          await expectAligned(page, id);
          await expect(page).toHaveURL(new RegExp(`/#${id}$`));
          // o foco não é roubado no carregamento
          expect(await page.evaluate(() => document.activeElement === document.body)).toBe(true);
        });
      }
    });
  }

  test("/#Works continua a mostrar o filtro por defeito ativo", async ({ page }) => {
    await delayHomeChunk(page);
    await page.goto("/#Works");
    await expectAligned(page, "Works");
    await expect(page.locator("#Works").getByRole("button", { pressed: true })).toHaveText(/Cabeleireiro/i);
  });

  test("fragmento inexistente: fica no topo, sem erros", async ({ page }) => {
    await delayHomeChunk(page);
    await page.goto("/#NaoExiste");
    await expectPage(page.getByRole("heading", { level: 1 })).toBeVisible();
    expect(await scrollPos(page)).toBe(0);
    await expect(page).toHaveURL(/#NaoExiste$/);
  });

  test("movimento reduzido: /#Location alinha a secção", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await delayHomeChunk(page);
    await page.goto("/#Location");
    await expectAligned(page, "Location");
  });
});

test.describe("Navegação por âncoras na Home", () => {
  test.use({ viewport: VIEWPORTS.desktop });

  test("refresh numa URL com fragmento mantém a secção", async ({ page }) => {
    await gotoHome(page, "/#AboutUs");
    await expectAligned(page, "AboutUs");
    await page.reload();
    await expectPage(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expectAligned(page, "AboutUs");
  });

  // Back/Forward entre fragmentos da mesma página é tratado pelo browser (a
  // app não interfere): o Chromium volta a resolver o fragmento; Firefox e
  // WebKit repõem a posição guardada na entrada do histórico — onde o
  // utilizador estava quando clicou (o link "Sobre Nós" está no footer).
  // Os dois destinos são válidos; exige-se um deles, estável.
  test("links internos, Back e Forward entre fragmentos", async ({ page }) => {
    await gotoHome(page);
    const footer = page.locator("footer");
    await footer.getByRole("link", { name: "Contactos" }).click();
    await expect(page).toHaveURL(/#Location$/);
    await expectAligned(page, "Location");

    const aboutLink = footer.getByRole("link", { name: "Sobre Nós" });
    await aboutLink.scrollIntoViewIfNeeded();
    const leftAt = await scrollPos(page); // posição guardada na entrada #Location
    await aboutLink.click();
    await expect(page).toHaveURL(/#AboutUs$/);
    await expectAligned(page, "AboutUs");

    await page.goBack();
    await expect(page).toHaveURL(/#Location$/);
    const backDestination = async () => {
      const off = await offsetFromHeader(page, "Location");
      if (off !== null && off >= -1 && off <= 2) return "secção alinhada";
      if (Math.abs((await scrollPos(page)) - leftAt) <= 2) return "posição reposta";
      return "outro";
    };
    await expect.poll(backDestination, { timeout: 10_000 }).not.toBe("outro");
    const destination = await backDestination();
    await page.waitForTimeout(300);
    expect(await backDestination(), "destino estável").toBe(destination);

    await page.goForward();
    await expect(page).toHaveURL(/#AboutUs$/);
    await expectAligned(page, "AboutUs");
  });

  test("a mesma âncora repetida volta a levar à secção", async ({ page }) => {
    await gotoHome(page);
    const link = page.locator("footer").getByRole("link", { name: "Espaço" });
    await link.click();
    await expectAligned(page, "Space");
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
    await link.click();
    await expect(page).toHaveURL(/#Space$/);
    await expectAligned(page, "Space");
    // o histórico não ganhou entradas por repetir a mesma âncora
    expect(await page.evaluate(() => history.length)).toBeLessThanOrEqual(3);
  });

  for (const [legal, linkName] of [
    ["/termos", "Termos & Condições"],
    ["/privacidade", "Política de Privacidade"],
  ]) {
    // Back entre rotas (POP) é tratado pelo browser: o Chromium repõe a
    // posição em que o utilizador estava ao sair (os links legais estão no
    // footer) ou resolve o fragmento #Location quando a secção aparece. Os
    // dois destinos são válidos; exige-se um deles, estável. Antes da Fase 9
    // (o <body> fazia scroll) a página ficava no topo.
    test(`/#Location → ${legal} → Back regressa à zona de Contactos`, async ({ page }) => {
      await gotoHome(page);
      await page.locator("footer").getByRole("link", { name: "Contactos" }).click();
      await expectAligned(page, "Location");

      const legalLink = page.locator("footer").getByRole("link", { name: linkName });
      await legalLink.scrollIntoViewIfNeeded();
      const before = await scrollPos(page);
      expect(before).toBeGreaterThan(0);
      await legalLink.click();
      await expect(page.getByRole("heading", { level: 1, name: linkName })).toBeVisible();
      await expect.poll(() => scrollPos(page)).toBe(0);

      await page.goBack();
      await expect(page).toHaveURL(/\/#Location$/);
      await expect(page.locator("#Location")).toBeAttached();
      // destino válido e parado (duas leituras iguais com 300ms de intervalo)
      const settledAtValidDestination = async () => {
        const y = await scrollPos(page);
        await page.waitForTimeout(300);
        if ((await scrollPos(page)) !== y) return false;
        const off = await offsetFromHeader(page, "Location");
        return Math.abs(y - before) <= 2 || (off >= -1 && off <= 2);
      };
      await expect.poll(settledAtValidDestination, { timeout: 10_000 }).toBe(true);
      await expect(page.locator("#Location")).toBeInViewport();
      // o foco não fica num elemento da página anterior: <main> (RouteAnnouncer)
      // ou <body>, se o browser resolver o fragmento (move o ponto de partida
      // da navegação por Tab para #Location; igual antes da Fase 9)
      expect(await page.evaluate(() => ["MAIN", "BODY"].includes(document.activeElement.tagName))).toBe(true);
    });
  }
});

test.describe("Âncoras em mobile", () => {
  test.use(touchDevice(VIEWPORTS.mobile));

  test("menu mobile → secção alinhada abaixo do header e scroll desbloqueado", async ({ page }) => {
    await gotoHome(page);
    await page.getByRole("button", { name: "Menu de navegação" }).tap();
    await page.locator("#mobile-menu").getByRole("link", { name: "CONTACTOS" }).tap();
    await expect(page).toHaveURL(/#Location$/);
    await expectAligned(page, "Location");
    expect(await page.evaluate(() => document.documentElement.style.overflow)).toBe("");
  });
});
