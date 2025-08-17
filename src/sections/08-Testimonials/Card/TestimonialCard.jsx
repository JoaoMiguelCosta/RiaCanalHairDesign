import styles from "./TestimonialCard.module.css";

const TestimonialCard = ({
  quote,
  author,
  service,
  location,
  isActive,
  progress,
}) => {
  return (
    <div className={styles.container} data-active={isActive ? "true" : "false"}>
      {/* Barra de progresso do card ativo */}
      <div className={styles.progress} aria-hidden="true">
        <div
          className={styles.progressFill}
          style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
        />
      </div>

      <p className={styles.quote}>{quote}</p>
      <span className={styles.author}>{author}</span>
      <span className={styles.service}>{service}</span>

      <div className={styles.location}>
        <span className={styles.locationContent}>{location}</span>
      </div>
    </div>
  );
};

export default TestimonialCard;
