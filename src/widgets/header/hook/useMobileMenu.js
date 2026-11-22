// src/widgets/header/hook/useMobileMenu.js
import { useState, useEffect, useCallback, useRef } from "react";

const DESKTOP_MIN = 1024; // > 64rem: menu desktop assume

/**
 * Controla o menu mobile (padrão "disclosure navigation", não modal):
 * - abre/fecha; fecha com Escape, ao escolher um link e ao passar a desktop;
 * - ao abrir, move o foco para o primeiro link; ao fechar por Escape/botão,
 *   o foco fica (ou volta) no botão de abertura;
 * - enquanto aberto, o overlay cobre a página: o conteúdo coberto (irmãos do
 *   <header>) fica `inert`, para que o foco do teclado e a leitura não saiam
 *   para conteúdo invisível; o header (marca, redes sociais, botão) mantém-se
 *   utilizável;
 * - bloqueia o scroll do body enquanto aberto.
 */
export function useMobileMenu() {
  const [menuOpen, setMenuOpen] = useState(false);
  const buttonRef = useRef(null);
  const menuRef = useRef(null);

  const toggleMenu = useCallback(() => setMenuOpen((o) => !o), []);

  const handleClose = useCallback(() => setMenuOpen(false), []);

  // Escape fecha e devolve o foco ao botão (funciona com o foco em qualquer
  // ponto, inclusive no próprio botão)
  useEffect(() => {
    if (!menuOpen) return;
    const onKeyDown = (e) => {
      if (e.key !== "Escape") return;
      setMenuOpen(false);
      buttonRef.current?.focus();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [menuOpen]);

  // Foco inicial no primeiro link ao abrir (a abertura só ocorre pelo botão)
  useEffect(() => {
    if (!menuOpen) return;
    menuRef.current?.querySelector("a[href]")?.focus();
  }, [menuOpen]);

  // Fecha o menu quando passa de 1024px (64rem). Se o foco estava no menu ou
  // no botão (ambos ficam ocultos em desktop), passa para o <main>.
  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth <= DESKTOP_MIN) return;
      const active = document.activeElement;
      const focusWasInMenu =
        menuRef.current?.contains(active) || buttonRef.current === active;
      setMenuOpen(false);
      if (focusWasInMenu) {
        // após o commit (o inert do <main> já foi removido)
        requestAnimationFrame(() =>
          document.getElementById("main")?.focus({ preventScroll: true })
        );
      }
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Conteúdo coberto pelo overlay fica inerte enquanto o menu está aberto
  useEffect(() => {
    if (!menuOpen) return;
    const header = buttonRef.current?.closest("header");
    const parent = header?.parentElement;
    if (!parent) return;
    const covered = [...parent.children].filter(
      (el) => el !== header && !el.inert
    );
    covered.forEach((el) => (el.inert = true));
    return () => covered.forEach((el) => (el.inert = false));
  }, [menuOpen]);

  // Bloqueia o scroll enquanto o overlay está aberto
  useEffect(() => {
    if (!menuOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev || "";
    };
  }, [menuOpen]);

  return { menuOpen, toggleMenu, handleClose, buttonRef, menuRef };
}
