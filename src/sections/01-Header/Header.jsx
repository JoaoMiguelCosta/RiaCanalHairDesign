import styles from "./header.module.css";
import SignatureMark from "../../components/SignatureMark/SignatureMark";
import SocialIcons from "./SocialIcons/SocialIcons";
import NavMenuDesktop from "./NavMenu/NavMenuDesktop";
import NavMenuMobile from "./NavMenu/NavMenuMobile";

const Header = () => {
  return (
    <div className={styles.header}>
      <div className={styles.headerContent}>
        <SignatureMark />
        <NavMenuDesktop />
        <NavMenuMobile />
        <SocialIcons />
      </div>
    </div>
  );
};

export default Header;
