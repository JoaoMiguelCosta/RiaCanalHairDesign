// Metadados por rota: estrutura, política de canonical e coerência com o
// sitemap/robots (ficheiros em public/).
import { describe, expect, test } from "vitest";
import fs from "fs";
import path from "path";
import {
  NOT_FOUND_META,
  OG_IMAGE,
  ROUTES_META,
  SITE_URL,
  canonicalUrl,
  getHeadTags,
} from "./routeMeta.js";

const publicFile = (name) => fs.readFileSync(path.resolve("public", name), "utf8");
const valueOf = (tags, keyValue) => tags.find((t) => t.key[1] === keyValue)?.value;

describe("routeMeta — política de URLs", () => {
  test("domínio canónico em HTTPS com www, sem barra final", () => {
    expect(SITE_URL).toBe("https://www.riacanalhairdesign.pt");
  });

  test.each(ROUTES_META.map((r) => [r.path, r]))("%s: canonical absoluto, minúsculas e sem barra final", (p, route) => {
    const url = canonicalUrl(route.path);
    expect(url).toMatch(/^https:\/\/www\.riacanalhairdesign\.pt\//);
    expect(url).not.toMatch(/#|\?/);
    expect(route.path).toBe(route.path.toLowerCase());
    if (route.path !== "/") expect(route.path.endsWith("/")).toBe(false);
  });

  test("um documento HTML por rota, sem repetições", () => {
    const docs = [...ROUTES_META, NOT_FOUND_META].map((r) => r.document);
    expect(docs).toEqual(["index.html", "termos.html", "privacidade.html", "404.html"]);
    expect(new Set(ROUTES_META.map((r) => r.title)).size).toBe(ROUTES_META.length);
    expect(new Set(ROUTES_META.map((r) => r.description)).size).toBe(ROUTES_META.length);
  });
});

describe("routeMeta — tags geridas", () => {
  test.each(ROUTES_META.map((r) => [r.path, r]))("%s: indexável, com canonical, og:url e Twitter coerentes", (p, route) => {
    const tags = getHeadTags(route);
    const url = canonicalUrl(route.path);
    expect(valueOf(tags, "robots")).toBeNull();
    expect(valueOf(tags, "canonical")).toBe(url);
    expect(valueOf(tags, "og:url")).toBe(url);
    expect(valueOf(tags, "og:title")).toBe(route.title);
    expect(valueOf(tags, "twitter:title")).toBe(route.title);
    expect(valueOf(tags, "description")).toBe(route.description);
    expect(valueOf(tags, "og:description")).toBe(route.description);
    expect(valueOf(tags, "twitter:description")).toBe(route.description);
    expect(valueOf(tags, "og:image")).toBe(OG_IMAGE.url);
    expect(valueOf(tags, "twitter:image")).toBe(OG_IMAGE.url);
    expect(valueOf(tags, "og:locale")).toBe("pt_PT");
  });

  test("404: noindex, sem canonical nem og:url", () => {
    const tags = getHeadTags(NOT_FOUND_META);
    expect(valueOf(tags, "robots")).toBe("noindex");
    expect(valueOf(tags, "canonical")).toBeNull();
    expect(valueOf(tags, "og:url")).toBeNull();
    expect(valueOf(tags, "og:title")).toBe(NOT_FOUND_META.title);
  });

  test("cada tag aparece uma única vez", () => {
    const keys = getHeadTags(ROUTES_META[0]).map((t) => `${t.tag}[${t.key.join("=")}]`);
    expect(new Set(keys).size).toBe(keys.length);
  });

  test("a imagem OG existe em public/ com as dimensões declaradas", () => {
    const jpg = fs.readFileSync(path.resolve("public/og.jpg"));
    // marcador SOF0..SOF3 do JPEG: altura e largura
    let i = 2;
    let size = null;
    while (i < jpg.length) {
      const marker = jpg[i + 1];
      if (marker >= 0xc0 && marker <= 0xc3) {
        size = { height: jpg.readUInt16BE(i + 5), width: jpg.readUInt16BE(i + 7) };
        break;
      }
      i += 2 + jpg.readUInt16BE(i + 2);
    }
    expect(size).toEqual({ width: OG_IMAGE.width, height: OG_IMAGE.height });
  });
});

describe("robots.txt e sitemap.xml", () => {
  test("sitemap lista exatamente as rotas indexáveis, com os canonical", () => {
    const xml = publicFile("sitemap.xml");
    expect(xml.startsWith('<?xml version="1.0" encoding="UTF-8"?>')).toBe(true);
    const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
    expect(locs).toEqual(ROUTES_META.map((r) => canonicalUrl(r.path)));
    expect(xml).not.toMatch(/vercel\.app|404/);
    expect(xml).not.toMatch(/<lastmod>/); // sem datas não verificáveis
  });

  test("robots.txt permite a indexação e aponta para o sitemap canónico", () => {
    const robots = publicFile("robots.txt");
    expect(robots).toMatch(/^User-agent: \*$/m);
    expect(robots).not.toMatch(/^Disallow: \/\s*$/m);
    expect(robots).toMatch(new RegExp(`^Sitemap: ${SITE_URL}/sitemap.xml$`, "m"));
  });
});
