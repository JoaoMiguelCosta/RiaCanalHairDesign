// src/widgets/footer/ui/footer.jsx
import styles from "./footer.module.css";

import Title from "@shared/ui/title/title.jsx";

import FooterInfoCard from "@widgets/footer/parts/footerInfoCard/footerInfoCard.jsx";
import FooterContactCard from "@widgets/footer/parts/footerContactCard/footerContactCard.jsx";
import FooterLinksCard from "@widgets/footer/parts/footerLinksCard/footerLinksCard.jsx";
import FooterSocialCard from "@widgets/footer/parts/footerSocialCard/footerSocialCard.jsx";
import FooterLegalBar from "@widgets/footer/parts/footerLegalBar/footerLegalBar.jsx";

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
