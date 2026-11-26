// src/shared/lib/usePageVisibility.js
import { useSyncExternalStore } from "react";

const subscribe = (onChange) => {
  if (typeof document === "undefined") return () => {};
  document.addEventListener("visibilitychange", onChange);
  return () => document.removeEventListener("visibilitychange", onChange);
};

const getSnapshot = () => document.visibilityState !== "hidden";

/** true enquanto o separador/página está visível (document.visibilityState). */
export function usePageVisibility() {
  return useSyncExternalStore(subscribe, getSnapshot, () => true);
}
