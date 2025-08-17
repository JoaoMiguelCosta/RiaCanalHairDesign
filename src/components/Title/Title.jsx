import styles from "./Title.module.css";

const Title = ({ line1, line2, variant = "default" }) => {
  const customTitle =
    variant === "highlight" ? styles.highlight : styles.default;

  return (
    <h1 className={customTitle}>
      {line1 && <span className={styles.span1}>{line1}</span>}
      {line2 && <span className={styles.span2}>{line2}</span>}
    </h1>
  );
};

export default Title;
