// Fase 8 — HTML inicial por rota, respostas HTTP e política de URLs.
//
// O que isto prova e o que não prova:
// - "HTML inicial": o documento servido ANTES de qualquer JavaScript
//   (contexto com JS desativado). Prova o conteúdo gerado no build.
// - "Respostas HTTP": `vite preview` com a emulação local das regras
//   estáticas do vercel.json (scripts/routeDocuments.js: cleanUrls,
//   trailingSlash:false, 404.html com HTTP 404). Prova a lógica pretendida,
//   NÃO a resposta da Vercel, que exige um Preview Deploy (ver tests/README.md).
import { test, expect, expectPage, gotoHome } from "./fixtures.js";

const SITE = "https://www.riacanalhairdesign.pt";
const NAME = "Ria Canal Hair Design";
const MANAGED = [
  'meta[name="description"]',
  'meta[name="robots"]',
  'link[rel="canonical"]',
  'meta[property="og:type"]',
  'meta[property="og:site_name"]',
  'meta[property="og:locale"]',
  'meta[property="og:title"]',
  'meta[property="og:description"]',
  'meta[property="og:url"]',
  'meta[property="og:image"]',
  'meta[name="twitter:card"]',
  'meta[name="twitter:title"]',
  'meta[name="twitter:description"]',
  'meta[name="twitter:image"]',
];

const PAGES = [
  { path: "/", title: NAME, h1: /Ria Canal/ },
  { path: "/termos", title: `Termos & Condições | ${NAME}`, h1: "Termos & Condições" },
  { path: "/privacidade", title: `Política de Privacidade | ${NAME}`, h1: "Política de Privacidade" },
];
const NOT_FOUND_TITLE = `Página não encontrada | ${NAME}`;

const head = (page, selector) => page.locator(`head ${selector}`);
const content = (page, selector) => head(page, selector).getAttribute("content");

/** Nenhuma tag gerida aparece mais do que uma vez. */
async function expectNoDuplicates(page) {
  for (const selector of MANAGED) {
    expect(await head(page, selector).count(), selector).toBeLessThanOrEqual(1);
  }
  await expect(page.locator("title")).toHaveCount(1);
}

test.describe("HTML inicial (antes do JavaScript)", () => {
  test.use({ javaScriptEnabled: false });

  for (const { path, title } of PAGES) {
    test(`${path}: título, descrição, canonical, Open Graph e Twitter próprios`, async ({ page }) => {
      const res = await page.goto(path);
      expect(res.status()).toBe(200);
      await expect(page.locator("#root")).toBeEmpty(); // nada foi renderizado
      await expect(page).toHaveTitle(title);

      const url = `${SITE}${path}`;
      await expect(head(page, 'link[rel="canonical"]')).toHaveAttribute("href", url);
      await expect(head(page, 'meta[name="robots"]')).toHaveCount(0);
      expect(await content(page, 'meta[property="og:url"]')).toBe(url);
      expect(await content(page, 'meta[property="og:title"]')).toBe(title);
      expect(await content(page, 'meta[name="twitter:title"]')).toBe(title);
      expect(await content(page, 'meta[property="og:type"]')).toBe("website");
      expect(await content(page, 'meta[property="og:locale"]')).toBe("pt_PT");
      expect(await content(page, 'meta[property="og:site_name"]')).toBe(NAME);
      expect(await content(page, 'meta[property="og:image"]')).toBe(`${SITE}/og.jpg`);
      expect(await content(page, 'meta[name="twitter:image"]')).toBe(`${SITE}/og.jpg`);
      expect(await content(page, 'meta[name="twitter:card"]')).toBe("summary_large_image");

      const description = await content(page, 'meta[name="description"]');
      expect(description.length).toBeGreaterThan(50);
      expect(await content(page, 'meta[property="og:description"]')).toBe(description);
      expect(await content(page, 'meta[name="twitter:description"]')).toBe(description);

      expect(await page.content()).not.toMatch(/vercel\.app/);
      await expectNoDuplicates(page);
    });
  }

  test("descrições distintas por rota", async ({ page }) => {
    const descriptions = new Set();
    for (const { path } of PAGES) {
      await page.goto(path);
      descriptions.add(await content(page, 'meta[name="description"]'));
    }
    expect(descriptions.size).toBe(PAGES.length);
  });

  test("URL desconhecido: 404.html com noindex, sem canonical nem og:url", async ({ page }) => {
    const res = await page.goto("/pagina-que-nao-existe");
    expect(res.status()).toBe(404);
    await expect(page).toHaveTitle(NOT_FOUND_TITLE);
    await expect(head(page, 'meta[name="robots"]')).toHaveAttribute("content", "noindex");
    await expect(head(page, 'link[rel="canonical"]')).toHaveCount(0);
    await expect(head(page, 'meta[property="og:url"]')).toHaveCount(0);
    await expectNoDuplicates(page);
  });

  test("JSON-LD (HairSalon) apenas na Home, válido e único", async ({ page }) => {
    await page.goto("/");
    const scripts = head(page, 'script[type="application/ld+json"]');
    await expect(scripts).toHaveCount(1);
    const data = JSON.parse(await scripts.textContent());
    expect(data).toMatchObject({
      "@context": "https://schema.org",
      "@type": "HairSalon",
      name: NAME,
      url: `${SITE}/`,
      telephone: "+351234420471",
      address: { postalCode: "3800-147", addressLocality: "Aveiro" },
    });

    for (const path of ["/termos", "/privacidade", "/nao-existe"]) {
      await page.goto(path);
      await expect(head(page, 'script[type="application/ld+json"]')).toHaveCount(0);
    }
  });
});

