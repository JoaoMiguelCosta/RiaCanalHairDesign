// src/widgets/header/parts/socialIcons/socialIcons.jsx
import Icon from "@shared/ui/icons/icons.jsx";
import styles from "./socialIcons.module.css";
import SocialLinks from "@content/social/socialLinks.json"; // ⬅️ dados via alias

const SocialIcons = () => {
  return (
    <div className={styles.container}>
      {SocialLinks.map((social) => (
        <a
          key={social.name}
          href={social.url}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={social.label}
        >
          <Icon name={social.name} className={styles.icon} />
        </a>
      ))}
    </div>
  );
};

export default SocialIcons;
