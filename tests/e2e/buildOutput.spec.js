// Fase 8 — verificação estática do output do build (dist/) e do vercel.json.
// Não usa o browser: lê os ficheiros gerados pelo `npm run build` que o
// webServer do Playwright executa antes da suite.
import fs from "fs";
import path from "path";
import { test, expect } from "@playwright/test";

const DIST = path.resolve("dist");
const DOCUMENTS = ["index.html", "termos.html", "privacidade.html", "404.html"];
const read = (file) => fs.readFileSync(path.join(DIST, file), "utf8");
const localRefs = (html) =>
  [...html.matchAll(/(?:src|href)="(\/[^"]*)"/g)].map((m) => m[1]).filter((u) => !u.startsWith("//"));

test.describe("Output do build", () => {
  test("um documento HTML por rota, mais robots.txt e sitemap.xml", () => {
    for (const file of [...DOCUMENTS, "robots.txt", "sitemap.xml", "og.jpg"]) {
      expect(fs.existsSync(path.join(DIST, file)), file).toBe(true);
    }
  });

  test("todos os documentos usam o mesmo JS de entrada e CSS (sem bundles duplicados)", () => {
    const entries = DOCUMENTS.map((doc) => {
      const html = read(doc);
      const scripts = [...html.matchAll(/<script type="module" crossorigin src="([^"]+)"/g)].map((m) => m[1]);
      const styles = [...html.matchAll(/<link rel="stylesheet" crossorigin href="([^"]+)"/g)].map((m) => m[1]);
      return JSON.stringify({ scripts, styles });
    });
    expect(new Set(entries).size).toBe(1);
    const { scripts, styles } = JSON.parse(entries[0]);
    expect(scripts).toHaveLength(1);
    expect(styles).toHaveLength(1);
  });

  test("referências locais dos documentos existem (sem caminhos relativos partidos)", () => {
    for (const doc of DOCUMENTS) {
      const html = read(doc);
      expect(html, `${doc}: caminho relativo`).not.toMatch(/(?:src|href)="\.\.?\//);
      expect(html, `${doc}: entrada de desenvolvimento`).not.toContain("/src/");
      for (const ref of localRefs(html)) {
        expect(fs.existsSync(path.join(DIST, ref.split(/[?#]/)[0])), `${doc} → ${ref}`).toBe(true);
      }
    }
  });

  test("imports dinâmicos dos chunks apontam para ficheiros existentes", () => {
    const assets = fs.readdirSync(path.join(DIST, "assets"));
    for (const file of assets.filter((f) => f.endsWith(".js"))) {
      const code = fs.readFileSync(path.join(DIST, "assets", file), "utf8");
      for (const [, ref] of code.matchAll(/["'`](?:\.\/|\/assets\/)([\w.-]+\.(?:js|css))["'`]/g)) {
        expect(assets, `${file} → ${ref}`).toContain(ref);
      }
    }
  });

  test("ficheiros em /assets têm hash no nome (condição para a cache imutável)", () => {
    for (const file of fs.readdirSync(path.join(DIST, "assets"))) {
      expect(file).toMatch(/-[\w-]{8}\.[a-z0-9]+$/);
    }
  });

  test("os documentos diferem apenas no bloco de metadados", () => {
    const strip = (html) =>
      html.replace(/<title>[^<]*<\/title>|<(?:meta|link) (?:name|property|rel)="(?:description|robots|canonical|og:[\w:]+|twitter:\w+)"[^>]*>|<script type="application\/ld\+json">[^<]*<\/script>/g, "")
        .replace(/\s+/g, " ");
    const base = strip(read("index.html"));
    for (const doc of DOCUMENTS.slice(1)) expect(strip(read(doc)), doc).toBe(base);
  });
});

test.describe("vercel.json", () => {
  const config = JSON.parse(fs.readFileSync(path.resolve("vercel.json"), "utf8"));

  test("sem rewrite catch-all (que impediria o 404.html e o HTTP 404)", () => {
    expect(config.rewrites ?? []).toEqual([]);
    expect(config.routes).toBeUndefined(); // não misturar routes com headers/cleanUrls
  });

  test("URLs limpos e sem barra final (308)", () => {
    expect(config.cleanUrls).toBe(true);
    expect(config.trailingSlash).toBe(false);
    expect(config.outputDirectory).toBe("dist");
  });

  test("cache imutável apenas para /assets (ficheiros com hash), nunca para HTML", () => {
    const withCache = config.headers.filter((rule) =>
      rule.headers.some((h) => h.key.toLowerCase() === "cache-control")
    );
    expect(withCache).toEqual([
      {
        source: "/assets/(.*)",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
    ]);
  });

  // Fase 10: cabeçalhos de segurança em todas as respostas. Sem CSP de
  // recursos (Google Fonts e o iframe do Google Maps teriam de ser listados
  // e validados em Preview); só frame-ancestors, que não restringe recursos.
  test("cabeçalhos de segurança em todas as respostas", () => {
    const all = config.headers.find((rule) => rule.source === "/(.*)");
    expect(all?.headers).toEqual([
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      { key: "X-Frame-Options", value: "SAMEORIGIN" },
      { key: "Content-Security-Policy", value: "frame-ancestors 'self'" },
    ]);
  });
});
