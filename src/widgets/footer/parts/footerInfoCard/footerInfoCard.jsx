// src/widgets/footer/parts/footerInfoCard/footerInfoCard.jsx
import { memo } from "react";
import styles from "./footerInfoCard.module.css";
import LogoComponent from "@shared/ui/logo/logoComponent.jsx";
import TagLine from "@shared/ui/tagLine/tagLine.jsx";

const { info, logoLink, logoTagline, logoWrapper, logoImg, text, textspan } =
  styles;

const TAGLINE_PROPS = {
  taglineClass: "taglineFooter",
  brandClass: "brandFooter",
  serviceClass: "serviceFooter",
};

const FooterInfoCard = () => (
  <div className={info}>
    <a href="#Start" className={logoLink} aria-label="Voltar ao início">
      <div className={logoTagline}>
        {/* Logo decorativo porque o link já tem aria-label e a TagLine tem texto */}
        <LogoComponent
          className={logoWrapper}
          imgClassName={logoImg}
          alt=""
          ariaHidden
        />
        <TagLine {...TAGLINE_PROPS} />
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
