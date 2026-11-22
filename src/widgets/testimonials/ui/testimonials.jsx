// src/widgets/testimonials/ui/testimonials.jsx
import { useRef, useState } from "react";
import styles from "./testimonials.module.css";

import Title from "@shared/ui/title/title.jsx";
import Subtitle from "@shared/ui/subtitle/subtitle.jsx";
import Text from "@shared/ui/text/text.jsx";
import Icon from "@shared/ui/icons/icons.jsx";
import { usePrefersReducedMotion } from "@shared/lib/usePrefersReducedMotion";
import TestimonialCard from "@widgets/testimonials/parts/testimonialcard/testimonialCard.jsx";
import TestimonialData from "@content/testimonials/testimonials.json";
import { useAutoCarousel } from "@widgets/testimonials/hook/useAutoCarousel";

// 3s por card (0 → 100%), medidos pela animação CSS da barra de progresso
const DURATION_MS = 3000;

// Os textos do JSON já trazem aspas tipográficas; a apresentação acrescenta
// as suas (::before/::after dourados no cartão, “…” no destaque). Retira as
// aspas exteriores do dado só na renderização, para não as mostrar em dobro.
const unquote = (text = "") =>
  text.replace(/^\s*[“”"«]\s*/, "").replace(/\s*[“”"»]\s*$/, "");

const Testimonials = () => {
  const total = TestimonialData.length;

  // Pausa (WCAG 2.2.2): escolha explícita do utilizador; sem escolha, a
  // rotação começa pausada quando o sistema pede movimento reduzido.
  const reducedMotion = usePrefersReducedMotion();
  const [userPaused, setUserPaused] = useState(null);
  const paused = userPaused ?? reducedMotion;

  const sectionRef = useRef(null);
  const { activeIndex, running, advance, pauseHandlers } = useAutoCarousel(
    total,
    { rootRef: sectionRef, enabled: !paused }
  );

  const active = TestimonialData[activeIndex] ?? {};

  return (
    <section
      id="Testimonials"
      className={styles.testemunhos}
      aria-labelledby="Testimonials-title"
      ref={sectionRef}
      {...pauseHandlers}
    >
      <Subtitle variant="default">EXPERIÊNCIAS REAIS</Subtitle>
      <Title
        id="Testimonials-title"
        line1="O Que Dizem"
        line2="Sobre Nós"
        variant="highlight"
      />

      <Text className={styles.aboutText} variant="centerMobile">
        <span>
          Siga-nos para ver o nosso dia a dia, bastidores, transformações e
          inspiração real.
        </span>
      </Text>

      <div className={styles.testemunhos2}>
        {TestimonialData.map((t, idx) => (
          <TestimonialCard
            key={`${t.author}-${t.service}-${idx}`}
            quote={unquote(t.quote)}
            author={t.author}
            service={t.service}
            location={t.location}
            isActive={idx === activeIndex}
            running={idx === activeIndex && running}
            durationMs={DURATION_MS}
            onProgressEnd={idx === activeIndex ? advance : undefined}
          />
        ))}
      </div>

      {/* O botão de pausa é posicionado à direita das bolinhas sem alterar a
          sua posição nem a altura da linha */}
      <div className={styles.carouselControls}>
        {/* Bolinhas (acima do quote dinâmico): indicador visual apenas, não
            interativo; os testemunhos estão todos legíveis nos cards acima. */}
        <div className={styles.balls} aria-hidden="true">
          {TestimonialData.map((_, idx) => (
            <span
              key={idx}
              className={`${styles.dot} ${
                idx === activeIndex ? styles.activeDot : ""
              }`}
            >
              •
            </span>
          ))}
        </div>

        <button
          type="button"
          className={styles.pauseButton}
          onClick={() => setUserPaused(!paused)}
          aria-label={
            paused
              ? "Retomar rotação dos testemunhos"
              : "Pausar rotação dos testemunhos"
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

      {/* Conteúdo destacado sincronizado com o card ativo */}
      <div className={styles.quoteHighlighted}>
        <span>“{unquote(active.quote)}”</span>
      </div>
      <div className={styles.authorHighlighted}>
        <span>{active.author || ""}</span>
      </div>
      <div className={styles.serviceLocationHighlighted}>
        <span>
          {active.service ? `${active.service} · ` : ""}
          {active.location || ""}
        </span>
      </div>
    </section>
  );
};

export default Testimonials;
