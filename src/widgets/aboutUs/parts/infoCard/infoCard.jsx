import { memo } from "react";
import styles from "./infoCard.module.css";

const InfoCard = ({ title, children, className = "" }) => {
  // títulos que ficam sempre em laranja
  const isMVV = /^(Missão|Visão|Valores)$/i.test(title);

  return (
    <div className={`${styles.card} ${className}`}>
      <h3 className={`${styles.title} ${isMVV ? styles.accent : ""}`}>
        {title}
      </h3>
      <p className={styles.text}>{children}</p>
    </div>
  );
};

export default memo(InfoCard);
