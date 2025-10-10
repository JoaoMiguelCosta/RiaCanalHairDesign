// src/widgets/footer/parts/footerLegalBar/footerLegalBar.jsx
import { memo } from "react";
import { Link } from "react-router-dom";
import styles from "./footerLegalBar.module.css";
import LegalLinks from "@content/legal/legalLinks.json";

const { bar, left, right, itemWrap, link, dot } = styles;

const LinkOrA = ({ item }) =>
  item.external ? (
    <a
      href={item.href}
      target="_blank"
      rel="noopener noreferrer"
      className={link}
    >
      {item.label}
    </a>
  ) : (
    <Link to={item.href} className={link}>
      {item.label}
    </Link>
  );

const FooterLegalBar = () => {
  const lastIdx = LegalLinks.length - 1;

  return (
    <div className={bar}>
      <div className={left}>
        © 2025 Ria Canal Hair Design. Todos os direitos reservados.
      </div>

      <nav className={right} aria-label="Links legais">
        {LegalLinks.map((item, i) => (
          <span key={item.label} className={itemWrap}>
            <LinkOrA item={item} />
            {i < lastIdx && <span aria-hidden className={dot} />}
          </span>
        ))}
      </nav>
    </div>
  );
};

export default memo(FooterLegalBar);
