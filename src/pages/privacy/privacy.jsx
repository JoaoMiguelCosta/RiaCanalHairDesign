// src/pages/privacy/privacy.jsx
import { Link } from "react-router-dom";
import "@app/styles/global.css";
import styles from "./privacy.module.css";

function Privacy() {
  return (
    <main className={styles.container}>
      <Link to="/" className={styles.backButton}>
        ← Voltar
      </Link>

      <h1 className={styles.title}>Política de Privacidade</h1>

      <p className={styles.paragraph}>
        No <strong>Ria Canal Hair Design</strong> valorizamos a transparência e
        a privacidade dos visitantes. Este site é apenas informativo e{" "}
        <strong>
          não recolhe nem armazena quaisquer dados pessoais diretamente
        </strong>
        .
      </p>

      <h2 className={styles.subtitle}>Google Maps</h2>
      <p className={styles.paragraph}>
        Utilizamos o serviço Google Maps para mostrar a nossa localização. O
        Google pode recolher informações do dispositivo e cookies para fornecer
        o mapa. Esses dados são processados de acordo com a{" "}
        <a
          href="https://policies.google.com/privacy"
          target="_blank"
          rel="noopener noreferrer"
          className={styles.link}
        >
          Política de Privacidade do Google
        </a>
        .
      </p>

      <h2 className={styles.subtitle}>Contactos</h2>
      <p className={styles.paragraph}>
        Os contactos disponibilizados (telefone, WhatsApp e redes sociais)
        servem apenas para contacto direto. Não recolhemos, guardamos ou
        processamos informações pessoais através do site.
      </p>
    </main>
  );
}

export default Privacy;
