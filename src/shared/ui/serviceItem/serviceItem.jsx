import styles from "./serviceItem.module.css";

const ServiceItem = ({ label, variant = "primary" }) => {
  return (
    <div
      className={`${styles.item} ${styles[variant]}`}
      data-variant={variant}
      title={label}
      aria-label={label}
    >
      <span className={styles.bullet} aria-hidden="true" />
      <span className={styles.text}>{label}</span>
    </div>
  );
};

export default ServiceItem;
