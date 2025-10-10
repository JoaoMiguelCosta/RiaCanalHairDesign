// src/widgets/testimonials/ui/testimonials.jsx
import { useMemo } from "react";
import styles from "./testimonials.module.css";

import Title from "@shared/ui/title/title.jsx";
import Subtitle from "@shared/ui/subtitle/subtitle.jsx";
import Text from "@shared/ui/text/text.jsx";
import TestimonialCard from "@widgets/testimonials/parts/testimonialcard/testimonialCard.jsx";
import TestimonialData from "@content/testimonials/testimonials.json";
import { useAutoCarousel } from "@widgets/testimonials/hook/useAutoCarousel";


const DURATION_MS = 3000; // 3s por card (0 → 100%)
const TICK_MS = 100;

const Testimonials = () => {
  const total = TestimonialData.length;

  const { activeIndex, progress } = useAutoCarousel(total, {
    durationMs: DURATION_MS,
    tickMs: TICK_MS,
  });

  const active = useMemo(
    () => TestimonialData[activeIndex] || {},
    [activeIndex]
  );

  return (
    <div id="Testimonials" className={styles.testemunhos}>
      <Subtitle variant="default">EXPERIÊNCIAS REAIS</Subtitle>
      <Title line1="O Que Dizem" line2="Sobre Nós" variant="highlight" />

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
            quote={t.quote}
            author={t.author}
            service={t.service}
            location={t.location}
            isActive={idx === activeIndex}
            progress={idx === activeIndex ? progress : 0}
          />
        ))}
      </div>

      {/* Bolinhas (acima do quote dinâmico) */}
      <div className={styles.balls} role="tablist" aria-label="Testemunhos">
        {TestimonialData.map((_, idx) => (
          <span
            key={idx}
            className={`${styles.dot} ${
              idx === activeIndex ? styles.activeDot : ""
            }`}
            aria-selected={idx === activeIndex}
          >
            •
          </span>
        ))}
      </div>

      {/* Conteúdo destacado sincronizado com o card ativo */}
      <div className={styles.quoteHighlighted}>
        <span>“{active?.quote || ""}”</span>
      </div>
      <div className={styles.authorHighlighted}>
        <span>{active?.author || ""}</span>
      </div>
      <div className={styles.serviceLocationHighlighted}>
        <span>
          {active?.service ? `${active.service} · ` : ""}
          {active?.location || ""}
        </span>
      </div>
    </div>
  );
};

export default Testimonials;
