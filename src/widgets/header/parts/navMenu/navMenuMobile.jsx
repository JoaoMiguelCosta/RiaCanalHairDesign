import styles from "./navMenuMobile.module.css";
import Icon from "@shared/ui/icons/icons.jsx";
import Button from "@shared/ui/button/button.jsx";
import NavItemsMobile from "@content/navigation/navItemsMobile.json";
import SocialLinks from "@content/social/socialLinks.json";
import { useMobileMenu } from "@widgets/header/hook/useMobileMenu";

const NavMenuMobile = () => {
  const { menuOpen, toggleMenu, handleClose } = useMobileMenu();
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

        <Button
          onClick={toggleMenu}
          button={styles.menuButton} // mantém se o teu Button usa esta prop
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
          onKeyDown={(e) => e.key === "Escape" && handleClose()}
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
        </div>
      )}
    </div>
  );
};

export default NavMenuMobile;
