// src/widgets/beforeAndAfter/ui/beforeAndAfter.jsx
import { useMemo, useState } from "react";
import styles from "./beforeAndAfter.module.css";

import Subtitle from "@shared/ui/subtitle/subtitle.jsx";
import Title from "@shared/ui/title/title.jsx";
import Text from "@shared/ui/text/text.jsx";
import Icon from "@shared/ui/icons/icons.jsx";
import Button from "@shared/ui/button/button.jsx";
import Quote from "@shared/ui/quote/quote.jsx";

// Card vive em parts/card (mantém esta estrutura para evitar conflitos)
import Card from "@widgets/beforeAndAfter/parts/card/card.jsx";

// ✅ caminho e case corretos
import BeforeAfter from "@content/gallery/beforeAfter.js";

const BeforeAndAfterSection = () => {
  const totalItems = Array.isArray(BeforeAfter) ? BeforeAfter.length : 0;
  const itemsPerPage = 3;
  const totalSets = Math.ceil(totalItems / itemsPerPage);

  const [activeSet, setActiveSet] = useState(0);
  const hasPagination = totalSets > 1;

  const next = () => {
    if (!hasPagination) return;
    setActiveSet((p) => (p + 1) % totalSets);
  };

  const prev = () => {
    if (!hasPagination) return;
    setActiveSet((p) => (p - 1 + totalSets) % totalSets);
  };

  const visible = useMemo(() => {
    const start = activeSet * itemsPerPage;
    return BeforeAfter.slice(start, start + itemsPerPage);
  }, [activeSet]);

  return (
    <section id="Transformations" className={styles.beforeandafter}>
      <Subtitle>RESULTADOS REAIS</Subtitle>
      <Title line1="Transformações" line2="Reais" variant="highlight" />
      <Text className={styles.aboutText} variant="centerMobile">
        <span>
          Antes e depois de clientes que confiaram no nosso olhar técnico e
          artístico.
        </span>
      </Text>

      {hasPagination && (
        <div className={styles.arrows}>
          <Button
            className={styles.leftandright}
            onClick={prev}
            aria-label="Anterior"
          >
            <Icon name="arrowLeft" className={styles.arrowIcon} />
          </Button>

          <div className={styles.dots}>
            {Array.from({ length: totalSets }).map((_, i) => (
              <Button
                key={i}
                className={`${styles.dot} ${i === activeSet ? styles.dotActive : ""}`}
                onClick={() => setActiveSet(i)}
                aria-label={`Mostrar conjunto ${i + 1}`}
              />
            ))}
          </div>

          <Button
            className={styles.leftandright}
            onClick={next}
            aria-label="Seguinte"
          >
            <Icon name="arrowRight" className={styles.arrowIcon} />
          </Button>
        </div>
      )}

      <div className={styles.beforeandafterphotos}>
        {visible.map((c, idx) => (
          <Card
            key={`${activeSet}-${idx}-${c?.title ?? "item"}`}
            beforeSrc={c.before}
            afterSrc={c.after}
            title={c.title}
            caption={c.caption}
          />
        ))}

        {totalItems === 0 && (
          <Text variant="centerMobile">
            Ainda não há transformações para mostrar.
          </Text>
        )}
      </div>

      <Quote variant="default">
        "A beleza começa no momento em que decides ser tu mesma."
      </Quote>
    </section>
  );
};

export default BeforeAndAfterSection;
