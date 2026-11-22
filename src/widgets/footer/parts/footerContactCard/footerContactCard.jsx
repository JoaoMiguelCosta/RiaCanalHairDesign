// src/widgets/footer/parts/footerContactCard/footerContactCard.jsx
import { memo } from "react";
import styles from "./footerContactCard.module.css";
import Icon from "@shared/ui/icons/icons.jsx";
import data from "@content/footer/contact.json";

const TextOrLink = ({ type, href, content, external }) =>
  type === "link" ? (
    <a
      href={href}
      className={styles.text}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
    >
      {content}
    </a>
  ) : (
    <span className={styles.text}>{content}</span>
  );

const FooterContactCard = () => (
  <div className={styles.info}>
    <h2 className={styles.title}>{data.title}</h2>

    <ul className={styles.list}>
      {(data.contacts ?? []).map(({ icon, ...rest }, idx) => (
        <li key={idx} className={styles.item}>
          <Icon name={icon} className={styles.icon} />
          <TextOrLink {...rest} />
        </li>
      ))}
    </ul>
  </div>
);

export default memo(FooterContactCard);