test.describe("Respostas HTTP (vite preview + emulação das regras do vercel.json)", () => {
  const get = (request, path) => request.get(path, { maxRedirects: 0 });

  for (const { path } of PAGES) {
    test(`${path}: 200 com HTML`, async ({ request }) => {
      const res = await get(request, path);
      expect(res.status()).toBe(200);
      expect(res.headers()["content-type"]).toMatch(/text\/html/);
    });
  }

  for (const [from, to] of [
    ["/termos/", "/termos"],
    ["/privacidade/", "/privacidade"],
    ["/termos/?ref=abc", "/termos?ref=abc"],
    ["/termos.html", "/termos"],
    ["/index.html", "/"],
  ]) {
    test(`${from} → 308 ${to} (um único salto, query preservada)`, async ({ request }) => {
      const res = await get(request, from);
      expect(res.status()).toBe(308);
      expect(res.headers().location).toBe(to);
      expect((await get(request, to)).status()).toBe(200);
    });
  }

  for (const path of ["/pagina-que-nao-existe", "/nao-existe/abc/def", "/Termos", "/PRIVACIDADE"]) {
    test(`${path}: 404 com o documento de erro`, async ({ request }) => {
      const res = await get(request, path);
      expect(res.status()).toBe(404);
      expect(await res.text()).toContain(`<title>${NOT_FOUND_TITLE}</title>`);
    });
  }

  test("asset inexistente: 404 (não o HTML da Home com 200)", async ({ request }) => {
    const res = await get(request, "/assets/index-inexistente.js");
    expect(res.status()).toBe(404);
    expect(await res.text()).not.toContain('"@type":"HairSalon"');
  });

  for (const [path, type] of [
    ["/robots.txt", /text\/plain/],
    ["/sitemap.xml", /xml/],
    ["/og.jpg", /image\/jpeg/],
    ["/site.webmanifest", /./],
  ]) {
    test(`${path}: servido como ficheiro (${type})`, async ({ request }) => {
      const res = await get(request, path);
      expect(res.status()).toBe(200);
      expect(res.headers()["content-type"]).toMatch(type);
      expect(await res.text()).not.toMatch(/^<!doctype html>/i);
    });
  }
});

