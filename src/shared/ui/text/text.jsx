import styles from "./text.module.css";

const Text = ({ children, variant = "default", className }) => {
  const paragraphClass = styles[variant] || styles.default;
  return (
    <p className={`${styles.base} ${paragraphClass} ${className || ""}`}>
      {children}
    </p>
  );
};

export default Text;
