import { useCallback, useEffect, useRef } from "react";

// Sem suporte de :focus-visible, conta qualquer foco (comportamento anterior)
const isFocusVisible = (el) => {
  try {
    return el.matches(":focus-visible");
  } catch {
    return true;
  }
};

/**
 * Avança para o conjunto seguinte (`next()`) após `delay` ms ininterruptos em
 * que a rotação é permitida. Motivos de pausa independentes:
 *  - enabled=false → pausa explícita, movimento reduzido ou um só conjunto;
 *  - hover         → ponteiro (rato/caneta) sobre a secção;
 *  - focus         → foco de teclado (:focus-visible) dentro da secção; o foco
 *                    que o clique de rato deixa num botão não conta (o hover
 *                    já cobre esse caso e, ao sair, a rotação retoma, como em
 *                    browsers que não focam botões no clique);
 *  - offscreen     → secção fora do viewport;
 *  - hidden        → separador/página oculto (document.visibilityState).
 * Um único setTimeout; é reiniciado sempre que um motivo muda e sempre que o
 * conjunto ativo muda (`resetKey`), pelo que uma navegação manual nunca é
 * seguida de uma rotação imediata.
 */
export function useAutoRotateSets({
  enabled,
  next,
  delay = 5000,
  rootRef,
  resetKey,
}) {
  const reasonsRef = useRef({
    enabled,
    hover: false,
    focus: false,
    offscreen: true,
    hidden: false,
  });
  const timerRef = useRef(0);
  const nextRef = useRef(next);

  useEffect(() => {
    nextRef.current = next;
  }, [next]);

  const schedule = useCallback(() => {
    clearTimeout(timerRef.current);
    timerRef.current = 0;
    const r = reasonsRef.current;
    if (!r.enabled || r.hover || r.focus || r.offscreen || r.hidden) return;
    timerRef.current = setTimeout(() => {
      timerRef.current = 0;
      nextRef.current(); // a mudança de resetKey volta a agendar
    }, delay);
  }, [delay]);

  const setReason = useCallback(
    (key, value) => {
      if (reasonsRef.current[key] === value) return;
      reasonsRef.current[key] = value;
      schedule();
    },
    [schedule]
  );

  // enabled / conjunto ativo; a limpeza cobre a desmontagem
  useEffect(() => {
    reasonsRef.current.enabled = enabled;
    schedule();
    return () => clearTimeout(timerRef.current);
  }, [enabled, resetKey, schedule]);

  // visibilidade
  useEffect(() => {
    const el = rootRef?.current;
    const reasons = reasonsRef.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      setReason("offscreen", false);
      return;
    }
    const io = new IntersectionObserver(
      ([e]) => setReason("offscreen", !e.isIntersecting),
      { threshold: 0.2 }
    );
    io.observe(el);
    return () => {
      io.disconnect();
      reasons.offscreen = true;
    };
  }, [rootRef, setReason]);

  // separador oculto: sem rotação em segundo plano (retoma ao voltar, com um
  // intervalo completo, como nos restantes motivos)
  useEffect(() => {
    if (typeof document === "undefined") return;
    const update = () => setReason("hidden", document.visibilityState === "hidden");
    update();
    document.addEventListener("visibilitychange", update);
    return () => document.removeEventListener("visibilitychange", update);
  }, [setReason]);

  const pauseHandlers = {
    onPointerEnter: (e) => {
      if (e.pointerType !== "touch") setReason("hover", true);
    },
    onPointerLeave: (e) => {
      if (e.pointerType !== "touch") setReason("hover", false);
    },
    onFocus: (e) => setReason("focus", isFocusVisible(e.target)),
    onBlur: (e) => {
      if (!e.currentTarget.contains(e.relatedTarget)) setReason("focus", false);
    },
  };

  return { pauseHandlers };
}
