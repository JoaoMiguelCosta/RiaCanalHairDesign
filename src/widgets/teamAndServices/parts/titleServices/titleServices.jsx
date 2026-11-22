import styles from "./titleServices.module.css";

const TitleServices = ({ children, variant }) => {
  return (
    // h3: "Serviços" é subsecção de "Equipa & Serviços" (h2)
    <h3 className={variant ? styles[variant] : styles.container}>{children}</h3>
  );
};

export default TitleServices;
