import styles from "./ServiceItem.module.css";

const ServiceItem = ({ label, variant = "primary" }) => {
  return (
    <div className={`${styles.item} ${styles[variant]}`}>
      <span className={styles.bullet} aria-hidden="true" />
      <span className={styles.text}>{label}</span>
    </div>
  );
};

export default ServiceItem;
