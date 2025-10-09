import styles from "./tagLine.module.css";

const TagLine = ({
  taglineClass = "tagline",
  brandClass = "brand",
  serviceClass = "service",
}) => {
  return (
    <div
      className={styles[taglineClass]}
      aria-label="Ria Canal Hairdesign"
      role="text"
    >
      <span className={styles[brandClass]}>Ria Canal</span>
      <span className={styles[serviceClass]}>HAIRDESIGN</span>
    </div>
  );
};

export default TagLine;
