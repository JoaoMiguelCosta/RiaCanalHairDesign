// src/widgets/header/ui/header.jsx
import { memo } from "react";
import styles from "./header.module.css";

import SignatureMark from "@shared/ui/signatureMark/signatureMark.jsx";
import SocialIcons from "@widgets/header/parts/socialIcons/socialIcons.jsx";
import NavMenuDesktop from "@widgets/header/parts/navMenu/navMenuDesktop.jsx";
import NavMenuMobile from "@widgets/header/parts/navMenu/navMenuMobile.jsx";

const Header = () => (
  <div className={styles.header}>
    <div className={styles.headerContent}>
      <SignatureMark />
      <NavMenuDesktop />
      <div className={styles.mobileRight}>
        <SocialIcons />
        <NavMenuMobile />
      </div>
    </div>
  </div>
);

export default memo(Header);
