// src/app/seo/routeMeta.js
// Fonte única dos metadados por rota. Usada:
// - no build (scripts/routeDocuments.js): gera o HTML inicial de cada rota
//   (index.html, termos.html, privacidade.html, 404.html);
// - no browser (syncHead.js): mantém o <head> coerente na navegação SPA.
// Sem imports nem APIs do browser: tem de correr também em Node (vite.config).

export const SITE_URL = "https://www.riacanalhairdesign.pt";
export const SITE_NAME = "Ria Canal Hair Design";
export const OG_IMAGE = { url: `${SITE_URL}/og.jpg`, width: 1200, height: 630 };

/**
 * Política de URLs públicos: minúsculas, sem barra final (exceto "/"), sem
 * extensão .html. É a forma usada nos canonical, no sitemap e nos links.
 */
export const ROUTES_META = [
  {
    path: "/",
    document: "index.html",
    title: SITE_NAME,
    description:
      "Serviços de Cabeleireiro & Estética em Aveiro. Equipa, serviços e contacto.",
  },
  {
    path: "/termos",
    document: "termos.html",
    title: `Termos & Condições | ${SITE_NAME}`,
    description:
      "Termos e condições de utilização do site do Ria Canal Hair Design: caráter informativo, serviços, direitos de autor e limitação de responsabilidade.",
  },
  {
    path: "/privacidade",
    document: "privacidade.html",
    title: `Política de Privacidade | ${SITE_NAME}`,
    description:
      "Política de privacidade do site do Ria Canal Hair Design: o site não recolhe dados pessoais diretamente; informação sobre o Google Maps e os contactos.",
  },
];

/** Página de erro: servida pela Vercel com HTTP 404 (404.html); não indexável. */
export const NOT_FOUND_META = {
  path: null,
  document: "404.html",
  title: `Página não encontrada | ${SITE_NAME}`,
  description: "A página que procura não existe ou foi movida.",
  noindex: true,
};

export const canonicalUrl = (path) => `${SITE_URL}${path}`;

const meta = (keyAttr, keyValue, value) => ({
  tag: "meta",
  key: [keyAttr, keyValue],
  attr: "content",
  value,
});

/**
 * Tags geridas por rota, sempre pela mesma ordem. `value: null` significa
 * "esta tag não deve existir nesta rota" (ex.: canonical e og:url no 404).
 */
export function getHeadTags(route) {
  const url = route.noindex ? null : canonicalUrl(route.path);
  return [
    meta("name", "description", route.description),
    meta("name", "robots", route.noindex ? "noindex" : null),
    { tag: "link", key: ["rel", "canonical"], attr: "href", value: url },

    meta("property", "og:type", "website"),
    meta("property", "og:site_name", SITE_NAME),
    meta("property", "og:locale", "pt_PT"),
    meta("property", "og:title", route.title),
    meta("property", "og:description", route.description),
    meta("property", "og:url", url),
    meta("property", "og:image", OG_IMAGE.url),
    meta("property", "og:image:width", String(OG_IMAGE.width)),
    meta("property", "og:image:height", String(OG_IMAGE.height)),

    meta("name", "twitter:card", "summary_large_image"),
    meta("name", "twitter:title", route.title),
    meta("name", "twitter:description", route.description),
    meta("name", "twitter:image", OG_IMAGE.url),
  ];
}
