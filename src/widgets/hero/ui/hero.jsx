// src/widgets/hero/ui/hero.jsx
import styles from "./hero.module.css";

import LogoComponent from "@shared/ui/logo/logoComponent.jsx";
import Button from "@shared/ui/button/button.jsx";
import Icon from "@shared/ui/icons/icons.jsx";
import heroData from "@content/hero/hero.json";

// mapeia ícone → classe do botão (mantém as mesmas classes visuais)
const BTN_CLASS_BY_ICON = {
  comment: styles.whatsappBtn,
  instagram: styles.instagramBtn,
  location: styles.locationBtn,
};

const Hero = () => {
  const { title1, title2, phrase, links = [] } = heroData;

  return (
    <div id="Start" className={styles.hero}>
      <div className={styles.logoWrapper}>
        <LogoComponent imgClassName={styles.logoImg} />
      </div>

      <div className={styles.Title1}>
        <span>{title1}</span>
      </div>

      <div className={styles.Title2}>
        <span>{title2}</span>
      </div>

      <div className={styles.phrase}>
        <p>{phrase}</p>
      </div>

      <div className={styles.buttons}>
        {links.map(({ href, ariaLabel, icon, label }) => (
          <a
            key={label}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={ariaLabel}
          >
            <Button button={BTN_CLASS_BY_ICON[icon]}>
              <Icon name={icon} />
              <span>{label}</span>
            </Button>
          </a>
        ))}
      </div>
    </div>
  );
};

export default Hero;
