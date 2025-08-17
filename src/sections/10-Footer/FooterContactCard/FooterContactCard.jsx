import styles from "./FooterContactCard.module.css";
import Icon from "../../../components/Icons/Icons.jsx";

const FooterContactCard = () => {
  return (
    <div className={styles.info}>
      <h3 className={styles.title}>Contactos</h3>

      <ul className={styles.list}>
        <li className={styles.item}>
          <Icon name="location" className={styles.icon} />
          <span className={styles.text}>
            Praceta Dr. Alberto Souto 9, 3800-147 Aveiro
          </span>
        </li>

        <li className={styles.item}>
          <Icon name="clock" className={styles.icon} />
          <span className={styles.text}>Terç a Sáb – 09:00 às 19:00</span>
        </li>

        <li className={styles.item}>
          <Icon name="phone" className={styles.icon} />
          <a href="tel:+351234420471" className={styles.text}>
            +351 234 420 471
          </a>
        </li>

        <li className={styles.item}>
          <Icon name="whatsapp" className={styles.icon} />
          <a
            href="https://wa.me/351916887537"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.text}
          >
            +351 916 887 537
          </a>
        </li>
      </ul>
    </div>
  );
};

export default FooterContactCard;
