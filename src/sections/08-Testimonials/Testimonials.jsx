import { useEffect, useMemo, useRef, useState } from "react";
import styles from "./Testimonials.module.css";
import Title from "../../components/Title/Title.jsx";
import Subtitle from "../../components/Subtitle/Subtitle.jsx";
import Text from "../../components/Text/Text.jsx";
import TestimonialCard from "./Card/TestimonialCard.jsx";
import TestimonialData from "../../data/TestimonialData.js";

const DURATION_MS = 3000; // 3s por card (0 → 100%)
const TICK_MS = 100;

const Testimonials = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [progress, setProgress] = useState(0); // 0–100
  const timerRef = useRef(null);

  const active = useMemo(
    () => TestimonialData[activeIndex] || {},
    [activeIndex]
  );

  // autoplay + progresso
  useEffect(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    setProgress(0);

    const steps = Math.ceil(DURATION_MS / TICK_MS);
    const inc = 100 / steps;

    timerRef.current = setInterval(() => {
      setProgress((p) => {
        if (p + inc >= 100) {
          const next = (activeIndex + 1) % TestimonialData.length;
          setActiveIndex(next);
          return 0;
        }
        return p + inc;
      });
    }, TICK_MS);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [activeIndex]);

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
            className={`${styles.dot} ${idx === activeIndex ? styles.activeDot : ""}`}
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
