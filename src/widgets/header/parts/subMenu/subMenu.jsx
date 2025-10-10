// src/widgets/header/parts/subMenu/subMenu.jsx
import styles from "./subMenu.module.css";
import submenuData from "@content/navigation/submenu.json";

const SubMenu = ({ label }) => {
  const items = submenuData[label];
  if (!items) return null;

  return (
    <ul className={styles.submenu}>
      {items.map(({ text, href }) => (
        <li key={text} className={styles.submenuItem}>
          <a href={href} className={styles.submenuLink}>
            {text}
          </a>
        </li>
      ))}
    </ul>
  );
};

export default SubMenu;
