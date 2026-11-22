import { memo } from "react";
import styles from "./arrive.module.css";
import data from "@content/contact/arrive.json";

const { Arrive: arrive, title, intro, row, label, value } = styles;

const Row = ({ l, v }) => (
  <p className={row}>
    <span className={label}>{l}</span> <span className={value}>{v}</span>
  </p>
);

const Arrive = () => (
  <section className={arrive} aria-labelledby="arrive-title">
    {/* h3: subsecção de "Contactos & Localização" (h2) */}
    <h3 id="arrive-title" className={title}>
      {data.title}
    </h3>
    <p className={intro}>{data.intro}</p>
    {data.infoRows.map(({ label: l, value: v }) => (
      <Row key={l} l={l} v={v} />
    ))}
  </section>
);

export default memo(Arrive);
