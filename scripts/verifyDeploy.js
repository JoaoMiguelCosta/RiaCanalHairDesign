#!/usr/bin/env node
// scripts/verifyDeploy.js
// Verificação HTTP de um deployment (Preview Deploy, produção ou o
// `vite preview` local): códigos de estado, redirects, tipos MIME,
// metadados no HTML inicial, cache e cabeçalhos de segurança.
// Só faz pedidos GET de leitura; não altera nada. Sem dependências (Node 24).
//
// Uso:
//   node scripts/verifyDeploy.js <baseUrl> [--local] [--domain]
//
//   <baseUrl>  ex.: https://<preview>.vercel.app ou http://127.0.0.1:4173
//   --local    `vite preview`: não exige cabeçalhos da Vercel (cache,
//              segurança), que o servidor local não emite
//   --domain   verifica também apex → www e HTTP → HTTPS do domínio público
//
// Sai com código 1 se alguma verificação obrigatória falhar.

const SITE = "https://www.riacanalhairdesign.pt";
const APEX = "riacanalhairdesign.pt";
const NOT_FOUND_TITLE = "Página não encontrada | Ria Canal Hair Design";

const args = process.argv.slice(2);
const base = args.find((a) => !a.startsWith("--"))?.replace(/\/$/, "");
const LOCAL = args.includes("--local");
const DOMAIN = args.includes("--domain");
if (!base) {
  console.error("Uso: node scripts/verifyDeploy.js <baseUrl> [--local] [--domain]");
  process.exit(2);
}
const isProductionHost = new URL(base).host === new URL(SITE).host;

const results = [];
const record = (ok, name, detail = "", { warnOnly = false } = {}) =>
  results.push({ status: ok ? "OK" : warnOnly ? "AVISO" : "FALHA", name, detail });

const get = (path, init = {}) =>
  fetch(path.startsWith("http") ? path : base + path, {
    redirect: "manual",
    headers: { "User-Agent": "deploy-check/1.0" },
    ...init,
  });

const header = (res, name) => res.headers.get(name) ?? "";
const count = (html, re) => (html.match(re) ?? []).length;
const attr = (html, re) => html.match(re)?.[1];
const decode = (text) =>
  text
    ?.replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");

async function checkPage(path, { title, canonical, home = false }) {
  const res = await get(path);
  const html = await res.text();
  const name = `${path} → 200, HTML e metadados`;
  const problems = [];
  if (res.status !== 200) problems.push(`HTTP ${res.status}`);
  if (!/text\/html/.test(header(res, "content-type"))) problems.push(`content-type ${header(res, "content-type")}`);
  if (count(html, /<title>/g) !== 1) problems.push("<title> não único");
  const pageTitle = decode(attr(html, /<title>([^<]*)<\/title>/));
  if (pageTitle !== title) problems.push(`title "${pageTitle}"`);
  if (count(html, /rel="canonical"/g) !== 1) problems.push("canonical não único");
  if (attr(html, /<link rel="canonical" href="([^"]+)"/) !== canonical) problems.push("canonical incorreto");
  if (attr(html, /property="og:url" content="([^"]+)"/) !== canonical) problems.push("og:url incorreto");
  for (const tag of ['property="og:title"', 'property="og:image"', 'name="twitter:card"', 'name="description"']) {
    if (count(html, new RegExp(tag, "g")) !== 1) problems.push(`${tag} ausente/duplicado`);
  }
  if (/name="robots" content="[^"]*noindex/.test(html)) problems.push("noindex numa página indexável");
  const jsonLd = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((m) => m[1]);
  if (home) {
    try {
      const data = JSON.parse(jsonLd[0] ?? "");
      if (data["@type"] !== "HairSalon" || jsonLd.length !== 1) problems.push("JSON-LD HairSalon em falta");
    } catch {
      problems.push("JSON-LD inválido");
    }
  } else if (jsonLd.length) {
    problems.push("JSON-LD fora da Home");
  }
  const cache = header(res, "cache-control");
  if (/immutable/.test(cache)) problems.push(`HTML com cache imutável (${cache})`);
  record(!problems.length, name, problems.join("; "));
  return html;
}

