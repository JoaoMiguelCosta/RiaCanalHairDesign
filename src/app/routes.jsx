// src/app/routes/appRoutes.jsx
import { Routes, Route } from "react-router-dom";

import Home from "@pages/home/home.jsx";
import Terms from "@pages/terms/terms.jsx";
import Privacy from "@pages/privacy/privacy.jsx";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/termos" element={<Terms />} />
      <Route path="/privacidade" element={<Privacy />} />
      <Route path="*" element={<div>404 — Página não encontrada</div>} />
    </Routes>
  );
}
