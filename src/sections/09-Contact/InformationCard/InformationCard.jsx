import styles from "./InformationCard.module.css";

const InformationCard = ({ Letra, Title, Description, button }) => {
  return (
    <div className={styles.card}>
      <div className={styles.Icone}>{Letra}</div>

      <div className={styles.TitleDescription}>
        <div className={styles.TitleRow}>
          <div className={styles.Title}>{Title}</div>
          {button && <div className={styles.ButtonWrapper}>{button}</div>}
        </div>

        <div className={styles.Description}>{Description}</div>
      </div>
    </div>
  );
};

export default InformationCard;
