// src/widgets/header/parts/socialIcons/socialIcons.jsx
import { memo } from "react";
import Icon from "@shared/ui/icons/icons.jsx";
import styles from "./socialIcons.module.css";
import SocialLinks from "@content/social/socialLinks.json";

// 🔗 Componente pequeno para um item (evita JSX duplicado no map)
const SocialIconLink = ({ name, url, label }) => (
  <a
    key={name}
    href={url}
    target="_blank"
    rel="noopener noreferrer"
    aria-label={label}
  >
    <Icon name={name} className={styles.icon} />
  </a>
);

const SocialIcons = () => (
  <div className={styles.container}>
    {SocialLinks.map(({ name, url, label }) => (
      <SocialIconLink key={name} name={name} url={url} label={label} />
    ))}
  </div>
);

// memo evita re-render desnecessário (não muda a saída)
export default memo(SocialIcons);
