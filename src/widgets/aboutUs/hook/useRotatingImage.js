// src/widgets/aboutUs/hook/useRotatingImage.js
import { useEffect, useMemo, useState } from "react";
import { useInViewport } from "@shared/lib/useInViewport";
import { usePageVisibility } from "@shared/lib/usePageVisibility";

/**
 * Roda imagens automaticamente (por omissão a cada 3000ms).
 *
 * Um único setTimeout por imagem, agendado só enquanto a rotação é permitida:
 *  - enabled=false → movimento reduzido (mostra sempre a primeira imagem);
 *  - hover         → ponteiro (rato/caneta) sobre a imagem;
 *  - offscreen     → imagem fora do viewport;
 *  - pageHidden    → separador em segundo plano.
 * Política de retoma: depois de qualquer pausa a imagem atual fica visível
 * durante um intervalo completo; nunca se saltam imagens pelo tempo em pausa.
 */
export function useRotatingImage(
  images,
  { intervalMs = 3000, enabled = true, rootRef } = {}
) {
  const count = Array.isArray(images) ? images.length : 0;
  const [index, setIndex] = useState(0);
  const [hover, setHover] = useState(false);
  const inView = useInViewport(rootRef);
  const pageVisible = usePageVisibility();

  const running = enabled && count > 1 && !hover && inView && pageVisible;

  useEffect(() => {
    if (!running) return;
    const id = setTimeout(() => setIndex((i) => (i + 1) % count), intervalMs);
    return () => clearTimeout(id);
  }, [running, index, count, intervalMs]);

  const pauseHandlers = useMemo(
    () => ({
      onPointerEnter: (e) => {
        if (e.pointerType !== "touch") setHover(true);
      },
      onPointerLeave: (e) => {
        if (e.pointerType !== "touch") setHover(false);
      },
    }),
    []
  );

  const currentImage = count ? images[enabled ? index % count : 0] : null;
  return { currentImage, pauseHandlers };
}
