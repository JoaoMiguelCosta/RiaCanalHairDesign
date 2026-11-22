// src/app/routes.jsx
import {
  Routes,
  Route,
  matchRoutes,
  useLocation,
  useNavigationType,
} from "react-router-dom";
import { Suspense, lazy, useEffect, useRef } from "react";
import PageLoader from "@shared/ui/pageLoader/pageLoader.jsx";
import SkipLink from "@shared/ui/skipLink/skipLink.jsx";
import { NOT_FOUND_META, ROUTES_META } from "./seo/routeMeta.js";
import { syncRouteHead } from "./seo/syncHead.js";

const Home = lazy(() => import("@pages/home/home.jsx"));
const Terms = lazy(() => import("@pages/terms/terms.jsx"));
const Privacy = lazy(() => import("@pages/privacy/privacy.jsx"));
const NotFound = lazy(() => import("@pages/notFound/notFound.jsx"));

const ELEMENTS = { "/": <Home />, "/termos": <Terms />, "/privacidade": <Privacy /> };

// caseSensitive: os URLs públicos são em minúsculas e os ficheiros estáticos
// (termos.html, …) só existem nessa forma, pelo que /Termos cai no 404.html
// (a confirmar em Preview Deploy); o router segue a mesma regra para que o
// conteúdo apresentado coincida com o código HTTP.
const routes = [
  ...ROUTES_META.map((meta) => ({
    path: meta.path,
    caseSensitive: true,
    element: ELEMENTS[meta.path],
    meta,
  })),
  { path: "*", element: <NotFound />, meta: NOT_FOUND_META },
];

// Rota efetiva com as mesmas regras do <Routes>; caminhos sem rota própria
// caem no fallback "*"
const matchRoute = (pathname) => matchRoutes(routes, pathname)?.[0]?.route;

// Elemento indicado pelo fragmento do URL (#id), ou null
function hashTarget(hash) {
  if (!hash || hash === "#") return null;
  let id = hash.slice(1);
  try {
    id = decodeURIComponent(id);
  } catch {
    // fragmento mal codificado: usa-o tal como está
  }
  return document.getElementById(id);
}

// Posição de scroll do documento (o <body> só faz scroll em browsers sem
// overflow:clip; ver global.css)
const scrollPos = () =>
  Math.max(document.scrollingElement?.scrollTop ?? 0, document.body.scrollTop);

/**
 * Alinha o alvo do fragmento abaixo do header sticky (scroll-padding-top =
 * --header-offset), sem animação: é o destino de um carregamento ou de uma
 * mudança de página, não um movimento dentro dela. Se as fontes web ainda
 * estiverem a carregar (display=swap), a troca pode deslocar o alvo: realinha
 * uma única vez quando ficam prontas, e só se o utilizador não tiver feito
 * scroll entretanto. Sem timers nem polling.
 */
/**
 * Carregamento inicial com fragmento. Num documento novo, alinha o alvo se o
 * browser não o fez (documento ainda no topo). Em refresh ou Back/Forward
 * entre documentos, o browser repõe a posição anterior do utilizador (que
 * pode não ser a da secção): não se sobrepõe a isso; só alinha no evento load
 * se a posição não tiver sido reposta.
 */
function resolveInitialHash(target) {
  const navType = performance.getEntriesByType?.("navigation")?.[0]?.type;
  const browserRestores =
    (navType === "reload" || navType === "back_forward") &&
    history.scrollRestoration === "auto";
  const alignIfAtTop = () => {
    if (target.isConnected && scrollPos() === 0) alignToTarget(target);
  };
  if (!browserRestores || document.readyState === "complete") alignIfAtTop();
  else window.addEventListener("load", alignIfAtTop, { once: true });
}

function alignToTarget(target) {
  target.scrollIntoView?.({ block: "start", behavior: "instant" });
  const fonts = document.fonts;
  if (!fonts || fonts.status === "loaded") return;
  const pos = scrollPos();
  fonts.ready.then(() => {
    if (target.isConnected && scrollPos() === pos) {
      target.scrollIntoView?.({ block: "start", behavior: "instant" });
    }
  });
}

