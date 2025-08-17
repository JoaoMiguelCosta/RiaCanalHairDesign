import { useState, useEffect } from "react";
import styles from "./NavMenuMobile.module.css";
import Icon from "../../../components/Icons/Icons.jsx";
import Button from "../../../components/Button/Button";

const navItems = [
  { label: "INÍCIO", href: "#Start" },
  { label: "SOBRE NÓS", href: "#AboutUs" },
  { label: "PORTFÓLIO", href: "#Works" },
  { label: "ESPAÇO", href: "#Space" },
  { label: "CLIENTES", href: "#Testimonials" },
  { label: "INSTAGRAM", href: "#Instagram" },
  { label: "CONTACTOS", href: "#Location" },
];

const NavMenuMobile = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const handleClose = () => setMenuOpen(false);

  // Fecha o menu se deixar de ser mobile
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 376 && menuOpen) setMenuOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
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
        <div className={styles.menuOverlay}>
          <ul className={styles.menuList}>
            {navItems.map((item) => (
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
