// src/widgets/beforeAndAfter/ui/beforeAndAfter.jsx
import { memo, useCallback, useRef, useState } from "react";
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
import { useAutoRotateSets } from "@widgets/beforeAndAfter/hook/useAutoRotateSets";
import { usePrefersReducedMotion } from "@shared/lib/usePrefersReducedMotion";

const {
  beforeAfter,
  introText,
  controls,
  navButton,
  arrowIcon,
  dotGroup,
  dot,
  dotActive,
  nextGroup,
  pauseButton,
  cardGrid,
} = styles;

const ITEMS_PER_PAGE = 3;

const BeforeAndAfterSection = () => {
  const sectionRef = useRef(null);

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

  // Movimento automático (varrimento dos sliders + rotação dos conjuntos):
  // com movimento reduzido começa pausado; a escolha explícita do utilizador
  // (botão Pausar/Retomar) prevalece e persiste até nova ação. Os controlos
  // manuais funcionam sempre.
  const reducedMotion = usePrefersReducedMotion();
  const [userPaused, setUserPaused] = useState(null);
  const paused = userPaused ?? reducedMotion;

  // Um ajuste manual numa comparação mantém o conjunto visível (sem hover em
  // ecrãs táteis, a rotação trocaria os cartões e perderia o ajuste) até o
  // utilizador navegar entre conjuntos ou carregar em Retomar.
  const [holdSet, setHoldSet] = useState(false);
  const holdCurrentSet = useCallback(() => setHoldSet(true), []);
  const navigate = (fn) => () => {
    setHoldSet(false);
    fn();
  };
  // Cada "Retomar" explícito devolve o autoplay também aos cartões ajustados
  const [resumeSignal, setResumeSignal] = useState(0);
  const togglePaused = () => {
    if (paused) {
      setHoldSet(false);
      setResumeSignal((n) => n + 1);
    }
    setUserPaused(!paused);
  };

  // Auto-rotação entre conjuntos (6s). Pausa em hover/focus e quando não está visível.
  const { pauseHandlers } = useAutoRotateSets({
    enabled: hasPagination && !paused && !holdSet,
    next,
    delay: 6000,
    rootRef: sectionRef,
    resetKey: activeSet,
  });

  return (
    <section
      ref={sectionRef}
      id="Transformations"
      className={beforeAfter}
      aria-labelledby="Transformations-title"
      {...pauseHandlers}
    >
      <Subtitle>RESULTADOS REAIS</Subtitle>
      <Title
        id="Transformations-title"
        line1="Transformações"
        line2="Reais"
        variant="highlight"
      />
      <Text className={introText} variant="centerMobile">
        <span>
          Antes e depois de clientes que confiaram no nosso olhar técnico e
          artístico.
        </span>
      </Text>

      {totalItems > 0 && (
        <div className={controls}>
          {hasPagination && (
            <>
              <Button
                className={navButton}
                onClick={navigate(prev)}
                aria-label="Conjunto anterior"
              >
                <Icon
                  name="arrowLeft"
                  className={arrowIcon}
                  aria-hidden="true"
                  focusable="false"
                />
              </Button>

              {/* Alvos de 24×24 px; a bolinha visual (8px) é um ::before */}
              <div className={dotGroup}>
                {Array.from({ length: totalSets }).map((_, i) => (
                  <Button
                    key={i}
                    className={`${dot} ${i === activeSet ? dotActive : ""}`}
                    onClick={navigate(() => setActiveSet(i))}
                    aria-label={`Conjunto ${i + 1} de ${totalSets}`}
                    aria-current={i === activeSet ? "true" : undefined}
                  />
                ))}
              </div>
            </>
          )}

          {/* O botão de pausa fica à direita sem deslocar o centro da linha */}
          <div className={nextGroup}>
            {hasPagination && (
              <Button
                className={navButton}
                onClick={navigate(next)}
                aria-label="Conjunto seguinte"
              >
                <Icon
                  name="arrowRight"
                  className={arrowIcon}
                  aria-hidden="true"
                  focusable="false"
                />
              </Button>
            )}
            <button
              type="button"
              className={pauseButton}
              onClick={togglePaused}
              aria-label={
                paused
                  ? "Retomar animação das transformações"
                  : "Pausar animação das transformações"
              }
              title={paused ? "Retomar" : "Pausar"}
            >
              <Icon
                name={paused ? "play" : "pause"}
                aria-hidden="true"
                focusable="false"
              />
            </button>
          </div>
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
            autoplay={!paused}
            onManualChange={holdCurrentSet}
            resumeSignal={resumeSignal}
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
