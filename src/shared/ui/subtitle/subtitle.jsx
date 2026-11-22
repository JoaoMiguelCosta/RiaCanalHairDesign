import styles from "./subtitle.module.css";

const Subtitle = ({ children, variant = "default" }) => {
  const containerClass =
    variant === "highlight" ? styles.containerHighlight : styles.container;

  return (
    // Texto de destaque ("eyebrow") que antecede o título da secção: não é um
    // heading, por isso não expõe role="heading".
    <div className={containerClass}>
      <span className={styles.subtitle}>{children}</span>
    </div>
  );
};

export default Subtitle;
