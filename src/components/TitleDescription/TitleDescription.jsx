import styles from "./TitleDescription.module.css";

const TitleDescription = ({ title, legend, legend1, variant = "default" }) => {
  return (
    <div className={`${styles.Container} ${styles[`Container_${variant}`]}`}>
      <h2 className={`${styles.title} ${styles[`title_${variant}`]}`}>
        {title}
      </h2>
      <p className={`${styles.legend} ${styles[`legend_${variant}`]}`}>
        <span>{legend}</span>
        <span>{legend1}</span>
      </p>
    </div>
  );
};

export default TitleDescription;
