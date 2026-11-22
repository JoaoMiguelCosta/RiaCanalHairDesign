// Geração do bloco <head> por rota (plugin de build). O HTML final emitido
// pelo build é verificado em tests/e2e/buildOutput.spec.js.
import { describe, expect, test } from "vitest";
import { renderRouteHead } from "./routeDocuments.js";
import { NOT_FOUND_META, ROUTES_META } from "../src/app/seo/routeMeta.js";

const [HOME, TERMS] = ROUTES_META;

describe("renderRouteHead", () => {
  test("escapa o conteúdo dos atributos e do título", () => {
    const html = renderRouteHead(TERMS);
    expect(html).toContain("<title>Termos &amp; Condições | Ria Canal Hair Design</title>");
    expect(html).not.toMatch(/content="[^"]*&(?!amp;)[^"]*"/);
  });

  test("omite as tags sem valor (404: sem canonical nem og:url)", () => {
    const html = renderRouteHead(NOT_FOUND_META);
    expect(html).toContain('<meta name="robots" content="noindex" />');
    expect(html).not.toContain('rel="canonical"');
    expect(html).not.toContain('property="og:url"');
  });

  test("JSON-LD apenas quando pedido (Home)", () => {
    expect(renderRouteHead(HOME, { structuredData: true })).toContain('<script type="application/ld+json">');
    expect(renderRouteHead(TERMS)).not.toContain("application/ld+json");
  });

  test("blocos distintos por rota (a substituição no build é inequívoca)", () => {
    const blocks = [...ROUTES_META, NOT_FOUND_META].map((r) => renderRouteHead(r));
    expect(new Set(blocks).size).toBe(blocks.length);
  });
});
