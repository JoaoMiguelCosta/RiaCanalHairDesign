// src/widgets/header/parts/navMenu/navMenuDesktop.jsx
import { useCallback, useEffect, useRef, useState } from "react";
import styles from "./navMenuDesktop.module.css";
import Icon from "@shared/ui/icons/icons.jsx";
import SubMenu from "@widgets/header/parts/subMenu/subMenu.jsx";
import NavItems from "@content/navigation/navItemsDesktop.json"; // ⬅️ dados via alias

/**
 * Navegação principal (desktop) segundo o padrão "disclosure navigation"
 * (WAI-ARIA APG): os itens com submenu são <button aria-expanded aria-controls>
 * e os destinos são links normais. Não usa role="menu"/"menubar".
 * - Rato: o submenu continua a abrir por :hover (CSS).
 * - Teclado: Tab chega a todos os itens; Enter/Espaço abre/fecha; Escape fecha
 *   e devolve o foco ao botão; sair do item com Tab fecha o submenu.
 */
const NavMenuDesktop = () => {
  // A11y: identificar o item ativo por hash atual (não altera UI)
  const currentHash = typeof window !== "undefined" ? window.location.hash : "";

  const [openIndex, setOpenIndex] = useState(null);
  const navRef = useRef(null);
  const buttonRefs = useRef([]);

  const close = useCallback(() => setOpenIndex(null), []);

  // Clique fora do menu fecha o submenu aberto
  useEffect(() => {
    if (openIndex === null) return;
    const onPointerDown = (e) => {
      if (!navRef.current?.contains(e.target)) close();
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [openIndex, close]);

  const handleKeyDown = (e, index) => {
    if (e.key === "Escape" && openIndex === index) {
      e.stopPropagation();
      close();
      buttonRefs.current[index]?.focus();
    }
  };

  // Focar fora do item (Tab/Shift+Tab) fecha o respetivo submenu
  const handleBlur = (e, index) => {
    if (openIndex !== index) return;
    if (!e.currentTarget.contains(e.relatedTarget)) close();
  };

  return (
    // .nav fica display:none em ≤1024px: sem landmark vazio nem duplicado
    // com o menu mobile (sai também da árvore de acessibilidade)
    <nav aria-label="Navegação principal" ref={navRef} className={styles.nav}>
      <ul className={styles.menu}>
        {NavItems.map((item, index) => {
          const { label, href, hasDropdown } = item;
          const isOpen = openIndex === index;
          const submenuId = `submenu-desktop-${index}`;

          const commonContent = (
            <>
              {label}
              {hasDropdown && (
                <Icon
                  name="chevronDown"
                  className={styles.arrowIcon}
                  aria-hidden="true"
                  focusable="false"
                />
              )}
            </>
          );

          const wrapperClass = [
            styles.menuItemWrapper,
            hasDropdown && styles.hasDropdown,
            isOpen && styles.open,
          ]
            .filter(Boolean)
            .join(" ");

          return (
            <li
              key={index}
              className={wrapperClass}
              onKeyDown={hasDropdown ? (e) => handleKeyDown(e, index) : undefined}
              onBlur={hasDropdown ? (e) => handleBlur(e, index) : undefined}
              // Evita dois submenus visíveis (um aberto por clique, outro por hover)
              onMouseEnter={
                openIndex !== null && openIndex !== index ? close : undefined
              }
            >
              {href ? (
                <a
                  href={href}
                  className={`${styles.menuItem} ${styles.clickable}`}
                  // Marca o link ativo quando o hash coincide (ex.: #Works)
                  aria-current={href === currentHash ? "true" : undefined}
                >
                  {commonContent}
                </a>
              ) : (
                <button
                  type="button"
                  ref={(el) => (buttonRefs.current[index] = el)}
                  className={`${styles.menuItem} ${styles.menuButton}`}
                  aria-expanded={isOpen}
                  aria-controls={hasDropdown ? submenuId : undefined}
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                >
                  {commonContent}
                </button>
              )}

              {hasDropdown && (
                <SubMenu label={label} id={submenuId} onNavigate={close} />
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
};

export default NavMenuDesktop;
