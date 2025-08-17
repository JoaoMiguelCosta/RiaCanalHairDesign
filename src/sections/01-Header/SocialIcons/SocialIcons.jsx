import Icon from "../../../components/Icons/Icons.jsx";
import styles from "./SocialIcons.module.css";

const socialLinks = [
  {
    name: "instagram",
    url: "https://www.instagram.com/ria_canal_hairdesign",
    label: "Instagram",
  },
  {
    name: "facebook",
    url: "https://www.facebook.com/RiaCanalHairDesignAvr/?locale=pt_PT",
    label: "Facebook",
  },
  {
    name: "whatsapp",
    url: "https://wa.me/351916887537",
    label: "WhatsApp",
  },
];

const SocialIcons = () => {
  return (
    <div className={styles.container}>
      {socialLinks.map((social) => (
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
