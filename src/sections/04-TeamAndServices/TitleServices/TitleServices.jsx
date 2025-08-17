import styles from "./Title.module.css";

const TitleServices = ({ children, variant }) => {
  return (
    <h2 className={variant ? styles[variant] : styles.container}>{children}</h2>
  );
};

export default TitleServices;
