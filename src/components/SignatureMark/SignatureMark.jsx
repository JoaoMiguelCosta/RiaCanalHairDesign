import LogoComponent from "../Logo/LogoComponent.jsx";
import TagLine from "../TagLine/TagLine";
import styles from "./SignatureMark.module.css";

const SignatureMark = () => {
  return (
    <div className={styles.container}>
      <LogoComponent
        className={styles.logoWrapper}
        imgClassName={styles.logoImg}
      />
      <TagLine />
    </div>
  );
};

export default SignatureMark;
