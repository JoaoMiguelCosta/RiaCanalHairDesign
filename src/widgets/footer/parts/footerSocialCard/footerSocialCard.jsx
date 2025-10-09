// src/widgets/footer/parts/footerSocialCard/footerSocialCard.jsx
import styles from "./footerSocialCard.module.css";
import Icon from "@shared/ui/icons/icons.jsx";
import FooterSocials from "@content/footer/footerSocials.json"; // ⬅️ dados via alias

const FooterSocialCard = () => {
  return (
    <div className={styles.info}>
      <h3 className={styles.title}>Siga-nos</h3>

      <ul className={styles.icons}>
        {FooterSocials.map((s) => (
          <li key={s.name} className={styles.item}>
            <a
              href={s.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={s.label}
              className={styles.iconLink}
            >
              <Icon name={s.name} className={styles.icon} />
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default FooterSocialCard;
