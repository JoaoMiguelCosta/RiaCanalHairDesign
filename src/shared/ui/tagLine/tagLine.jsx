import styles from "./tagLine.module.css";

// Classes por variante: os consumidores escolhem a variante, não os nomes
// internos do CSS Module.
const VARIANTS = {
  default: { tagline: styles.tagline, brand: styles.brand, service: styles.service },
  footer: {
    tagline: styles.taglineFooter,
    brand: styles.brandFooter,
    service: styles.serviceFooter,
  },
};

const TagLine = ({ variant = "default" }) => {
  const cls = VARIANTS[variant] || VARIANTS.default;
  return (
    // Sem role="text" (papel inexistente em WAI-ARIA) nem aria-label numa <div>
    // genérica: o texto visível já fornece o nome da marca.
    <div className={cls.tagline}>
      <span className={cls.brand}>Ria Canal</span>{" "}
      {/* espaço invisível (contentor flex): separa as palavras no texto
          acessível ("Ria Canal HAIRDESIGN", não "Ria CanalHAIRDESIGN") */}
      <span className={cls.service}>HAIRDESIGN</span>
    </div>
  );
};

export default TagLine;
