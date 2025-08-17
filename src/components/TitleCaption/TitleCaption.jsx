import styles from "./titlecaption.module.css";

const TitleCaption = ({ title, caption, className }) => {
  return (
    <div className={className}>
      {title && <p className={styles.title}>{title}</p>}
      {caption && <p className={styles.caption}>{caption}</p>}
    </div>
  );
};

export default TitleCaption;
