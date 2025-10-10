// src/app/appRoutes.jsx
import { Routes, Route } from "react-router-dom";
import { Suspense, lazy } from "react";
import PageLoader from "@shared/ui/pageLoader/pageLoader.jsx";

const Home = lazy(() => import("@pages/home/home.jsx"));
const Terms = lazy(() => import("@pages/terms/terms.jsx"));
const Privacy = lazy(() => import("@pages/privacy/privacy.jsx"));

const routes = [
  { path: "/", element: <Home /> },
  { path: "/termos", element: <Terms /> },
  { path: "/privacidade", element: <Privacy /> },
  { path: "*", element: <div>404 — Página não encontrada</div> },
];

export default function AppRoutes() {
  return (
    <Suspense fallback={<PageLoader /* fullscreen por defeito */ />}>
      <Routes>
        {routes.map(({ path, element }) => (
          <Route key={path} path={path} element={element} />
        ))}
      </Routes>
    </Suspense>
  );
}
