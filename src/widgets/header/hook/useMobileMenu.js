// src/widgets/header/hook/useMobileMenu.js
import { useState, useEffect, useCallback } from "react";

/** Controla o menu mobile: abre/fecha, fecha ao >1024px e bloqueia scroll quando aberto. */
export function useMobileMenu() {
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = useCallback(() => setMenuOpen((o) => !o), []);
  const handleClose = useCallback(() => setMenuOpen(false), []);

  // Fecha o menu quando passa de 1024px (64rem)
  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth > 1024) setMenuOpen(false);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Bloqueia o scroll enquanto o overlay está aberto
  useEffect(() => {
    if (!menuOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev || "";
    };
  }, [menuOpen]);

  return { menuOpen, toggleMenu, handleClose };
}
