// src/widgets/footer/parts/footerLinksCard/footerLinksCard.jsx
import styles from "./footerLinksCard.module.css";
import FooterLinks from "@content/footer/footerLinks.json"; // ⬅️ dados via alias

const FooterLinksCard = () => {
  return (
    <div className={styles.info}>
      <h3 className={styles.title}>Links Rápidos</h3>

      <div className={styles.linksGrid}>
        {FooterLinks.map((l) => (
          <a key={l.label} href={l.href} className={styles.linkText}>
            {l.label}
          </a>
        ))}
      </div>
    </div>
  );
};

export default FooterLinksCard;
