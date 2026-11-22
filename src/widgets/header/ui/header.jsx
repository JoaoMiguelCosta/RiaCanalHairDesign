// src/widgets/header/ui/header.jsx
import { memo, useLayoutEffect, useRef } from "react";
import styles from "./header.module.css";

import SignatureMark from "@shared/ui/signatureMark/signatureMark.jsx";
import SocialIcons from "@widgets/header/parts/socialIcons/socialIcons.jsx";
import NavMenuDesktop from "@widgets/header/parts/navMenu/navMenuDesktop.jsx";
import NavMenuMobile from "@widgets/header/parts/navMenu/navMenuMobile.jsx";

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

// <header> fora de <main>: landmark "banner"
const Header = () => {
  const ref = useRef(null);
  useHeaderOffset(ref);

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
