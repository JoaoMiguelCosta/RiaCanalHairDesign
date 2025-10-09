import styles from "./InfoCard.module.css";

const InfoCard = ({ title, children }) => {
  return (
    <div className={styles.card}>
      <h3 className={styles.title}>{title}</h3>
      <p className={styles.text}>{children}</p>
    </div>
  );
};

export default InfoCard;
