import { useEffect, useRef, useState } from "react";

export default function useRotatingImage(images, delayMs = 3000) {
  const [index, setIndex] = useState(0);
  const timerRef = useRef(null);

  useEffect(() => {
    if (!Array.isArray(images) || images.length < 2) return;
    timerRef.current = setInterval(() => {
      setIndex((i) => (i + 1) % images.length);
    }, delayMs);
    return () => clearInterval(timerRef.current);
  }, [images, delayMs]);

  return images?.[index] ?? images?.[0] ?? null;
}
