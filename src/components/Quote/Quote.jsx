import styles from "./Quote.module.css";

const Quote = ({ children, variant = "default" }) => {

   const containerClass = variant === "highlight" ? styles.highlight : styles.default;

  return (
    <div className={containerClass}>
      <blockquote className={styles.quote}>{children}</blockquote>
    </div>
  );
};

export default Quote;
