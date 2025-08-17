import styles from "./FooterSocialCard.module.css";
import Icon from "../../../components/Icons/Icons.jsx";

const socials = [
  {
    name: "instagram",
    label: "Instagram",
    href: "https://www.instagram.com/ria_canal_hairdesign/",
  },
  {
    name: "facebook",
    label: "Facebook",
    href: "https://www.facebook.com/RiaCanalHairDesignAvr/?locale=pt_BR",
  },
];

const FooterSocialCard = () => {
  return (
    <div className={styles.info}>
      <h3 className={styles.title}>Siga-nos</h3>

      <ul className={styles.icons}>
        {socials.map((s) => (
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
