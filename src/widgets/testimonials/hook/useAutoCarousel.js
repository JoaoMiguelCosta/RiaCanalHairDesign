// src/widgets/testimonials/hook/useAutoCarousel.js
import { useCallback, useMemo, useState } from "react";
import { useInViewport } from "@shared/lib/useInViewport";
import { usePageVisibility } from "@shared/lib/usePageVisibility";

/**
 * Estado do carrossel de testemunhos: índice ativo + se o tempo está a correr.
 *
 * O tempo de apresentação NÃO é contado em JavaScript: é a animação CSS da
 * barra de progresso do cartão ativo que o mede. Quando termina
 * (`animationend`), o componente chama `advance()`. Pausar = colocar a
 * animação em `animation-play-state: paused`, o que congela o progresso e
 * preserva o tempo restante sem timers nem renders por frame.
 *
 * Motivos de pausa independentes (o tempo só corre sem nenhum):
 *  - enabled=false → pausa explícita do utilizador / movimento reduzido;
 *  - hover         → ponteiro (rato/caneta) sobre a secção;
 *  - focus         → foco de teclado (:focus-visible) dentro da secção;
 *  - offscreen     → secção totalmente fora do viewport;
 *  - pageHidden    → separador em segundo plano.
 */
export function useAutoCarousel(total, { rootRef, enabled = true, startIndex = 0 } = {}) {
  const [activeIndex, setActiveIndex] = useState(startIndex);
  const [hover, setHover] = useState(false);
  const [focus, setFocus] = useState(false);
  const inView = useInViewport(rootRef);
  const pageVisible = usePageVisibility();

  const running =
    enabled && total > 1 && !hover && !focus && inView && pageVisible;

  // Updater puro: sem efeitos secundários
  const advance = useCallback(() => {
    if (total > 1) setActiveIndex((i) => (i + 1) % total);
  }, [total]);

  const pauseHandlers = useMemo(
    () => ({
      onPointerEnter: (e) => {
        if (e.pointerType !== "touch") setHover(true);
      },
      onPointerLeave: (e) => {
        if (e.pointerType !== "touch") setHover(false);
      },
      // Só o foco de teclado pausa: um clique de rato no botão Pausar/Retomar
      // também foca o botão e não deve impedir a retoma pedida.
      onFocus: (e) => setFocus(e.target.matches?.(":focus-visible") ?? true),
      onBlur: (e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) setFocus(false);
      },
    }),
    []
  );

  return { activeIndex, running, advance, pauseHandlers };
}
