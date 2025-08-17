import styles from "./FooterLegalBar.module.css";

const FooterLegalBar = () => {
  const items = [
    { label: "João Miguel Costa", href: "#" },
    { label: "Termos & Condições", href: "/termos-condicoes" },
    { label: "Política de Privacidade", href: "/politica-privacidade" },
  ];

  return (
    <div className={styles.bar}>
      <div className={styles.left}>
        © 2025 Ria Canal Hair Design. Todos os direitos reservados.
      </div>

      <nav className={styles.right} aria-label="Links legais">
        {items.map((item, i) => (
          <span key={item.label} className={styles.itemWrap}>
            <a className={styles.link} href={item.href}>
              {item.label}
            </a>
            {i < items.length - 1 && (
              <span aria-hidden className={styles.dot} />
            )}
          </span>
        ))}
      </nav>
    </div>
  );
};

export default FooterLegalBar;
