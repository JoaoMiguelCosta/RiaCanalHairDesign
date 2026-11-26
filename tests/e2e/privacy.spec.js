// Serviços externos (auditoria de privacidade): o site não contacta a Google
// sem uma ação explícita do visitante.
// - Fontes servidas pelo próprio domínio: zero pedidos a fonts.googleapis.com
//   / fonts.gstatic.com em todas as rotas.
// - Google Maps só depois de «Mostrar mapa»: zero pedidos no carregamento e
//   durante o scroll até Contactos.
// A fixture aborta os pedidos externos (testes offline), mas o evento
// `request` dispara antes disso: conta-se o que o site TENTA pedir.
import { test, expect, gotoHome, expectPage, scrollToSection, VIEWPORTS, touchDevice } from "./fixtures.js";

const GOOGLE = /(^|\.)(google\.com|googleapis\.com|gstatic\.com|googleusercontent\.com)$/;
const isGoogle = (url) => {
  try {
    return GOOGLE.test(new URL(url).hostname);
  } catch {
    return false;
  }
};

/** Regista os pedidos externos tentados pela página (e pelos seus frames). */
function recordExternal(page) {
  const urls = [];
  page.on("request", (req) => {
    if (isGoogle(req.url())) urls.push(req.url());
  });
  return urls;
}

/**
 * Percorre a página até ao fim, como um visitante (dispara lazy loading e
 * IntersectionObservers): um ecrã de cada vez, com um frame pintado em cada
 * posição. Tudo num só evaluate (sob carga, um pedido por passo chegou a
 * custar ~1 s no WebKit); scrollTo porque mouse.wheel não existe no WebKit
 * em modo telemóvel.
 */
async function scrollThrough(page) {
  await page.evaluate(async () => {
    const frame = () => new Promise((resolve) => requestAnimationFrame(resolve));
    for (let y = 0; y <= document.documentElement.scrollHeight; y += window.innerHeight) {
      window.scrollTo(0, y);
      await frame();
    }
  });
  await scrollToSection(page, "Location");
}

test.describe("Fontes locais", () => {
  for (const path of ["/", "/termos", "/privacidade"]) {
    test(`${path}: sem pedidos à Google Fonts e fontes carregadas do próprio domínio`, async ({ page, baseURL }) => {
      const external = recordExternal(page);
      const fonts = [];
      page.on("response", (res) => {
        if (res.request().resourceType() === "font") fonts.push({ url: res.url(), status: res.status() });
      });
      await page.goto(path);
      await expectPage(page.getByRole("heading", { level: 1 })).toBeVisible();
      await page.evaluate(() => document.fonts.ready);

      const loaded = await page.evaluate(() => ({
        montserrat: document.fonts.check('600 16px "Montserrat"', "Aa"),
        playfair: document.fonts.check('700 16px "Playfair Display"', "Aa"),
        // só as webfonts servidas pelo site; o "Montserrat Fallback" usa
        // local("Arial"…), que o WebKit do Playwright (Windows) não resolve
        failed: [...document.fonts]
          .filter((f) => ["Montserrat", "Playfair Display"].includes(f.family.replace(/"/g, "")))
          .filter((f) => f.status === "error")
          .map((f) => f.family),
      }));
      expect(loaded.failed).toEqual([]);
      for (const font of fonts) {
        expect(font.url.startsWith(`${baseURL}/assets/`), font.url).toBe(true);
        expect(font.url).toMatch(/\.woff2$/);
        expect(font.status, font.url).toBe(200);
      }
      // a Home usa as duas famílias (títulos e texto); as páginas legais
      // usam sobretudo a fonte do sistema e só pedem o que precisarem
      if (path === "/") {
        expect(fonts.length, "fontes pedidas na Home").toBe(2);
        expect(loaded).toMatchObject({ montserrat: true, playfair: true });
      }

      expect(external.filter((u) => /fonts\.(googleapis|gstatic)\.com/.test(u))).toEqual([]);
    });
  }
});

test.describe("Google Maps por clique", () => {
  for (const [label, use] of [
    ["desktop", { viewport: VIEWPORTS.desktop }],
    ["telemóvel", touchDevice()],
    // ≤ 376px: a coluna do mapa chegou a ficar com altura fixa e os cartões
    // seguintes tapavam o botão (o click falha se outro elemento o intercetar)
    ["telemóvel pequeno", touchDevice(VIEWPORTS.smallMobile)],
  ]) {
    test.describe(label, () => {
      test.use(use);

      test("sem pedidos à Google antes do clique; o mapa só carrega depois", async ({ page }) => {
        const external = recordExternal(page);
        await gotoHome(page);
        await scrollThrough(page);

        const section = page.locator("#Location");
        const button = section.getByRole("button", { name: "Mostrar mapa" });
        await expect(button).toBeVisible();
        await expect(section.locator("iframe")).toHaveCount(0);
        // nada antecipa a ligação (preconnect, dns-prefetch, preload)
        expect(
          await page.locator('link[rel="preconnect"], link[rel="dns-prefetch"], link[rel="preload"]')
            .evaluateAll((links) => links.map((l) => l.href).filter((h) => /google|gstatic/.test(h)))
        ).toEqual([]);
        expect(external, "pedidos à Google antes do clique").toEqual([]);

        await button.click();
        const frame = section.locator("iframe");
        await expect(frame).toHaveAttribute("title", "Mapa da localização do Ria Canal Hair Design em Aveiro");
        await expect(frame).toHaveAttribute("referrerpolicy", "no-referrer");
        await expect.poll(() => external.some((u) => u.startsWith("https://www.google.com/maps/embed"))).toBe(true);
      });
    });
  }

  test("teclado: o botão é focável, Enter mostra o mapa e o foco passa para ele", async ({ page }) => {
    await gotoHome(page);
    const button = page.getByRole("button", { name: "Mostrar mapa" });
    await scrollToSection(page, "Location");
    await button.focus();
    await expect(button).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(page.locator("#Location iframe")).toBeFocused();
  });

  test("endereço e ligação externa «Ver Google Maps» preservados", async ({ page }) => {
    await gotoHome(page);
    const section = await scrollToSection(page, "Location");
    await expect(section.getByText("Praceta Dr. Alberto Souto 9, 3800-147 Aveiro")).toBeVisible();
    const link = section.getByRole("link", { name: "Ver Google Maps" });
    await expect(link).toHaveAttribute("href", /^https:\/\/www\.google\.com\/maps\/dir\//);
    await expect(link).toHaveAttribute("target", "_blank");
  });
});
