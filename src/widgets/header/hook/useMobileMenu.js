// src/widgets/header/hook/useMobileMenu.js
import { useState, useEffect, useCallback, useRef } from "react";
import { HEADER_LAYOUT_EVENT, isMobileHeaderLayout } from "./headerLayout.js";

/**
 * Controla o menu mobile (padrão "disclosure navigation", não modal):
 * - abre/fecha; fecha com Escape, ao escolher um link e ao passar a desktop;
 * - ao abrir, move o foco para o primeiro link; ao fechar por Escape/botão,
 *   o foco fica (ou volta) no botão de abertura;
 * - enquanto aberto, o overlay cobre a página: o conteúdo coberto (irmãos do
 *   <header>) fica `inert`, para que o foco do teclado e a leitura não saiam
 *   para conteúdo invisível; o header (marca, redes sociais, botão) mantém-se
 *   utilizável;
 * - bloqueia o scroll da página (<html>) enquanto aberto.
 */
export function useMobileMenu() {
  const [menuOpen, setMenuOpen] = useState(false);
  const buttonRef = useRef(null);
  const menuRef = useRef(null);
  // Estado atual para o listener de resize (registado uma vez)
  const menuOpenRef = useRef(menuOpen);
  menuOpenRef.current = menuOpen;
  // Mover o foco para o <main> quando o inert for retirado (ver abaixo)
  const focusMainAfterClose = useRef(false);

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

  // Fecha o menu quando o header passa ao layout desktop: acima do breakpoint
  // (64rem, que acompanha a letra do browser — um limite fixo em px fechava
  // o menu ainda em layout mobile) e fora do modo compacto (useHeaderCompact,
  // que avisa com HEADER_LAYOUT_EVENT). Se o foco estava no menu ou no botão
  // (ambos ficam ocultos em desktop), passa para o <main>.
  useEffect(() => {
    const onResize = () => {
      if (isMobileHeaderLayout(buttonRef.current)) return;
      const active = document.activeElement;
      const focusWasInMenu =
        menuRef.current?.contains(active) || buttonRef.current === active;
      if (!focusWasInMenu) {
        setMenuOpen(false);
        return;
      }
      if (menuOpenRef.current) {
        // Menu aberto: o <main> está inert até o efeito abaixo o libertar, e
        // um elemento inerte não recebe foco. O foco passa na limpeza desse
        // efeito, logo a seguir ao inert sair (antes: num rAF, que sob carga
        // podia correr antes do efeito — Fase 10).
        focusMainAfterClose.current = true;
        setMenuOpen(false);
      } else {
        // Menu fechado (foco no botão, que fica oculto): nada está inerte
        requestAnimationFrame(() =>
          document.getElementById("main")?.focus({ preventScroll: true })
        );
      }
    };
    window.addEventListener("resize", onResize);
    window.addEventListener(HEADER_LAYOUT_EVENT, onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener(HEADER_LAYOUT_EVENT, onResize);
    };
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
    return () => {
      covered.forEach((el) => (el.inert = false));
      if (focusMainAfterClose.current) {
        focusMainAfterClose.current = false;
        document.getElementById("main")?.focus({ preventScroll: true });
      }
    };
  }, [menuOpen]);

  // Bloqueia o scroll da página enquanto o overlay está aberto. O documento
  // (viewport) é o scroll container: o overflow do <html> passa para o
  // viewport e a posição atual mantém-se. (No <body>, overflow:hidden não
  // bloquearia o viewport.)
  useEffect(() => {
    if (!menuOpen) return;
    const root = document.documentElement;
    const prev = root.style.overflow;
    root.style.overflow = "hidden";
    return () => {
      root.style.overflow = prev || "";
    };
  }, [menuOpen]);

  return { menuOpen, toggleMenu, handleClose, buttonRef, menuRef };
}
