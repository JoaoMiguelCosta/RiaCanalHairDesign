import { useEffect, useRef, useState } from "react";

/**
 * Chama `next()` de X em X ms quando:
 * - enabled = true
 * - a secção está visível no viewport
 * Pausa em hover/focus.
 */
export function useAutoRotateSets({ enabled, next, delay = 5000, rootRef }) {
  const [paused, setPaused] = useState(false);
  const visibleRef = useRef(true); // assume visível ao início

  // pausa por hover/focus
  const hoverHandlers = {
    onMouseEnter: () => setPaused(true),
    onMouseLeave: () => setPaused(false),
    onFocus: () => setPaused(true),
    onBlur: () => setPaused(false),
  };

  // pausa quando sai do viewport
  useEffect(() => {
    if (!rootRef?.current) return;
    const io = new IntersectionObserver(
      ([e]) => (visibleRef.current = e.isIntersecting),
      { threshold: 0.2 }
    );
    io.observe(rootRef.current);
    return () => io.disconnect();
  }, [rootRef]);

  // intervalo
  useEffect(() => {
    if (!enabled) return;
    const id = setInterval(() => {
      if (!paused && visibleRef.current) next();
    }, delay);
    return () => clearInterval(id);
  }, [enabled, paused, delay, next]);

  return { hoverHandlers };
}
