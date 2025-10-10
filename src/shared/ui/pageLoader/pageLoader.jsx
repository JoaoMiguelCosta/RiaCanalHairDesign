// src/shared/ui/pageLoader/pageLoader.jsx
import styles from "./pageLoader.module.css";

export default function PageLoader({
  fullscreen = true,
  label = "A carregar…",
}) {
  return (
    <div
      className={fullscreen ? styles.overlay : styles.inline}
      role="status"
      aria-busy="true"
      aria-live="polite"
    >
      <div className={styles.spinner} aria-hidden="true" />
      <span className={styles.text}>{label}</span>
    </div>
  );
}
