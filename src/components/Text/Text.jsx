import styles from "./Text.module.css";

const Text = ({ children, variant = "default", className }) => {
  const paragraphClass = styles[variant] || styles.default;

  return <p className={`${paragraphClass} ${className || ""}`}>{children}</p>;
};

export default Text;
