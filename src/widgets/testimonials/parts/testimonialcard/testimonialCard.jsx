// src/widgets/testimonials/parts/testimonialcard/testimonialCard.jsx
import { memo } from "react";
import styles from "./testimonialCard.module.css";

/**
 * A barra de progresso do cartão ativo é uma animação CSS (scaleX 0 → 1) com a
 * duração de apresentação; `running` controla apenas o animation-play-state
 * (pausar congela o progresso e retomar continua do mesmo ponto) e o fim da
 * animação (`onProgressEnd`) faz avançar o carrossel.
 */
const TestimonialCard = ({
  quote,
  author,
  service,
  location,
  isActive,
  running = false,
  durationMs,
  onProgressEnd,
}) => {
  return (
    <div
      className={styles.container}
      data-active={isActive ? "true" : "false"}
      data-running={running ? "true" : "false"}
    >
      {/* Barra de progresso do card ativo */}
      <div className={styles.progress} aria-hidden="true">
        <div
          className={styles.progressFill}
          style={durationMs ? { "--progress-duration": `${durationMs}ms` } : undefined}
          onAnimationEnd={onProgressEnd}
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

export default memo(TestimonialCard);
