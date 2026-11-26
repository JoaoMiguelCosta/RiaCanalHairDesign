import styles from "./navMenuMobile.module.css";
import Icon from "@shared/ui/icons/icons.jsx";
import Button from "@shared/ui/button/button.jsx";
import NavItemsMobile from "@content/navigation/navItemsMobile.json";
import SocialLinks from "@content/social/socialLinks.json";
import { useMobileMenu } from "@widgets/header/hook/useMobileMenu";

const MENU_ID = "mobile-menu";

const NavMenuMobile = () => {
  const { menuOpen, toggleMenu, handleClose, buttonRef, menuRef } =
    useMobileMenu();
  const currentHash = typeof window !== "undefined" ? window.location.hash : "";

  return (
    <div className={styles.mobileContainer}>
      <div className={styles.topIcons}>
        {Array.isArray(SocialLinks) &&
          SocialLinks.map((item) => (
            <a
              key={item.name}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={item.label}
            >
              <Icon
                name={item.name}
                className={styles.icon}
                aria-hidden="true"
                focusable="false"
              />
            </a>
          ))}

        {/* Disclosure: nome constante + estado em aria-expanded */}
        <Button
          ref={buttonRef}
          onClick={toggleMenu}
          className={styles.menuButton}
          aria-label="Menu de navegação"
          aria-expanded={menuOpen}
          aria-controls={MENU_ID}
        >
          <Icon
            name={menuOpen ? "close" : "menu"}
            className={styles.icon}
            aria-hidden="true"
            focusable="false"
          />
        </Button>
      </div>

      {/* Sempre no DOM (aria-controls válido); `hidden` retira-o da ordem de
          foco e da árvore de acessibilidade quando fechado. */}
      <nav
        id={MENU_ID}
        ref={menuRef}
        className={styles.menuOverlay}
        aria-label="Navegação principal"
        hidden={!menuOpen}
      >
        <ul className={styles.menuList}>
          {NavItemsMobile.map((item) => (
            <li key={item.label}>
              <a
                href={item.href}
                className={styles.menuItem}
                onClick={handleClose}
                aria-current={item.href === currentHash ? "true" : undefined}
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
};

export default NavMenuMobile;
