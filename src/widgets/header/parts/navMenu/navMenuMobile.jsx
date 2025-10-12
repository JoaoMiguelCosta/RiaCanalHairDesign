// src/widgets/header/parts/navMenuMobile/navMenuMobile.jsx
import styles from "./navMenuMobile.module.css";
import Icon from "@shared/ui/icons/icons.jsx";
import Button from "@shared/ui/button/button.jsx";
import NavItemsMobile from "@content/navigation/navItemsMobile.json";
import SocialLinks from "@content/navigation/socialLinks.json";
import { useMobileMenu } from "@widgets/header/hook/useMobileMenu";

// label acessível a partir da chave do ícone
const toLabel = (key) => key.charAt(0).toUpperCase() + key.slice(1);

const NavMenuMobile = () => {
  const { menuOpen, toggleMenu, handleClose } = useMobileMenu();

  // A11y: identificar item ativo por hash atual (não altera UI)
  const currentHash = typeof window !== "undefined" ? window.location.hash : "";

  return (
    <div className={styles.mobileContainer}>
      <div className={styles.topIcons}>
        {Object.entries(SocialLinks).map(([platform, href]) => (
          <a
            key={platform}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={toLabel(platform)}
          >
            <Icon
              name={platform}
              className={styles.icon}
              aria-hidden="true"
              focusable="false"
            />
          </a>
        ))}

        <Button
          onClick={toggleMenu}
          button={styles.menuButton}
          aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}
        >
          <Icon
            name={menuOpen ? "close" : "menu"}
            className={styles.icon}
            aria-hidden="true"
            focusable="false"
          />
        </Button>
      </div>

      {menuOpen && (
        <div
          className={styles.menuOverlay}
          role="dialog"
          aria-modal="true"
          aria-label="Menu de navegação"
          onKeyDown={(e) => {
            if (e.key === "Escape") handleClose();
          }}
        >
          <ul className={styles.menuList}>
            {NavItemsMobile.map((item) => (
              <li key={item.label}>
                <a
                  href={item.href}
                  className={styles.menuItem}
                  onClick={handleClose}
                  // A11y: marca link ativo quando hash coincide
                  aria-current={item.href === currentHash ? "true" : undefined}
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default NavMenuMobile;
