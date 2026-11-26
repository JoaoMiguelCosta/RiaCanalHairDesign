// syncRouteHead: atualiza as tags do HTML inicial sem criar duplicados.
import { beforeEach, describe, expect, test } from "vitest";
import { NOT_FOUND_META, ROUTES_META, SITE_URL } from "./routeMeta.js";
import { syncRouteHead } from "./syncHead.js";

const [HOME, TERMS] = ROUTES_META;
const all = (selector) => document.head.querySelectorAll(selector);
const one = (selector) => document.head.querySelector(selector);

beforeEach(() => {
  document.head.innerHTML = "";
  document.title = "";
});

describe("syncRouteHead", () => {
  test("cria as tags em falta (ex.: dev server ou head vazio)", () => {
    syncRouteHead(TERMS);
    expect(document.title).toBe(TERMS.title);
    expect(one('link[rel="canonical"]')).toHaveAttribute("href", `${SITE_URL}/termos`);
    expect(one('meta[property="og:url"]')).toHaveAttribute("content", `${SITE_URL}/termos`);
    expect(one('meta[name="description"]')).toHaveAttribute("content", TERMS.description);
    expect(one('meta[name="robots"]')).toBeNull();
  });

  test("reutiliza as tags do HTML inicial (mesmos elementos, novos valores)", () => {
    syncRouteHead(HOME);
    const canonical = one('link[rel="canonical"]');
    const ogTitle = one('meta[property="og:title"]');
    const count = document.head.children.length;

    syncRouteHead(TERMS);
    expect(one('link[rel="canonical"]')).toBe(canonical);
    expect(one('meta[property="og:title"]')).toBe(ogTitle);
    expect(ogTitle).toHaveAttribute("content", TERMS.title);
    expect(document.head.children.length).toBe(count);
  });

  test("404: acrescenta noindex e remove canonical e og:url; ao sair, repõe-nos", () => {
    syncRouteHead(HOME);
    syncRouteHead(NOT_FOUND_META);
    expect(one('meta[name="robots"]')).toHaveAttribute("content", "noindex");
    expect(one('link[rel="canonical"]')).toBeNull();
    expect(one('meta[property="og:url"]')).toBeNull();
    expect(document.title).toBe(NOT_FOUND_META.title);

    syncRouteHead(HOME);
    expect(one('meta[name="robots"]')).toBeNull();
    expect(one('link[rel="canonical"]')).toHaveAttribute("href", `${SITE_URL}/`);
  });

  test("elimina duplicados herdados", () => {
    document.head.innerHTML =
      '<link rel="canonical" href="https://exemplo.invalid/a"><link rel="canonical" href="https://exemplo.invalid/b">' +
      '<meta property="og:title" content="x"><meta property="og:title" content="y">';
    syncRouteHead(TERMS);
    expect(all('link[rel="canonical"]')).toHaveLength(1);
    expect(all('meta[property="og:title"]')).toHaveLength(1);
    expect(one('link[rel="canonical"]')).toHaveAttribute("href", `${SITE_URL}/termos`);
  });

  test("não toca em tags que não gere", () => {
    document.head.innerHTML = '<meta name="theme-color" content="#1C2431"><link rel="icon" href="/favicon.png">';
    syncRouteHead(NOT_FOUND_META);
    expect(one('meta[name="theme-color"]')).toHaveAttribute("content", "#1C2431");
    expect(one('link[rel="icon"]')).not.toBeNull();
  });
});
