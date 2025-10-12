// src/widgets/beforeAndAfter/hook/useBeforeAfterSlider.js
import { useRef, useState, useCallback, useEffect, useMemo } from "react";

/**
 * Slider Antes/Depois com autoplay em loop:
 * - Avança enquanto !paused
 * - Ao chegar a 100%, pausa
 * - Após 1.5s, faz reset para 0 e retoma
 * - Pausa em hover/focus e quando sai do viewport
 */
export function useBeforeAfterSlider({
  auto = true,
  speed = 20, // ms do setInterval
  pauseOnHover = true,
  startPercent = 50,
} = {}) {
  const containerRef = useRef(null);
  const [percent, setPercent] = useState(startPercent);
  const [paused, setPaused] = useState(false);
  const timeoutRef = useRef(null); // controla apenas o reset

  const setFromClientX = useCallback((clientX) => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = Math.min(Math.max(clientX - rect.left, 0), rect.width);
    setPercent(Math.round((x / rect.width) * 100));
  }, []);

  // Arrastar com rato
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

  // Toque
  const onTouchStart = useCallback(
    (e) => setFromClientX(e.touches[0].clientX),
    [setFromClientX]
  );
  const onTouchMove = useCallback(
    (e) => setFromClientX(e.touches[0].clientX),
    [setFromClientX]
  );

  // Teclado
  const onKeyDown = useCallback((e) => {
    if (e.key === "ArrowLeft") setPercent((p) => Math.max(0, p - 2));
    if (e.key === "ArrowRight") setPercent((p) => Math.min(100, p + 2));
  }, []);

  // 1) Avança automaticamente enquanto NÃO está em pausa
  useEffect(() => {
    if (!auto || paused) return;
    const id = setInterval(() => {
      setPercent((p) => (p >= 100 ? 100 : p + 0.7));
    }, speed);
    return () => clearInterval(id);
  }, [auto, paused, speed]);

  // 2) Quando chega a 100%, ativa pausa
  useEffect(() => {
    if (!auto) return;
    if (percent >= 100 && !paused) setPaused(true);
  }, [auto, percent, paused]);

  // 3) Quando pausado, agenda reset e retoma
  useEffect(() => {
    if (!auto || !paused) return;
    timeoutRef.current = setTimeout(() => {
      setPercent(0);
      setPaused(false);
    }, 1500);
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [auto, paused]);

  // Pausa quando sai do viewport
  useEffect(() => {
    const el = containerRef.current;
    if (!el || !auto) return;
    const observer = new IntersectionObserver(
      ([entry]) => setPaused((p) => (entry.isIntersecting ? p : true)),
      { threshold: 0.05 } // mais permissivo para prod
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [auto]);

  // Pausa em hover/focus (opcional)
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
