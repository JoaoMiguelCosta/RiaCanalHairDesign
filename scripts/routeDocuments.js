// scripts/routeDocuments.js
// Plugin Vite: HTML inicial específico por rota, sem SSR.
//
// 1. transformIndexHtml (dev e build): troca o marcador <!--route-head--> do
//    index.html pelos metadados da Home (title, description, canonical, OG,
//    Twitter) e pelo JSON-LD.
// 2. generateBundle (build): parte do index.html JÁ processado pelo Vite
//    (scripts e CSS com hash incluídos) e emite termos.html, privacidade.html
//    e 404.html, trocando apenas esse bloco de metadados. A aplicação React,
//    os chunks e o CSS são os mesmos para todos os documentos.
// 3. configurePreviewServer (só `vite preview`): emula as regras estáticas
//    configuradas em vercel.json (cleanUrls, trailingSlash: false, 404.html
//    com HTTP 404), para testes locais. Não prova o comportamento da Vercel.
import fs from "fs";
import path from "path";
import {
  NOT_FOUND_META,
  ROUTES_META,
  getHeadTags,
} from "../src/app/seo/routeMeta.js";
import {
  getStructuredData,
  serializeJsonLd,
} from "../src/app/seo/structuredData.js";

const MARKER = "<!--route-head-->";

const escapeHtml = (value) =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

/** Bloco <head> de uma rota (sempre gerado pela mesma função). */
export function renderRouteHead(route, { structuredData = false } = {}) {
  const lines = [`<title>${escapeHtml(route.title)}</title>`];
  for (const { tag, key, attr, value } of getHeadTags(route)) {
    if (value == null) continue;
    lines.push(
      `<${tag} ${key[0]}="${escapeHtml(key[1])}" ${attr}="${escapeHtml(value)}" />`
    );
  }
  if (structuredData) {
    lines.push(
      `<script type="application/ld+json">${serializeJsonLd(getStructuredData())}</script>`
    );
  }
  return lines.join("\n  ");
}

const [HOME, ...OTHER_ROUTES] = ROUTES_META;
const HOME_HEAD = renderRouteHead(HOME, { structuredData: true });

/** Substitui exatamente uma ocorrência; falha o build se não for única. */
function replaceOnce(html, search, replacement, label) {
  const first = html.indexOf(search);
  if (first === -1 || html.indexOf(search, first + 1) !== -1) {
    throw new Error(`[route-documents] ${label}: bloco esperado exatamente uma vez`);
  }
  return html.slice(0, first) + replacement + html.slice(first + search.length);
}

/** Emulação local de cleanUrls + trailingSlash:false + 404.html (vercel.json). */
function vercelStaticRules(outDir) {
  const root = path.resolve(outDir);
  // Comparação sensível a maiúsculas mesmo em Windows/macOS (o sistema de
  // ficheiros local não distingue /Termos de /termos; a Vercel corre em Linux)
  const isFile = (p) => {
    const abs = path.resolve(root, `.${p}`);
    if (!abs.startsWith(root + path.sep)) return false;
    try {
      let dir = root;
      for (const segment of path.relative(root, abs).split(path.sep)) {
        if (!fs.readdirSync(dir).includes(segment)) return false;
        dir = path.join(dir, segment);
      }
      return fs.statSync(abs).isFile();
    } catch {
      return false; // ex.: um segmento intermédio é um ficheiro
    }
  };

  return (req, res, next) => {
    if (req.method !== "GET" && req.method !== "HEAD") return next();
    const url = new URL(req.url, "http://localhost");
    let pathname;
    try {
      pathname = decodeURIComponent(url.pathname);
    } catch {
      pathname = url.pathname;
    }
    const redirect = (location) => {
      res.statusCode = 308;
      res.setHeader("Location", location + url.search);
      res.end();
    };

    if (pathname === "/") return next();
    if (pathname.endsWith("/")) return redirect(url.pathname.replace(/\/+$/, "") || "/");
    if (pathname.endsWith(".html")) {
      const clean = url.pathname.slice(0, -".html".length);
      return redirect(clean === "/index" ? "/" : clean);
    }
    if (isFile(pathname)) return next();
    if (isFile(`${pathname}.html`)) {
      req.url = `${url.pathname}.html${url.search}`;
      return next();
    }

    res.statusCode = 404;
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.end(req.method === "HEAD" ? undefined : fs.readFileSync(path.join(root, NOT_FOUND_META.document)));
  };
}

export default function routeDocuments() {
  let outDir = "dist";

  return {
    name: "route-documents",
    enforce: "post",

    configResolved(config) {
      outDir = path.resolve(config.root, config.build.outDir);
    },

    transformIndexHtml: {
      order: "pre",
      handler: (html) => replaceOnce(html, MARKER, HOME_HEAD, "index.html"),
    },

    generateBundle: {
      order: "post",
      handler(_options, bundle) {
        const index = bundle[HOME.document];
        if (!index || index.type !== "asset") {
          throw new Error("[route-documents] index.html não encontrado no bundle");
        }
        const html = String(index.source);
        for (const route of [...OTHER_ROUTES, NOT_FOUND_META]) {
          this.emitFile({
            type: "asset",
            fileName: route.document,
            source: replaceOnce(html, HOME_HEAD, renderRouteHead(route), route.document),
          });
        }
      },
    },

    configurePreviewServer(server) {
      server.middlewares.use(vercelStaticRules(outDir));
    },
  };
}
