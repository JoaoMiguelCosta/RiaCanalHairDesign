import styles from "./Arrive.module.css";

export default function Arrive() {
  return (
    <section className={styles.Arrive}>
      <h2 className={styles.title}>Como Chegar</h2>

      <p className={styles.intro}>
        Localizado no coração de Aveiro, junto aos famosos canais da cidade.
        Facilmente acessível a pé ou de transporte público.
      </p>

      <p className={styles.row}>
        <span className={styles.label}>Estacionamento:</span>{" "}
        <span className={styles.value}>Disponível na rua.</span>
      </p>

      <p className={styles.row}>
        <span className={styles.label}>Transportes:</span>{" "}
        <span className={styles.value}>Paragem de autocarro a 2 min.</span>
      </p>

      <p className={styles.row}>
        <span className={styles.label}>Centro:</span>{" "}
        <span className={styles.value}>5 min a pé do centro histórico.</span>
      </p>
    </section>
  );
}
