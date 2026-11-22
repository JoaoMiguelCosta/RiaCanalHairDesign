import styles from "./statcard.module.css";

const StatCard = ({ number, label, orange = false }) => {
  return (
    <div className={styles.card}>
      {/* Valor estatístico, não um título: <p> (margens nativas iguais às do h3) */}
      <p className={styles.number}>{number}</p>
      <p className={`${styles.label} ${orange ? styles.orangeLabel : ""}`}>
        {label}
      </p>
    </div>
  );
};

export default StatCard;
