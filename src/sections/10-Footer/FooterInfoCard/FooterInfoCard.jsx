import styles from "./FooterInfoCard.module.css";
import LogoComponent from "../../../components/Logo/LogoComponent";
import TagLine from "../../../components/TagLine/TagLine";

const FooterInfoCard = () => {
  return (
    <div className={styles.info}>
      {/* Bloco logo + tagline */}
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

      {/* Texto descritivo */}
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
