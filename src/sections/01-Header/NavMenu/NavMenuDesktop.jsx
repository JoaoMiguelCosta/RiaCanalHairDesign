import styles from "./NavMenuDesktop.module.css";
import Icon from "../../../components/Icons/Icons.jsx";
import SubMenu from "../SubMenu/SubMenu";

const navItems = [
  { label: "INÍCIO", href: "#Start" },
  { label: "SOBRE NÓS", hasDropdown: true },
  { label: "PORTFÓLIO", hasDropdown: true },
  { label: "ESPAÇO", href: "#Space" },
  { label: "CLIENTES", hasDropdown: true },
  { label: "INSTAGRAM", href: "#Instagram" },
  { label: "CONTACTOS", hasDropdown: true },
];

const NavMenuDesktop = () => {
  return (
    <nav>
      <ul className={styles.menu}>
        {navItems.map((item, index) => (
          <li
            key={index}
            className={`${styles.menuItemWrapper} ${item.hasDropdown ? styles.hasDropdown : ""}`}
          >
            {item.href ? (
              <a
                href={item.href}
                className={`${styles.menuItem} ${styles.clickable}`}
              >
                {item.label}
                {item.hasDropdown && (
                  <Icon name="arrowDown" className={styles.arrowIcon} />
                )}
              </a>
            ) : (
              <span className={styles.menuItem} aria-disabled="true">
                {item.label}
                {item.hasDropdown && (
                  <Icon name="arrowDown" className={styles.arrowIcon} />
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
