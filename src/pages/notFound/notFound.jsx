// src/pages/notFound/notFound.jsx
import { Link } from "react-router-dom";
import styles from "./notFound.module.css";

/**
 * Rota de fallback (*): estrutura semântica mínima (um único <main>, <h1> e
 * regresso à Home). Em URLs desconhecidos a Vercel serve o 404.html gerado
 * no build (HTTP 404, noindex), que arranca a SPA e chega aqui.
 */
function NotFound() {
  return (
    <main
      id="main"
      aria-labelledby="notfound-title"
      className={styles.container}
      tabIndex={-1}
    >
      <h1 id="notfound-title" className={styles.title}>
        404 — Página não encontrada
      </h1>

      <p className={styles.paragraph}>
        A página que procura não existe ou foi movida.
      </p>

      <Link to="/" className={styles.homeLink}>
        Voltar à página inicial
      </Link>
    </main>
  );
}

export default NotFound;
