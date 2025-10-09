// src/widgets/footer/parts/footerLegalBar/footerLegalBar.jsx
import { Link } from "react-router-dom";
import styles from "./footerLegalBar.module.css";
import LegalLinks from "@content/legal/legalLinks.json";

const FooterLegalBar = () => {
  return (
    <div className={styles.bar}>
      <div className={styles.left}>
        © 2025 Ria Canal Hair Design. Todos os direitos reservados.
      </div>

      <nav className={styles.right} aria-label="Links legais">
        {LegalLinks.map((item, i) => (
          <span key={item.label} className={styles.itemWrap}>
            {item.external ? (
              <a
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.link}
              >
                {item.label}
              </a>
            ) : (
              <Link to={item.href} className={styles.link}>
                {item.label}
              </Link>
            )}

            {i < LegalLinks.length - 1 && (
              <span aria-hidden className={styles.dot} />
            )}
          </span>
        ))}
      </nav>
    </div>
  );
};

export default FooterLegalBar;
