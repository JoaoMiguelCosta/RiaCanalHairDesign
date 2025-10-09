import Styles from "./metricCard.module.css";

const MetricCard = ({ value, label }) => {
  return (
    <div className={Styles.Metric}>
      <div className={Styles.value}>{value}</div>
      <div className={Styles.label}>{label}</div>
    </div>
  );
};

export default MetricCard;