async function checkRedirect(from, to) {
  const res = await get(from);
  const location = header(res, "location");
  const target = location ? new URL(location, base + from) : null;
  const expected = new URL(to, base);
  const ok = res.status === 308 && target?.pathname === expected.pathname && target?.search === expected.search;
  record(ok, `${from} → 308 ${to}`, ok ? "" : `HTTP ${res.status} location="${location}"`);
  if (ok) {
    const final = await get(to);
    record(final.status === 200, `${to} (destino) → 200`, `HTTP ${final.status}`);
  }
}

async function checkNotFound(path) {
  const res = await get(path);
  const html = await res.text();
  const problems = [];
  if (res.status !== 404) problems.push(`HTTP ${res.status}`);
  if (!html.includes(`<title>${NOT_FOUND_TITLE}</title>`)) problems.push("não é o 404.html");
  if (!/name="robots" content="noindex"/.test(html)) problems.push("sem noindex");
  if (html.includes('"@type":"HairSalon"')) problems.push("devolve o HTML da Home");
  record(!problems.length, `${path} → 404 (404.html, noindex)`, problems.join("; "));
}

async function checkFile(path, type, mustContain) {
  const res = await get(path);
  const body = await res.text();
  const problems = [];
  if (res.status !== 200) problems.push(`HTTP ${res.status}`);
  if (!type.test(header(res, "content-type"))) problems.push(`content-type ${header(res, "content-type")}`);
  if (/^\s*<!doctype html>/i.test(body)) problems.push("devolve HTML");
  if (mustContain && !body.includes(mustContain)) problems.push(`sem "${mustContain}"`);
  record(!problems.length, `${path} → 200 ${type.source}`, problems.join("; "));
}

async function checkAssets(homeHtml) {
  const js = attr(homeHtml, /<script type="module" crossorigin src="([^"]+)"/);
  const css = attr(homeHtml, /<link rel="stylesheet" crossorigin href="([^"]+)"/);
  for (const [path, type] of [
    [js, /javascript/],
    [css, /text\/css/],
  ]) {
    if (!path) {
      record(false, "asset de entrada referenciado no HTML", "não encontrado");
      continue;
    }
    const res = await get(path);
    const cache = header(res, "cache-control");
    const problems = [];
    if (res.status !== 200) problems.push(`HTTP ${res.status}`);
    if (!type.test(header(res, "content-type"))) problems.push(`content-type ${header(res, "content-type")}`);
    const immutable = /max-age=31536000/.test(cache) && /immutable/.test(cache);
    if (!LOCAL && !immutable) problems.push(`cache-control "${cache}"`);
    record(!problems.length, `${path} → 200 ${type.source}${LOCAL ? "" : ", cache imutável"}`, problems.join("; "));
  }
}

async function checkSecurityHeaders() {
  const res = await get("/");
  const expected = {
    "x-content-type-options": "nosniff",
    "referrer-policy": "strict-origin-when-cross-origin",
    "x-frame-options": "SAMEORIGIN",
    "content-security-policy": "frame-ancestors 'self'",
  };
  const missing = Object.entries(expected)
    .filter(([k, v]) => header(res, k).toLowerCase() !== v.toLowerCase())
    .map(([k]) => `${k}="${header(res, k)}"`);
  record(!missing.length, "cabeçalhos de segurança em /", missing.join("; "));
  const asset404 = await get("/assets/nao-existe.js");
  record(
    header(asset404, "x-content-type-options") === "nosniff",
    "nosniff também nas respostas 404",
    `x-content-type-options="${header(asset404, "x-content-type-options")}"`
  );
}

