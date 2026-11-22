// src/shared/lib/isTouchDevice.js

/**
 * Leitura pontual: true em dispositivos táteis ou sem hover (ecrãs táteis,
 * híbridos). Usada para ativar o modo "tocar para abrir" dos cartões.
 */
export function isTouchDevice() {
  if (typeof window === "undefined") return false;
  return (
    "ontouchstart" in window ||
    navigator.maxTouchPoints > 0 ||
    Boolean(window.matchMedia?.("(hover: none)").matches)
  );
}
