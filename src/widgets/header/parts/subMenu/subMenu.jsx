// src/widgets/header/parts/subMenu/subMenu.jsx
import styles from "./subMenu.module.css";
import submenuData from "@content/navigation/submenu.json";

const SubMenu = ({ label }) => {
  const items = submenuData[label];
  if (!items) return null;

  // A11y: marca link ativo via hash atual (não altera UI)
  const currentHash = typeof window !== "undefined" ? window.location.hash : "";

  return (
    <ul className={styles.submenu} aria-label={`Submenu de ${label}`}>
      {items.map(({ text, href }) => (
        <li key={text} className={styles.submenuItem}>
          <a
            href={href}
            className={styles.submenuLink}
            aria-current={href === currentHash ? "true" : undefined}
          >
            {text}
          </a>
        </li>
      ))}
    </ul>
  );
};

export default SubMenu;
