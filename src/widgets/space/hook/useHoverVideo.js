// src/widgets/space/hook/useHoverVideo.js
import { useRef, useCallback, useMemo } from "react";

/**
 * Controla reprodução de vídeo em hover/focus (play) e mouseleave/blur/touch-end (pause + reset).
 * Mantém exatamente o comportamento original do FacilityCard.
 */
export function useHoverVideo() {
  const videoRef = useRef(null);

  const play = useCallback(() => {
    const el = videoRef.current;
    if (!el) return;
    el.play().catch(() => {});
  }, []);

  const stop = useCallback(() => {
    const el = videoRef.current;
    if (!el) return;
    el.pause();
    el.currentTime = 0;
  }, []);

  // Handlers prontos para espalhar no container
  const handlers = useMemo(
    () => ({
      onMouseEnter: play,
      onFocus: play,
      onMouseLeave: stop,
      onBlur: stop,
      onTouchStart: play,
      onTouchEnd: stop,
      onTouchCancel: stop,
    }),
    [play, stop]
  );

  return { videoRef, play, stop, handlers };
}
