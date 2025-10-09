import styles from "./titleCaption.module.css";

const TitleCaption = ({ title, caption, className }) => {
  return (
    <div className={`${styles.wrapper} ${className || ""}`}>
      {title && <p className={styles.title}>{title}</p>}
      {caption && <p className={styles.caption}>{caption}</p>}
    </div>
  );
};

export default TitleCaption;
