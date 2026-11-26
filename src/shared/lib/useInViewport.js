// src/shared/lib/useInViewport.js
import { useEffect, useState } from "react";

const hasIO = () => typeof IntersectionObserver !== "undefined";

/**
 * true enquanto algum píxel do elemento referenciado está no viewport.
 * Sem IntersectionObserver assume-se visível (o conteúdo continua a funcionar).
 * Só provoca render quando o estado muda (entrada/saída do viewport).
 */
export function useInViewport(ref) {
  const [inView, setInView] = useState(() => !hasIO());

  useEffect(() => {
    const el = ref?.current;
    if (!el || !hasIO()) return;
    const io = new IntersectionObserver(([entry]) =>
      setInView(entry.isIntersecting)
    );
    io.observe(el);
    return () => io.disconnect();
  }, [ref]);

  return inView;
}
