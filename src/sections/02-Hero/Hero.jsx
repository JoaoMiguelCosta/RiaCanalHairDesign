import styles from "./Hero.module.css"; // CSS Module
import LogoComponent from "../../components/Logo/LogoComponent.jsx";
import Button from "../../components/Button/Button.jsx";
import Icon from "../../components/Icons/Icons.jsx";

const Hero = () => {
  return (
    <div id="Start" className={styles.hero}>
      <div className={styles.logoWrapper}>
        <LogoComponent imgClassName={styles.logoImg} />
      </div>

      <div className={styles.Title1}>
        <span>Ria Canal</span>
      </div>

      <div className={styles.Title2}>
        <span>HAIRDESIGN</span>
      </div>

      <div className={styles.phrase}>
        <p>"Beleza com identidade, no coração de Aveiro"</p>
      </div>

      <div className={styles.buttons}>
        <a
          href="https://wa.me/351916887537"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="WhatsApp"
        >
          <Button button={styles.whatsappBtn}>
            <Icon name="comment" />
            <span>Whatsapp</span>
          </Button>
        </a>

        <a
          href="https://www.instagram.com/ria_canal_hairdesign"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Instagram"
        >
          <Button button={styles.instagramBtn}>
            <Icon name="instagram" />
            <span>Instagram</span>
          </Button>
        </a>

        <a
          href="https://www.google.com/maps/dir/?api=1&destination=40.64422,-8.64587&travelmode=driving"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Localização"
        >
          <Button button={styles.locationBtn}>
            <Icon name="location" />
            <span>Localização</span>
          </Button>
        </a>
      </div>
    </div>
  );
};

export default Hero;
