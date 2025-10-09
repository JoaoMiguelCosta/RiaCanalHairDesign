import styles from "./quote.module.css";

const Quote = ({ children, variant = "default" }) => {
  const containerClass =
    variant === "highlight" ? styles.highlight : styles.default;

  return (
    <div className={containerClass} role="note" aria-label="Citação">
      <blockquote className={styles.quote}>{children}</blockquote>
    </div>
  );
};

export default Quote;
