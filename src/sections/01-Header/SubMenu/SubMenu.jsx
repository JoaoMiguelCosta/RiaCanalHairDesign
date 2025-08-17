import styles from "./submenu.module.css";

const submenuData = {
  "SOBRE NÓS": [
    { text: "QUEM SOMOS", href: "#AboutUs" },
    { text: "EQUIPA & SERVIÇOS", href: "#TeamAndServices" },
  ],
  PORTFÓLIO: [
    { text: "TRABALHOS", href: "#Works" },
    { text: "TRANSFORMAÇÕES", href: "#Transformations" },
  ],
  CLIENTES: [{ text: "TESTEMUNHOS", href: "#Testimonials" }],
  CONTACTOS: [{ text: "LOCALIZAÇÃO", href: "#Location" }],
};

const SubMenu = ({ label }) => {
  const items = submenuData[label];
  if (!items) return null;

  return (
    <ul className={styles.submenu}>
      {items.map((item, index) => (
        <li key={index} className={styles.submenuItem}>
          <a href={item.href} className={styles.submenuLink}>
            {item.text}
          </a>
        </li>
      ))}
    </ul>
  );
};

export default SubMenu;
