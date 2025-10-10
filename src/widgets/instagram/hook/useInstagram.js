// src/widgets/instagram/hook/useInstagram.js
import { useCallback } from "react";

/** Devolve um handler estável para abrir o Instagram numa nova aba. */
export function useInstagramOpen(url) {
  return useCallback(() => {
    if (!url) return;
    window.open(url, "_blank", "noopener,noreferrer");
  }, [url]);
}
