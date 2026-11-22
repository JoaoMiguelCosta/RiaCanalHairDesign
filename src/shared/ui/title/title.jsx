import styles from "./title.module.css";

/**
 * Título de secção com duas linhas estilizadas.
 * - `as`: elemento semântico (por defeito "h2"; usar "h3" em subsecções ou
 *   "p" quando o texto é decorativo/slogan e não um título de conteúdo).
 * - `id`, `className` e restantes atributos HTML são encaminhados.
 */
const Title = ({
  line1,
  line2,
  variant = "default",
  as = "h2",
  className,
  ...rest
}) => {
  const Tag = as;
  const customTitle =
    variant === "highlight" ? styles.highlight : styles.default;

  return (
    <Tag
      className={className ? `${customTitle} ${className}` : customTitle}
      {...rest}
    >
      {line1 && <span className={styles.span1}>{line1}</span>}
      {line2 && <span className={styles.span2}>{line2}</span>}
    </Tag>
  );
};

export default Title;
