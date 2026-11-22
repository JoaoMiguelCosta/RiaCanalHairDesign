import styles from "./titleDescription.module.css";

const TitleDescription = ({
  title,
  legend,
  legend1,
  variant = "default",
  as = "h3", // nome da profissional: subsecção do título da secção (h2)
}) => {
  const Tag = as;
  return (
    <div className={`${styles.Container} ${styles[`Container_${variant}`]}`}>
      <Tag className={`${styles.title} ${styles[`title_${variant}`]}`}>
        {title}
      </Tag>
      <p className={`${styles.legend} ${styles[`legend_${variant}`]}`}>
        <span>{legend}</span>
        <span>{legend1}</span>
      </p>
    </div>
  );
};

export default TitleDescription;