/**
 * Orientação após navegação SPA (WCAG 2.4.2 / 2.4.3):
 * - sincroniza title e metadados (description, robots, canonical, OG,
 *   Twitter) com a rota ativa. O HTML inicial de cada rota já os traz,
 *   gerados no build (scripts/routeDocuments.js); syncRouteHead só atualiza
 *   essas mesmas tags na navegação SPA, sem criar duplicados;
 * - em navegações internas (não no carregamento inicial), coloca o scroll no
 *   topo (PUSH/REPLACE; em POP o browser gere o histórico) e move o foco para
 *   o <main>, para que o teclado e os leitores de ecrã recomecem no conteúdo;
 * - fragmentos (#Location, #AboutUs, …): é o único ponto que resolve o
 *   fragmento quando a página muda ou acaba de carregar. O browser tenta
 *   resolvê-lo antes de a página lazy existir e falha; aqui:
 *   · carregamento inicial (abrir/refresh de /#X): alinha o alvo, mas só se o
 *     documento ainda estiver no topo — se o browser já posicionou (fragmento
 *     resolvido ou posição reposta no refresh), não mexe (resolveInitialHash);
 *   · mudança de rota para /#X (PUSH/REPLACE, ex.: <Link to="/#Location">):
 *     alinha o alvo em vez de ir para o topo;
 *   · Back/Forward entre rotas (POP): o browser repõe a posição guardada no
 *     histórico (possível desde que o documento é o scroll container); um
 *     alinhamento aqui só acrescentaria um salto intermédio;
 *   · na mesma rota (links #X na página, Back/Forward entre fragmentos) não
 *     faz nada: o browser trata do scroll e da reposição da posição;
 *   · fragmento sem elemento correspondente: comportamento normal.
 * Vive dentro do <Suspense>: o efeito só corre quando a página lazy já está
 * montada (commit), logo #main e as secções-alvo já existem — não é preciso
 * esperar por elas com timers nem observers.
 */
function RouteAnnouncer() {
  const { pathname, hash } = useLocation();
  // Fragmento atual numa ref: lido pelo efeito, mas só a mudança de rota
  // (pathname) o dispara — fragmentos na mesma página são do browser.
  const hashRef = useRef(hash);
  hashRef.current = hash;
  const navigationType = useNavigationType();
  // Rota anterior: distingue o carregamento inicial (e a dupla execução de
  // efeitos do StrictMode) de uma navegação real.
  const prevPathRef = useRef(null);

  const meta = matchRoute(pathname)?.meta ?? NOT_FOUND_META;

  useEffect(() => {
    syncRouteHead(meta);

    const prevPath = prevPathRef.current;
    prevPathRef.current = pathname;
    if (prevPath === pathname) return;

    const target = hashTarget(hashRef.current);

    if (prevPath === null) {
      if (target) resolveInitialHash(target);
      return;
    }

    // Em POP (Back/Forward) o browser repõe a posição guardada no histórico
    if (navigationType !== "POP") {
      if (target) {
        alignToTarget(target);
      } else {
        // o documento é o scroll container; o <body> só o é em browsers sem
        // overflow:clip (global.css): repõe ambos.
        [document.scrollingElement, document.body].forEach((el) =>
          el?.scrollTo?.({ top: 0, left: 0, behavior: "instant" })
        );
      }
    }
    document.getElementById("main")?.focus({ preventScroll: true });
  }, [pathname, navigationType, meta]);

  return null;
}

export default function AppRoutes() {
  return (
    <>
      <SkipLink />
      <Suspense fallback={<PageLoader /* fullscreen por defeito */ />}>
        <RouteAnnouncer />
        <Routes>
          {routes.map(({ path, caseSensitive, element }) => (
            <Route
              key={path}
              path={path}
              caseSensitive={caseSensitive}
              element={element}
            />
          ))}
        </Routes>
      </Suspense>
    </>
  );
}
