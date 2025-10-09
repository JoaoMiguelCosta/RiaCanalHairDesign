// src/widgets/header/parts/navMenuDesktop/navMenuDesktop.jsx
import styles from "./navMenuDesktop.module.css";
import Icon from "@shared/ui/icons/icons.jsx";
import SubMenu from "@widgets/header/parts/subMenu/subMenu.jsx";
import NavItems from "@content/navigation/navItemsDesktop.json"; // ⬅️ dados via alias

const NavMenuDesktop = () => {
  return (
    <nav>
      <ul className={styles.menu}>
        {NavItems.map((item, index) => (
          <li
            key={index}
            className={`${styles.menuItemWrapper} ${
              item.hasDropdown ? styles.hasDropdown : ""
            }`}
          >
            {item.href ? (
              <a
                href={item.href}
                className={`${styles.menuItem} ${styles.clickable}`}
              >
                {item.label}
                {item.hasDropdown && (
                  <Icon name="chevronDown" className={styles.arrowIcon} />
                )}
              </a>
            ) : (
              <span className={styles.menuItem} aria-disabled="true">
                {item.label}
                {item.hasDropdown && (
                  <Icon name="chevronDown" className={styles.arrowIcon} />
                )}
              </span>
            )}

            {item.hasDropdown && <SubMenu label={item.label} />}
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default NavMenuDesktop;
