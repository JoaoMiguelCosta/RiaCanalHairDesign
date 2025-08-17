import styles from "./Statcard.module.css";

const StatCard = ({ number, label, orange = false }) => {
  return (
    <div className={styles.card}>
      <h3 className={styles.number}>{number}</h3>
      <p className={`${styles.label} ${orange ? styles.orangeLabel : ""}`}>
        {label}
      </p>
    </div>
  );
};

export default StatCard;
