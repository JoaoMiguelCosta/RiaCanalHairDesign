// src/widgets/header/parts/navMenuMobile/navMenuMobile.jsx
import { useState, useEffect } from "react";
import styles from "./navMenuMobile.module.css";
import Icon from "@shared/ui/icons/icons.jsx";
import Button from "@shared/ui/button/button.jsx";
import NavItemsMobile from "@content/navigation/navItemsMobile.json";

const NavMenuMobile = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const handleClose = () => setMenuOpen(false);

  // Fecha o menu quando passa de 1024px (64rem)
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 1024 && menuOpen) setMenuOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [menuOpen]);

  // 🚫 Bloqueia o scroll da página enquanto o overlay estiver aberto
  useEffect(() => {
    if (!menuOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev || "";
    };
  }, [menuOpen]);

  return (
    <div className={styles.mobileContainer}>
      <div className={styles.topIcons}>
        {["instagram", "facebook", "whatsapp"].map((platform) => (
          <a
            key={platform}
            href={
              platform === "whatsapp"
                ? "https://wa.me/351912345678"
                : `https://www.${platform}.com`
            }
            target="_blank"
            rel="noopener noreferrer"
            aria-label={platform.charAt(0).toUpperCase() + platform.slice(1)}
          >
            <Icon name={platform} className={styles.icon} />
          </a>
        ))}

        <Button
          onClick={() => setMenuOpen(!menuOpen)}
          button={styles.menuButton}
          aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}
        >
          <Icon name={menuOpen ? "close" : "menu"} className={styles.icon} />
        </Button>
      </div>

      {menuOpen && (
        <div className={styles.menuOverlay} role="dialog" aria-modal="true">
          <ul className={styles.menuList}>
            {NavItemsMobile.map((item) => (
              <li key={item.label}>
                <a
                  href={item.href}
                  className={styles.menuItem}
                  onClick={handleClose}
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
