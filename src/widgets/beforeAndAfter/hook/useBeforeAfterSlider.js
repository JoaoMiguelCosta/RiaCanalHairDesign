// src/widgets/beforeAndAfter/hook/useBeforeAfterSlider.js
import { useRef, useState, useCallback, useEffect, useMemo } from "react";

/**
 * Lógica do slider Antes/Depois.
 * Mantém exatamente o comportamento do componente original:
 * - percent arrasta com rato/toque/tecla
 * - autoplay com pausa e reset
 * - pausa ao sair do viewport (IntersectionObserver)
 * - pausa opcional em hover/focus
 */
export function useBeforeAfterSlider({
  auto = true,
  speed = 20, // intervalo do setInterval (ms)
  pauseOnHover = true,
  startPercent = 50,
} = {}) {
  const containerRef = useRef(null);
  const [percent, setPercent] = useState(startPercent);
  const [paused, setPaused] = useState(false);
  const timeoutRef = useRef(null); // limpa o setTimeout da pausa

  const setFromClientX = useCallback((clientX) => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = Math.min(Math.max(clientX - rect.left, 0), rect.width);
    setPercent(Math.round((x / rect.width) * 100));
  }, []);

  // Handlers de mouse/touch estabilizados
  const onMouseDown = useCallback(
    (e) => {
      e.preventDefault();
      setFromClientX(e.clientX);

      const onMove = (ev) => setFromClientX(ev.clientX);
      const onUp = () => {
        window.removeEventListener("mousemove", onMove);
        window.removeEventListener("mouseup", onUp);
      };

      window.addEventListener("mousemove", onMove);
      window.addEventListener("mouseup", onUp);
    },
    [setFromClientX]
  );

  const onTouchStart = useCallback(
    (e) => setFromClientX(e.touches[0].clientX),
    [setFromClientX]
  );

  const onTouchMove = useCallback(
    (e) => setFromClientX(e.touches[0].clientX),
    [setFromClientX]
  );

  const onKeyDown = useCallback((e) => {
    if (e.key === "ArrowLeft") setPercent((p) => Math.max(0, p - 2));
    if (e.key === "ArrowRight") setPercent((p) => Math.min(100, p + 2));
  }, []);

  // autoplay: revela "depois" e recomeça do zero após pequena pausa
  useEffect(() => {
    if (!auto || paused) return;

    const id = setInterval(() => {
      setPercent((p) => {
        let next = p + 0.7;
        if (next >= 100) {
          next = 100;
          clearInterval(id);
          setPaused(true);
          timeoutRef.current = setTimeout(() => {
            setPercent(0);
            setPaused(false);
          }, 1500);
        }
        return next;
      });
    }, speed);

    return () => {
      clearInterval(id);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [auto, paused, speed]);

  // pausa autoplay quando sai do viewport
  useEffect(() => {
    const el = containerRef.current;
    if (!el || !auto) return;
    const observer = new IntersectionObserver(
      ([entry]) => setPaused(!entry.isIntersecting),
      { threshold: 0.2 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [auto]);

  const hoverHandlers = useMemo(
    () =>
      pauseOnHover
        ? {
            onMouseEnter: () => setPaused(true),
            onMouseLeave: () => setPaused(false),
            onFocus: () => setPaused(true),
            onBlur: () => setPaused(false),
          }
        : {},
    [pauseOnHover]
  );

  return {
    containerRef,
    percent,
    onMouseDown,
    onTouchStart,
    onTouchMove,
    onKeyDown,
    hoverHandlers,
  };
}
