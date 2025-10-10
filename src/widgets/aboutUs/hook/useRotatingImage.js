// src/widgets/aboutUs/hook/useRotatingImage.js
import { useEffect, useRef, useState } from "react";

/**
 * Roda imagens automaticamente.
 * Mantém a lógica do componente original (intervalo de 3000ms e cleanup).
 */
export function useRotatingImage(
  images,
  { intervalMs = 3000, startIndex = 0 } = {}
) {
  const hasImages = Array.isArray(images) && images.length > 0;
  const [currentImage, setCurrentImage] = useState(
    hasImages ? images[startIndex] : null
  );

  const idxRef = useRef(startIndex);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (!hasImages) return;

    intervalRef.current = setInterval(() => {
      idxRef.current = (idxRef.current + 1) % images.length;
      setCurrentImage(images[idxRef.current]);
    }, intervalMs);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [hasImages, images, intervalMs]);

  return { currentImage, setCurrentImage };
}
