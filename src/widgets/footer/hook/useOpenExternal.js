// src/widgets/footer/hook/useOpenExternal.js
import { useCallback } from "react";

/** Devolve um handler estável que abre um URL numa nova aba (com noopener/noreferrer). */
export function useOpenExternal(url) {
  return useCallback(() => {
    if (!url) return;
    window.open(url, "_blank", "noopener,noreferrer");
  }, [url]);
}
