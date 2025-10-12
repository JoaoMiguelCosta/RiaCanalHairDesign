// src/widgets/beforeAndAfter/ui/beforeAndAfter.jsx
import { memo } from "react";
import styles from "./beforeAndAfter.module.css";

import Subtitle from "@shared/ui/subtitle/subtitle.jsx";
import Title from "@shared/ui/title/title.jsx";
import Text from "@shared/ui/text/text.jsx";
import Icon from "@shared/ui/icons/icons.jsx";
import Button from "@shared/ui/button/button.jsx";
import Quote from "@shared/ui/quote/quote.jsx";

import Card from "@widgets/beforeAndAfter/parts/card/card.jsx";
import BeforeAfter from "@content/gallery/beforeAfter.js";
import { usePagedSets } from "@widgets/beforeAndAfter/hook/usePagedSets";

const {
  beforeAfter, // was beforeandafter
  introText, // was aboutText
  controls, // was arrows
  navButton, // was leftandright
  arrowIcon, // unchanged
  dotGroup, // was dots
  dot, // unchanged
  dotActive, // unchanged
  cardGrid, // was beforeandafterphotos
} = styles;

const ITEMS_PER_PAGE = 3;

const BeforeAndAfterSection = () => {
  const {
    totalItems,
    totalSets,
    hasPagination,
    activeSet,
    setActiveSet,
    next,
    prev,
    visible,
  } = usePagedSets(BeforeAfter, ITEMS_PER_PAGE);

  return (
    <section
      id="Transformations"
      className={beforeAfter}
      aria-labelledby="ba-title"
    >
      <Subtitle>RESULTADOS REAIS</Subtitle>
      <Title line1="Transformações" line2="Reais" variant="highlight" />
      <Text className={introText} variant="centerMobile">
        <span>
          Antes e depois de clientes que confiaram no nosso olhar técnico e
          artístico.
        </span>
      </Text>

      {hasPagination && (
        <div className={controls}>
          <Button className={navButton} onClick={prev} aria-label="Anterior">
            <Icon name="arrowLeft" className={arrowIcon} />
          </Button>

          <div className={dotGroup}>
            {Array.from({ length: totalSets }).map((_, i) => (
              <Button
                key={i}
                className={`${dot} ${i === activeSet ? dotActive : ""}`}
                onClick={() => setActiveSet(i)}
                aria-label={`Mostrar conjunto ${i + 1}`}
              />
            ))}
          </div>

          <Button className={navButton} onClick={next} aria-label="Seguinte">
            <Icon name="arrowRight" className={arrowIcon} />
          </Button>
        </div>
      )}

      <div className={cardGrid}>
        {visible.map((c, idx) => (
          <Card
            key={`${activeSet}-${idx}-${c?.title ?? "item"}`}
            beforeSrc={c.before}
            afterSrc={c.after}
            title={c.title}
            caption={c.caption}
            /* A11y + performance, sem alterar UI/fluxo */
            beforeAlt={c.title ? `Antes — ${c.title}` : "Antes"}
            afterAlt={c.title ? `Depois — ${c.title}` : "Depois"}
            imgLoading="lazy"
            imgDecoding="async"
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

export default memo(BeforeAndAfterSection);
