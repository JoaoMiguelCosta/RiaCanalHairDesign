import styles from "./hero.module.css";

import LogoComponent from "@shared/ui/logo/logoComponent.jsx";
import Button from "@shared/ui/button/button.jsx";
import Icon from "@shared/ui/icons/icons.jsx";
import heroData from "@content/hero/hero.json";

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
        <LogoComponent imgClassName={styles.logoImg} alt="" ariaHidden />
      </div>

      <div className={styles.Title1}><span>{title1}</span></div>
      <div className={styles.Title2}><span>{title2}</span></div>

      <div className={styles.phrase}>
        <p>{phrase}</p>
      </div>

      <div className={styles.buttons}>
        {links.map(({ href, ariaLabel, icon, label }) => (
          <Button
            key={label}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            ariaLabel={ariaLabel}
            className={BTN_CLASS_BY_ICON[icon]}   
          >
            <Icon name={icon} aria-hidden="true" />
            <span>{label}</span>
          </Button>
        ))}
      </div>
    </div>
  );
};

export default Hero;
