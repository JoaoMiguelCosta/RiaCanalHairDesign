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

/**
 * Orientação após navegação SPA (WCAG 2.4.2 / 2.4.3):
 * - sincroniza title e metadados (description, robots, canonical, OG,
 *   Twitter) com a rota ativa. O HTML inicial de cada rota já os traz,
 *   gerados no build (scripts/routeDocuments.js); syncRouteHead só atualiza
 *   essas mesmas tags na navegação SPA, sem criar duplicados;
 * - em navegações internas (não no carregamento inicial), coloca o scroll no
 *   topo (PUSH/REPLACE; em POP o browser gere o histórico) e move o foco para
 *   o <main>, para que o teclado e os leitores de ecrã recomecem no conteúdo.
 * Vive dentro do <Suspense>: o efeito só corre quando a página lazy já está
 * montada, logo #main existe.
 */
function RouteAnnouncer() {
  const { pathname } = useLocation();
  const navigationType = useNavigationType();
  // Rota anterior: distingue o carregamento inicial (e a dupla execução de
  // efeitos do StrictMode) de uma navegação real.
  const prevPathRef = useRef(null);

  const meta = matchRoute(pathname)?.meta ?? NOT_FOUND_META;

  useEffect(() => {
    syncRouteHead(meta);

    const prevPath = prevPathRef.current;
    prevPathRef.current = pathname;
    if (prevPath === null || prevPath === pathname) return;

    if (navigationType !== "POP") {
      // html/body têm height:100% + overflow-x:hidden, pelo que o <body> é o
      // elemento com scroll; repõe ambos por segurança.
      [document.scrollingElement, document.body].forEach((el) =>
        el?.scrollTo?.({ top: 0, left: 0, behavior: "instant" })
      );
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
