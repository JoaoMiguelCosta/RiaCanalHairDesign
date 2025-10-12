// src/shared/ui/signatureMark/signatureMark.jsx
import LogoComponent from "@shared/ui/logo/logoComponent.jsx";
import TagLine from "@shared/ui/tagLine/tagLine.jsx";
import styles from "./signatureMark.module.css";

const SignatureMark = () => {
  return (
    <div className={styles.container}>
      {/* Logo decorativo porque a TagLine já fornece o nome/serviço em texto */}
      <LogoComponent
        className={styles.logoWrapper}
        imgClassName={styles.logoImg}
        alt=""
        ariaHidden
      />
      <TagLine />
    </div>
  );
};

export default SignatureMark;
