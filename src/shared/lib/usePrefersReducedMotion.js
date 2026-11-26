// src/shared/lib/usePrefersReducedMotion.js
import { useSyncExternalStore } from "react";

const QUERY = "(prefers-reduced-motion: reduce)";

const getMql = () =>
  typeof window !== "undefined" && window.matchMedia
    ? window.matchMedia(QUERY)
    : null;

/** Leitura pontual (fora de componentes, ex.: opções de scrollIntoView). */
export const prefersReducedMotion = () => Boolean(getMql()?.matches);

const subscribe = (onChange) => {
  const mql = getMql();
  if (!mql) return () => {};
  mql.addEventListener?.("change", onChange);
  return () => mql.removeEventListener?.("change", onChange);
};

/** true quando o utilizador pediu movimento reduzido; reage a alterações. */
export function usePrefersReducedMotion() {
  return useSyncExternalStore(subscribe, prefersReducedMotion, () => false);
}
