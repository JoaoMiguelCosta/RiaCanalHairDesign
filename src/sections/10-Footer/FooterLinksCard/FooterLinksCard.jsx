import styles from "./FooterLinksCard.module.css";

const links = [
  { label: "Início", href: "#Start" },
  { label: "Clientes", href: "#Testimonials" },
  { label: "Sobre Nós", href: "#AboutUs" },
  { label: "Instagram", href: "#Instagram" }, // troca para URL externo se quiseres
  { label: "Espaço", href: "#Space" }, // <-- aspa corrigida
  { label: "Contactos", href: "#Location" },
  { label: "Portfólio", href: "#Works" },
];

const FooterLinksCard = () => {
  return (
    <div className={styles.info}>
      <h3 className={styles.title}>Links Rápidos</h3>

      <div className={styles.linksGrid}>
        {links.map((l) => (
          <a key={l.label} href={l.href} className={styles.linkText}>
            {l.label}
          </a>
        ))}
      </div>
    </div>
  );
};

export default FooterLinksCard;
