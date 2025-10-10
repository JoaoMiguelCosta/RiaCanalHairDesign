// src/widgets/footer/parts/footerLinksCard/footerLinksCard.jsx
import { memo } from "react";
import styles from "./footerLinksCard.module.css";
import FooterLinks from "@content/footer/footerLinks.json";

const { info, title, linksGrid, linkText } = styles;

const FooterLinksCard = () => (
  <div className={info}>
    <h3 className={title}>Links Rápidos</h3>

    <div className={linksGrid}>
      {FooterLinks.map(({ label, href }) => (
        <a key={label} href={href} className={linkText}>
          {label}
        </a>
      ))}
    </div>
  </div>
);

export default memo(FooterLinksCard);
