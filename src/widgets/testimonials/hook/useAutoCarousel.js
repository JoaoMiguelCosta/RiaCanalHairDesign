// src/widgets/testimonials/hooks/useAutoCarousel.js
import { useEffect, useMemo, useRef, useState } from "react";

/**
 * Controla autoplay + progresso (0–100) de um carrossel.
 * Mantém a mesma lógica do componente original (reinicia o timer ao mudar o índice).
 */
export function useAutoCarousel(
  total,
  { durationMs = 3000, tickMs = 100, startIndex = 0 } = {}
) {
  const [activeIndex, setActiveIndex] = useState(startIndex);
  const [progress, setProgress] = useState(0); // 0–100
  const timerRef = useRef(null);

  // Pré-calcula passos e incremento (tal como no componente original)
  const { steps, inc } = useMemo(() => {
    const s = Math.ceil(durationMs / tickMs);
    return { steps: s, inc: 100 / s };
  }, [durationMs, tickMs]);

  const clearTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  // autoplay + progresso (reinicia quando activeIndex muda)
  useEffect(() => {
    if (!total) return;

    clearTimer();
    setProgress(0);

    timerRef.current = setInterval(() => {
      setProgress((p) => {
        if (p + inc >= 100) {
          const next = (activeIndex + 1) % total;
          setActiveIndex(next);
          return 0;
        }
        return p + inc;
      });
    }, tickMs);

    return clearTimer;
  }, [activeIndex, inc, tickMs, total]);

  return { activeIndex, progress, setActiveIndex, steps, inc };
}
