import styles from "./Subtitle.module.css";

const Subtitle = ({ children, variant = "default" }) => {
  const containerClass =
    variant === "highlight" ? styles.containerHighlight : styles.container;

  return (
    <div className={containerClass}>
      <span className={styles.subtitle}>{children}</span>
    </div>
  );
};

export default Subtitle;
