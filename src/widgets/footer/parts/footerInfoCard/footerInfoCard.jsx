// src/widgets/footer/parts/footerInfoCard/footerInfoCard.jsx
import { memo } from "react";
import styles from "./footerInfoCard.module.css";
import LogoComponent from "@shared/ui/logo/logoComponent.jsx";
import TagLine from "@shared/ui/tagLine/tagLine.jsx";

const { info, logoLink, logoTagline, logoWrapper, logoImg, text, textspan } =
  styles;

const FooterInfoCard = () => (
  <div className={info}>
    <a href="#Start" className={logoLink} aria-label="Ria Canal Hairdesign — voltar ao início">
      <div className={logoTagline}>
        {/* Logo decorativo: o aria-label do link inclui o texto visível da TagLine (WCAG 2.5.3) */}
        <LogoComponent
          className={logoWrapper}
          imgClassName={logoImg}
          alt=""
          ariaHidden
        />
        <TagLine variant="footer" />
      </div>
    </a>

    <div className={text}>
      <span className={textspan}>
        No Ria Canal Hair Design, combinamos elegância e excelência para criar
        experiências de beleza únicas e memoráveis.
      </span>
    </div>
  </div>
);

export default memo(FooterInfoCard);
