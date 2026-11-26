// src/shared/ui/skipLink/skipLink.jsx
import styles from "./skipLink.module.css";

/**
 * Ligação "Saltar para o conteúdo" (WCAG 2.4.1).
 * O href nativo funciona sem JS; com JS, move o foco diretamente para o
 * <main id="main" tabIndex={-1}> sem acrescentar "#main" ao URL (a Home usa o
 * hash para âncoras de navegação).
 */
const SkipLink = ({ targetId = "main", children = "Saltar para o conteúdo" }) => {
  const handleClick = (e) => {
    const target = document.getElementById(targetId);
    if (!target) return; // sem destino: deixa o comportamento nativo
    e.preventDefault();
    target.focus(); // o browser faz scroll até ao elemento focado
  };

  return (
    <a href={`#${targetId}`} className={styles.skipLink} onClick={handleClick}>
      {children}
    </a>
  );
};

export default SkipLink;
