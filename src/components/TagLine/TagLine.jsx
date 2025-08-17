import styles from "./Tagline.module.css";

const TagLine = ({
  taglineClass = "tagline", // classe container
  brandClass = "brand", // classe da parte brand
  serviceClass = "service", // classe da parte service
}) => {
  return (
    <div className={styles[taglineClass]}>
      <span className={styles[brandClass]}>Ria Canal</span>
      <span className={styles[serviceClass]}>HAIRDESIGN</span>
    </div>
  );
};

export default TagLine;
