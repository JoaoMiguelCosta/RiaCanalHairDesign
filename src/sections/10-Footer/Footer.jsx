import styles from "./Footer.module.css";
import Title from "../../components/Title/Title";
import FooterInfoCard from "./FooterInfoCard/FooterInfoCard";
import FooterContactCard from "./FooterContactCard/FooterContactCard";
import FooterLinksCard from "./FooterLinksCard/FooterLinksCard";
import FooterSocialCard from "./FooterSocialCard/FooterSocialCard";
import FooterLegalBar from "./FooterLegalBar/FooterLegalBar";

const Footer = () => {
  const openWhatsApp = () => {
    window.open("https://wa.me/351916887537", "_blank");
  };

  return (
    <div className={styles.footer}>
      <div className={styles.title}>
        <Title
          line1="Visual novo, com cuidado e sofisticação."
          line2="Está pronta?"
          variant="highlight"
        />
      </div>
      <div className={styles.talk}>
        <button
          type="button"
          className={styles.talkButton}
          onClick={openWhatsApp}
        >
          Fale Connosco
        </button>
      </div>
      <div className={styles.cards}>
        <FooterInfoCard />
        <FooterContactCard />
        <FooterLinksCard />
        <FooterSocialCard />
      </div>
      <FooterLegalBar />
    </div>
  );
};

export default Footer;