test.describe("Política de URLs no browser", () => {
  test("barra final: redireciona para o URL canónico e mostra a página", async ({ page }) => {
    await page.goto("/termos/");
    await expect(page).toHaveURL(/\/termos$/);
    await expectPage(page.getByRole("heading", { level: 1 })).toHaveText("Termos & Condições");
  });

  test("query string preservada; canonical sem query", async ({ page }) => {
    await page.goto("/privacidade?utm_source=teste");
    await expect(page).toHaveURL(/\/privacidade\?utm_source=teste$/);
    await expectPage(page.getByRole("heading", { level: 1 })).toHaveText("Política de Privacidade");
    await expect(page.locator('head link[rel="canonical"]')).toHaveAttribute("href", `${SITE}/privacidade`);
  });

  test("maiúsculas no caminho: página 404 coerente com o HTTP 404", async ({ page }) => {
    const res = await page.goto("/Termos");
    expect(res.status()).toBe(404);
    await expectPage(page.getByRole("heading", { level: 1 })).toHaveText(/Página não encontrada/);
    await expect(page).toHaveTitle(NOT_FOUND_TITLE);
  });

  // O fragmento nunca chega ao servidor: nenhuma regra o pode destruir. O
  // scroll automático no carregamento direto (/#Location) não existe nem na
  // baseline (a Home é lazy); aqui garante-se que o URL e a âncora se mantêm
  // e que a navegação interna por âncora continua a funcionar.
  test("fragmentos das secções preservados (#Location)", async ({ page }) => {
    const res = await page.goto("/#Location");
    expect(res.status()).toBe(200);
    await expectPage(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page).toHaveURL(/\/#Location$/);
    await expect(page.locator("#Location")).toHaveCount(1);

    await page.evaluate(() => (location.hash = "#Space"));
    await expect(page.locator("#Space")).toBeInViewport();
    await expectPage(page.getByRole("heading", { level: 1 })).toBeVisible(); // sem recarregar
  });

  test("refresh numa rota legal mantém a página e os metadados", async ({ page }) => {
    await page.goto("/privacidade");
    await expectPage(page.getByRole("heading", { level: 1 })).toHaveText("Política de Privacidade");
    const res = await page.reload();
    expect(res.status()).toBe(200);
    await expectPage(page.getByRole("heading", { level: 1 })).toHaveText("Política de Privacidade");
    await expect(page).toHaveTitle(`Política de Privacidade | ${NAME}`);
    await expect(page.locator('head link[rel="canonical"]')).toHaveCount(1);
  });

  test("404 → Home → Back/Forward: histórico e metadados sem duplicados", async ({ page }) => {
    await page.goto("/termos");
    await expectPage(page.getByRole("heading", { level: 1 })).toHaveText("Termos & Condições");
    await page.goto("/nao-existe");
    await page.getByRole("link", { name: "Voltar à página inicial" }).click();
    await expect(page).toHaveURL(/\/$/);
    await expect(page.locator('head meta[name="robots"]')).toHaveCount(0);

    await page.goBack(); // SPA: volta ao 404 dentro do mesmo documento
    await expect(page).toHaveURL(/\/nao-existe$/);
    await expectPage(page.getByRole("heading", { level: 1 })).toHaveText(/Página não encontrada/);
    await expect(page.locator('head meta[name="robots"]')).toHaveAttribute("content", "noindex");
    await expect(page.locator('head link[rel="canonical"]')).toHaveCount(0);

    await page.goBack(); // documento anterior (termos.html)
    await expect(page).toHaveURL(/\/termos$/);
    await expectPage(page.getByRole("heading", { level: 1 })).toHaveText("Termos & Condições");

    await page.goForward();
    await expect(page).toHaveURL(/\/nao-existe$/);
    await expect(page).toHaveTitle(NOT_FOUND_TITLE);
  });

  test("navegação SPA atualiza todos os metadados sem duplicar tags", async ({ page }) => {
    await gotoHome(page);
    await page.getByRole("link", { name: "Termos & Condições" }).click();
    await expect(page).toHaveTitle(`Termos & Condições | ${NAME}`);
    await expect(page.locator('head meta[property="og:url"]')).toHaveAttribute("content", `${SITE}/termos`);
    await expect(page.locator('head meta[name="twitter:title"]')).toHaveAttribute(
      "content",
      `Termos & Condições | ${NAME}`
    );
    await expectNoDuplicates(page);
  });
});
