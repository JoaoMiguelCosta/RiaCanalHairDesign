// src/widgets/footer/parts/footerInfoCard/footerInfoCard.jsx
import styles from "./footerInfoCard.module.css";
import LogoComponent from "@shared/ui/logo/logoComponent.jsx";
import TagLine from "@shared/ui/tagLine/tagLine.jsx";

const FooterInfoCard = () => {
  return (
    <div className={styles.info}>
      <a
        href="#Start"
        className={styles.logoLink}
        aria-label="Voltar ao início"
      >
        <div className={styles.logoTagline}>
          <LogoComponent
            className={styles.logoWrapper}
            imgClassName={styles.logoImg}
          />
          <TagLine
            taglineClass="taglineFooter"
            brandClass="brandFooter"
            serviceClass="serviceFooter"
          />
        </div>
      </a>

      <div className={styles.text}>
        <span className={styles.textspan}>
          No Ria Canal Hair Design, combinamos elegância e excelência para criar
          experiências de beleza únicas e memoráveis.
        </span>
      </div>
    </div>
  );
};

export default FooterInfoCard;