async function checkIndexingPolicy() {
  const res = await get("/");
  const robotsTag = header(res, "x-robots-tag");
  if (isProductionHost) {
    record(!/noindex/i.test(robotsTag), "produção indexável (sem X-Robots-Tag: noindex)", `x-robots-tag="${robotsTag}"`);
  } else {
    // A Vercel acrescenta "X-Robots-Tag: noindex" aos domínios de preview;
    // confirma-se aqui em vez de assumir.
    record(/noindex/i.test(robotsTag), "preview não indexável (X-Robots-Tag: noindex)", `x-robots-tag="${robotsTag}"`, {
      warnOnly: true,
    });
  }
}

/** Segue redirects manualmente: devolve os saltos (deteta ciclos). */
async function hops(url, max = 6) {
  const chain = [];
  let current = url;
  for (let i = 0; i < max; i++) {
    const res = await get(current);
    chain.push({ url: current, status: res.status });
    const location = header(res, "location");
    if (res.status < 300 || res.status >= 400 || !location) return chain;
    current = new URL(location, current).href;
    if (chain.some((h) => h.url === current)) {
      chain.push({ url: current, status: "CICLO" });
      return chain;
    }
  }
  chain.push({ url: current, status: "DEMASIADOS SALTOS" });
  return chain;
}

async function checkDomain() {
  for (const start of [`http://${APEX}/termos?ref=1`, `https://${APEX}/termos?ref=1`, `http://www.${APEX}/termos?ref=1`]) {
    const chain = await hops(start);
    const last = chain.at(-1);
    const redirects = chain.slice(0, -1);
    const describe = chain.map((h) => `${h.status} ${h.url}`).join(" → ");
    record(
      last.status === 200 && last.url === `${SITE}/termos?ref=1`,
      `${start} termina em ${SITE}/termos?ref=1 (query preservada, sem ciclos)`,
      describe
    );
    record(
      redirects.every((h) => h.status === 301 || h.status === 308),
      `${start}: redirects permanentes (301/308)`,
      describe,
      { warnOnly: true } // apex → www 307 → 308 depende do dashboard (autorização)
    );
  }
}

const main = async () => {
  console.log(`Base: ${base}${LOCAL ? " (local)" : ""}\n`);
  const homeHtml = await checkPage("/", { title: "Ria Canal Hair Design", canonical: `${SITE}/`, home: true });
  await checkPage("/termos", { title: "Termos & Condições | Ria Canal Hair Design", canonical: `${SITE}/termos` });
  await checkPage("/privacidade", {
    title: "Política de Privacidade | Ria Canal Hair Design",
    canonical: `${SITE}/privacidade`,
  });
  await checkRedirect("/termos/", "/termos");
  await checkRedirect("/termos/?ref=abc", "/termos?ref=abc");
  await checkRedirect("/termos.html", "/termos");
  await checkRedirect("/privacidade/", "/privacidade");
  await checkNotFound("/pagina-que-nao-existe");
  await checkNotFound("/Termos");
  await checkNotFound("/assets/nao-existe.js");
  await checkFile("/robots.txt", /text\/plain/, `Sitemap: ${SITE}/sitemap.xml`);
  await checkFile("/sitemap.xml", /xml/, "<urlset");
  await checkAssets(homeHtml);
  if (!LOCAL) {
    await checkSecurityHeaders();
    await checkIndexingPolicy();
  }
  if (DOMAIN) await checkDomain();

  const width = Math.max(...results.map((r) => r.name.length));
  for (const r of results) {
    console.log(`${r.status.padEnd(6)} ${r.name.padEnd(width)}  ${r.detail}`);
  }
  const failed = results.filter((r) => r.status === "FALHA").length;
  const warned = results.filter((r) => r.status === "AVISO").length;
  console.log(`\n${results.length - failed - warned} OK, ${warned} avisos, ${failed} falhas`);
  // exitCode (não process.exit): deixa fechar os sockets do fetch
  process.exitCode = failed ? 1 : 0;
};

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
