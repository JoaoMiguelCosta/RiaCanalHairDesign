// src/widgets/footer/parts/footerSocialCard/footerSocialCard.jsx
import { memo } from "react";
import styles from "./footerSocialCard.module.css";
import Icon from "@shared/ui/icons/icons.jsx";
import FooterSocials from "@content/footer/footerSocials.json";

const { info, title, icons, item, iconLink, icon } = styles;

const EXT_PROPS = { target: "_blank", rel: "noopener noreferrer" };

const FooterSocialCard = () => (
  <div className={info}>
    <h2 className={title}>Siga-nos</h2>

    <ul className={icons}>
      {FooterSocials.map(({ name, href, label }) => (
        <li key={name} className={item}>
          <a href={href} aria-label={label} className={iconLink} {...EXT_PROPS}>
            <Icon name={name} className={icon} />
          </a>
        </li>
      ))}
    </ul>
  </div>
);

export default memo(FooterSocialCard);
