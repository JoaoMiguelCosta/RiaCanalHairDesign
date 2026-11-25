// SEO local e carregamento (build de produção), depois de o React carregar.
// O HTML inicial por rota, as respostas HTTP e a política de URLs estão em
// routing.spec.js; o output do build e o vercel.json em buildOutput.spec.js.
// Fora do âmbito, por não serem verificáveis localmente: indexação real,
// pré-visualizações sociais e respostas reais da Vercel (Preview Deploy).
import { test, expect, expectPage, gotoHome } from "./fixtures.js";

const SITE = "https://www.riacanalhairdesign.pt";
const heroPreload = 'link[rel="preload"][as="image"][fetchpriority="high"]';

test.describe("Ficheiros de rastreio no build", () => {
  test("robots.txt aponta para o sitemap", async ({ request }) => {
    const res = await request.get("/robots.txt");
    expect(res.status()).toBe(200);
    const body = await res.text();
    expect(body).toContain("User-agent: *");
    expect(body).toContain(`Sitemap: ${SITE}/sitemap.xml`);
  });

  test("sitemap.xml lista as páginas indexáveis (e não o 404)", async ({ request }) => {
    const res = await request.get("/sitemap.xml");
    expect(res.status()).toBe(200);
    const xml = await res.text();
    for (const path of ["/", "/termos", "/privacidade"]) {
      expect(xml).toContain(`<loc>${SITE}${path}</loc>`);
    }
    expect(xml.match(/<loc>/g)).toHaveLength(3);
  });
});

test.describe("Canonical e robots por rota", () => {
  for (const path of ["/", "/termos", "/privacidade"]) {
    test(`${path}: canonical próprio e sem noindex`, async ({ page }) => {
      await page.goto(path);
      await expect(page.locator('head link[rel="canonical"]')).toHaveAttribute("href", `${SITE}${path}`);
      await expect(page.locator('head link[rel="canonical"]')).toHaveCount(1);
      await expect(page.locator('head meta[name="robots"]')).toHaveCount(0);
    });
  }

  test("404: noindex e sem canonical", async ({ page }) => {
    await page.goto("/pagina-que-nao-existe");
    await expect(page.locator('head meta[name="robots"]')).toHaveAttribute("content", "noindex");
    await expect(page.locator('head link[rel="canonical"]')).toHaveCount(0);
  });

  test("os metadados acompanham a navegação SPA", async ({ page }) => {
    await page.goto("/pagina-que-nao-existe");
    await expect(page.locator('head meta[name="robots"]')).toHaveCount(1);
    await page.getByRole("link", { name: "Voltar à página inicial" }).click();
    await expect(page.locator('head meta[name="robots"]')).toHaveCount(0);
    await expect(page.locator('head link[rel="canonical"]')).toHaveAttribute("href", `${SITE}/`);
  });
});

test.describe("Preload do Hero", () => {
  // Um único download do Hero em qualquer motor: AVIF (preload + image-set)
  // onde é suportado; onde não é (ex.: WebKit do Playwright em Windows), o
  // preload com type="image/avif" é ignorado e o image-set() escolhe o WebP —
  // nunca os dois formatos.
  test("Home: preload AVIF de alta prioridade e um único pedido do recurso", async ({
    page,
    sameOriginRequests,
    browserName,
  }) => {
    await gotoHome(page);
    const link = page.locator(heroPreload);
    await expect(link).toHaveCount(1);
    const href = await link.getAttribute("href");
    expect(href).toMatch(/\/assets\/hero-1920-[\w-]+\.avif$/);

    await page.waitForLoadState("networkidle");
    const heroRequests = sameOriginRequests.filter((u) => /hero-1920-[\w-]+\.(avif|webp)$/.test(u));
    expect(heroRequests).toHaveLength(1);
    if (browserName !== "webkit") expect(heroRequests[0]).toMatch(/\.avif$/);
  });

  for (const path of ["/termos", "/privacidade", "/pagina-inexistente"]) {
    test(`${path}: sem preload nem download do Hero`, async ({ page, sameOriginRequests }) => {
      await page.goto(path);
      await expectPage(page.getByRole("heading", { level: 1 })).toBeVisible();
      await page.waitForLoadState("networkidle");
      await expect(page.locator(heroPreload)).toHaveCount(0);
      expect(sameOriginRequests.filter((u) => /hero-1920/.test(u))).toEqual([]);
    });
  }
});

test.describe("Imagens", () => {
  test("todas as imagens da Home carregam a partir do build (sem 404)", async ({ page }) => {
    const failed = [];
    page.on("response", (res) => {
      if (res.url().startsWith(new URL(page.url() || "http://x").origin) && res.status() >= 400) {
        failed.push(`${res.status()} ${res.url()}`);
      }
    });
    await gotoHome(page);
    // percorre a página para disparar o lazy loading
    await page.evaluate(async () => {
      const scroller = document.scrollingElement;
      for (let y = 0; y < document.body.scrollHeight; y += 600) {
        window.scrollTo(0, y);
        document.body.scrollTo?.(0, y);
        await new Promise((r) => requestAnimationFrame(() => r()));
      }
      scroller.scrollTop = 0;
    });
    await page.waitForLoadState("networkidle");

    const images = await page.$$eval("img", (imgs) =>
      imgs.map((img) => ({ src: img.currentSrc || img.src, complete: img.complete, w: img.naturalWidth }))
    );
    expect(images.length).toBeGreaterThan(20);
    const broken = images.filter((i) => i.complete && i.w === 0);
    expect(broken).toEqual([]);
    for (const { src } of images) {
      expect(src).toMatch(/\/assets\/[\w-]+\.(webp|avif|jpg|png)$/);
    }
    expect(failed).toEqual([]);
  });
});
