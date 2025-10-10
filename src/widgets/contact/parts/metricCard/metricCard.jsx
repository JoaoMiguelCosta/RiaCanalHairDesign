// src/widgets/.../metricCard.jsx
import { memo } from "react";
import Styles from "./metricCard.module.css";

const { Metric, value, label } = Styles;

const MetricCard = ({ value: val, label: lab }) => (
  <div className={Metric}>
    <div className={value}>{val}</div>
    <div className={label}>{lab}</div>
  </div>
);

export default memo(MetricCard);
