// src/widgets/header/parts/navMenuDesktop/navMenuDesktop.jsx
import styles from "./navMenuDesktop.module.css";
import Icon from "@shared/ui/icons/icons.jsx";
import SubMenu from "@widgets/header/parts/subMenu/subMenu.jsx";
import NavItems from "@content/navigation/navItemsDesktop.json"; // ⬅️ dados via alias

const NavMenuDesktop = () => {
  // A11y: identificar o item ativo por hash atual (não altera UI)
  const currentHash = typeof window !== "undefined" ? window.location.hash : "";

  return (
    <nav aria-label="Navegação principal">
      <ul className={styles.menu}>
        {NavItems.map((item, index) => {
          const { label, href, hasDropdown } = item;

          const commonContent = (
            <>
              {label}
              {hasDropdown && (
                <Icon name="chevronDown" className={styles.arrowIcon} />
              )}
            </>
          );

          const wrapperClass = `${styles.menuItemWrapper} ${
            hasDropdown ? styles.hasDropdown : ""
          }`;

          return (
            <li key={index} className={wrapperClass}>
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
                <span className={styles.menuItem} aria-disabled="true">
                  {commonContent}
                </span>
              )}

              {hasDropdown && <SubMenu label={label} />}
            </li>
          );
        })}
      </ul>
    </nav>
  );
};

export default NavMenuDesktop;
