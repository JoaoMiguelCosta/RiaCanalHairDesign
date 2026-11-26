// src/pages/terms/terms.jsx
import { Link } from "react-router-dom";
import styles from "./terms.module.css";

function Terms() {
  return (
    <main
      id="main"
      aria-labelledby="terms-title"
      className={styles.container}
      tabIndex={-1}
    >
      <Link
        to="/"
        className={styles.backButton}
        aria-label="Voltar à página inicial"
      >
        ← Voltar
      </Link>

      <h1 id="terms-title" className={styles.title}>
        Termos & Condições
      </h1>

      <h2 className={styles.subtitle}>1. Informações do Site</h2>
      <p className={styles.paragraph}>
        O site do <strong>Ria Canal Hair Design</strong> tem caráter
        exclusivamente informativo, tendo como objetivo disponibilizar
        informações gerais sobre a atividade do salão e a sua marca.
      </p>

      <h2 className={styles.subtitle}>2. Serviços</h2>
      <p className={styles.paragraph}>
        Os serviços apresentados destinam-se apenas a dar a conhecer a atividade
        do salão. Para mais informações, recomendamos contacto direto através do
        telefone, WhatsApp ou redes sociais indicados no site.
      </p>

      <h2 className={styles.subtitle}>3. Direitos de Autor</h2>
      <p className={styles.paragraph}>
        Todos os textos, imagens e conteúdos presentes neste site pertencem ao{" "}
        <strong>Ria Canal Hair Design</strong>, salvo indicação em contrário.
        Não é permitida a reprodução ou utilização sem autorização prévia.
      </p>

      <h2 className={styles.subtitle}>4. Limitação de Responsabilidade</h2>
      <p className={styles.paragraph}>
        Fazemos o possível para manter a informação do site correta e
        atualizada, mas não garantimos a total ausência de erros ou falhas
        técnicas. O <strong>Ria Canal Hair Design</strong> não se responsabiliza
        por eventuais danos resultantes da utilização deste site.
      </p>
    </main>
  );
}

export default Terms;
