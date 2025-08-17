import { useState, useMemo } from "react";
import styles from "./BeforeAndAfter.module.css";
import Subtitle from "../../components/Subtitle/Subtitle.jsx";
import Title from "../../components/Title/Title.jsx";
import Text from "../../components/Text/Text.jsx";
import Icon from "../../components/Icons/Icons.jsx";
import Card from "./Card/Card.jsx";
import FotoVanesa from "../../assets/TeamandServices/FotoVanessa.jpg";
import Button from "../../components/Button/Button.jsx";
import Quote from "../../components/Quote/Quote.jsx";

const BeforeAndAfter = () => {
  const totalSets = 3; // total de conjuntos de 3 cards
  const [activeSet, setActiveSet] = useState(0); // começa no primeiro conjunto

  const next = () => setActiveSet((prev) => (prev + 1) % totalSets);
  const prev = () => setActiveSet((prev) => (prev - 1 + totalSets) % totalSets);

  // Cards simulados (3 por conjunto)
  const items = useMemo(
    () =>
      Array.from({ length: totalSets * 3 }).map((_, i) => ({
        before: FotoVanesa,
        after: FotoVanesa,
        title: `Balayage ${i + 1}`,
        caption:
          "Técnica francesa que cria reflexos naturais e luminosos, respeitando o movimento do cabelo",
      })),
    []
  );

  const visible = items.slice(activeSet * 3, activeSet * 3 + 3);

  return (
    <div id="Transformations" className={styles.beforeandafter}>
      <Subtitle>RESULTADOS REAIS</Subtitle>
      <Title line1="Transformações" line2="Reais" variant="highlight" />
      <Text className={styles.aboutText} variant="centerMobile">
        <span>
          Antes e depois de clientes que confiaram no nosso olhar técnico e
          artístico.
        </span>
      </Text>

      <div className={styles.arrows}>
        <Button
          button={styles.leftandright}
          onClick={prev}
          aria-label="Anterior"
        >
          <Icon name="arrowLeft" className={styles.arrowIcon} />
        </Button>

        <div className={styles.dots}>
          {Array.from({ length: totalSets }).map((_, i) => (
            <Button
              key={i}
              button={`${styles.dot} ${i === activeSet ? styles.dotActive : ""}`}
              onClick={() => setActiveSet(i)}
              aria-label={`Mostrar conjunto ${i + 1}`}
            />
          ))}
        </div>

        <Button
          button={styles.leftandright}
          onClick={next}
          aria-label="Seguinte"
        >
          <Icon name="arrowRight" className={styles.arrowIcon} />
        </Button>
      </div>

      <div className={styles.beforandafterphotos}>
        {visible.map((c, idx) => (
          <Card
            key={`${activeSet}-${idx}`}
            beforeSrc={c.before}
            afterSrc={c.after}
            title={c.title}
            caption={c.caption}
          />
        ))}
      </div>
      <Quote variante="default">
        "A beleza começa no momento em que decides ser tu mesma."
      </Quote>
    </div>
  );
};

export default BeforeAndAfter;
