import styles from "./subtitle.module.css";

const Subtitle = ({ children, variant = "default" }) => {
  const containerClass =
    variant === "highlight" ? styles.containerHighlight : styles.container;

  return (
    <div className={containerClass} role="heading" aria-level={3}>
      <span className={styles.subtitle}>{children}</span>
    </div>
  );
};

export default Subtitle;
