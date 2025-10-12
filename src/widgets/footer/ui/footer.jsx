import { memo } from "react";
import styles from "./footer.module.css";

import Title from "@shared/ui/title/title.jsx";
import FooterInfoCard from "@widgets/footer/parts/footerInfoCard/footerInfoCard.jsx";
import FooterContactCard from "@widgets/footer/parts/footerContactCard/footerContactCard.jsx";
import FooterLinksCard from "@widgets/footer/parts/footerLinksCard/footerLinksCard.jsx";
import FooterSocialCard from "@widgets/footer/parts/footerSocialCard/footerSocialCard.jsx";
import FooterLegalBar from "@widgets/footer/parts/footerLegalBar/footerLegalBar.jsx";
import { useOpenExternal } from "@widgets/footer/hook/useOpenExternal";

const WHATSAPP_URL = "https://wa.me/351916887537";

const TalkButton = ({ onClick }) => (
  <button type="button" className={styles.talkButton} onClick={onClick}>
    Fale Connosco
  </button>
);

const Footer = () => {
  const openWhatsApp = useOpenExternal(WHATSAPP_URL);

  return (
    <footer className={styles.footer}>
      {/* ✅ conteúdo do footer com o mesmo content width do main */}
      <div className="container">
        <div className={styles.title}>
          <Title
            line1="Visual novo, com cuidado e sofisticação."
            line2="Está pronta?"
            variant="highlight"
          />
        </div>

        <div className={styles.talk}>
          <TalkButton onClick={openWhatsApp} />
        </div>

        <div className={styles.cards}>
          <FooterInfoCard />
          <FooterContactCard />
          <FooterLinksCard />
          <FooterSocialCard />
        </div>
      </div>

      {/* ✅ barra legal com o mesmo content width */}
      <div className={styles.legalWrapper}>
        <div className="container">
          <FooterLegalBar />
        </div>
      </div>
    </footer>
  );
};

export default memo(Footer);
