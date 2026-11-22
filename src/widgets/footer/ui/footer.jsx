import { memo } from "react";
import styles from "./footer.module.css";

import Title from "@shared/ui/title/title.jsx";
import FooterInfoCard from "@widgets/footer/parts/footerInfoCard/footerInfoCard.jsx";
import FooterContactCard from "@widgets/footer/parts/footerContactCard/footerContactCard.jsx";
import FooterLinksCard from "@widgets/footer/parts/footerLinksCard/footerLinksCard.jsx";
import FooterSocialCard from "@widgets/footer/parts/footerSocialCard/footerSocialCard.jsx";
import FooterLegalBar from "@widgets/footer/parts/footerLegalBar/footerLegalBar.jsx";
import footerContact from "@content/footer/contact.json";

// Mesmo destino do contacto WhatsApp do cartão de contactos do footer
const WHATSAPP_URL = footerContact.contacts.find(
  (c) => c.icon === "whatsapp"
)?.href;

// Abre o WhatsApp (navegação externa): link nativo, não <button>
const TalkLink = () => (
  <a
    href={WHATSAPP_URL}
    target="_blank"
    rel="noopener noreferrer"
    className={styles.talkButton}
  >
    Fale Connosco
  </a>
);

const Footer = () => {
  return (
    <footer className={styles.footer}>
      {/* ✅ conteúdo do footer com o mesmo content width do main */}
      <div className="container">
        <div className={styles.title}>
          {/* Slogan de chamada à ação, não título de conteúdo: <p> com o mesmo
              estilo (os títulos do footer são os h2 dos cartões) */}
          <Title
            as="p"
            line1="Visual novo, com cuidado e sofisticação."
            line2="Está pronta?"
            variant="highlight"
          />
        </div>

        <div className={styles.talk}>
          <TalkLink />
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
