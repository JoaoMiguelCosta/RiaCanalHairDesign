// src/widgets/header/ui/header.jsx
import { memo, useLayoutEffect, useRef } from "react";
import styles from "./header.module.css";

import SignatureMark from "@shared/ui/signatureMark/signatureMark.jsx";
import SocialIcons from "@widgets/header/parts/socialIcons/socialIcons.jsx";
import NavMenuDesktop from "@widgets/header/parts/navMenu/navMenuDesktop.jsx";
import NavMenuMobile from "@widgets/header/parts/navMenu/navMenuMobile.jsx";
import {
  HEADER_LAYOUT_EVENT,
  MOBILE_QUERY,
  headerControlsOverflow,
} from "@widgets/header/hook/headerLayout.js";

// Altura real do header sticky em --header-offset (usada pelo
// scroll-padding-top): as âncoras e o scrollIntoView param abaixo do header
// em qualquer largura. Só escreve quando a altura muda.
function useHeaderOffset(ref) {
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const root = document.documentElement;
    let last = -1;
    const update = () => {
      const h = Math.ceil(el.getBoundingClientRect().height);
      if (h === last) return;
      last = h;
      root.style.setProperty("--header-offset", `${h}px`);
    };
    update();
    if (typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => {
      ro.disconnect();
      root.style.removeProperty("--header-offset");
    };
  }, [ref]);
}

/**
 * Modo compacto: o layout mobile também quando o desktop não cabe no ecrã.
 * O breakpoint (64rem) acompanha a preferência de tamanho de letra do
 * browser, mas não os modos que só aumentam o texto (tamanho mínimo de letra,
 * zoom só de texto): aí o texto cresce, o breakpoint não, e os últimos
 * controlos saíam do ecrã (Fase 10). Mede-se o próprio layout desktop: com a
 * letra por omissão cabe sempre acima de 1024px, pelo que nada muda.
 * A avaliação retira o atributo, lê o layout e repõe-no no mesmo passo
 * síncrono (sem paint entre os dois: sem oscilação visível) e repete-se em
 * mudanças de tamanho, de breakpoint e de fontes.
 */
function useHeaderCompact(ref) {
  useLayoutEffect(() => {
    const header = ref.current;
    if (!header) return;
    const mq = window.matchMedia?.(MOBILE_QUERY);
    let frame = 0;

    const evaluate = () => {
      frame = 0;
      const was = header.hasAttribute("data-compact");
      header.removeAttribute("data-compact");
      // abaixo do breakpoint o CSS já usa o layout mobile
      const compact = !mq?.matches && headerControlsOverflow(header);
      if (compact) header.setAttribute("data-compact", "");
      if (compact !== was) window.dispatchEvent(new Event(HEADER_LAYOUT_EVENT));
    };
    // fora do callback do ResizeObserver (alterar o layout lá dentro gera
    // "ResizeObserver loop"); o rAF corre antes do paint seguinte
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(evaluate);
    };

    evaluate();
    const ro = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(schedule);
    ro?.observe(header);
    window.addEventListener("resize", schedule);
    mq?.addEventListener?.("change", schedule);
    document.fonts?.addEventListener?.("loadingdone", schedule);
    return () => {
      cancelAnimationFrame(frame);
      ro?.disconnect();
      window.removeEventListener("resize", schedule);
      mq?.removeEventListener?.("change", schedule);
      document.fonts?.removeEventListener?.("loadingdone", schedule);
      header.removeAttribute("data-compact");
    };
  }, [ref]);
}

// <header> fora de <main>: landmark "banner"
const Header = () => {
  const ref = useRef(null);
  useHeaderOffset(ref);
  useHeaderCompact(ref);

  return (
    <header ref={ref} className={styles.header}>
      <div className={styles.headerContent}>
        <SignatureMark />
        <NavMenuDesktop />
        <div className={styles.mobileRight}>
          <SocialIcons />
          <NavMenuMobile />
        </div>
      </div>
    </header>
  );
};

export default memo(Header);
