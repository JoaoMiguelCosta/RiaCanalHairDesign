// src/widgets/header/hook/headerLayout.js
// Quando é que o header usa o layout mobile (menu hambúrguer).

/** Breakpoint dos CSS do header (≤ 1024px com a letra por omissão). */
export const MOBILE_QUERY = "(max-width: 64rem)";

/** Emitido em window quando o header entra ou sai do modo compacto. */
export const HEADER_LAYOUT_EVENT = "headerlayoutchange";

/**
 * Layout mobile ativo: abaixo do breakpoint, ou em modo compacto
 * (header[data-compact]: o desktop não cabe no ecrã, ver useHeaderCompact).
 */
export function isMobileHeaderLayout(el) {
  if (typeof window === "undefined") return false;
  return (
    Boolean(window.matchMedia?.(MOBILE_QUERY).matches) ||
    Boolean(el?.closest?.("header[data-compact]"))
  );
}

/**
 * Algum controlo do header (exceto submenus) está apresentado e sai do
 * viewport na horizontal? Lê o layout atual de forma síncrona.
 */
export function headerControlsOverflow(header) {
  const vw = document.documentElement.clientWidth;
  for (const el of header.querySelectorAll("a[href], button")) {
    if (el.closest("li ul")) continue; // itens de submenu (abrem por baixo)
    if (!el.getClientRects().length) continue; // não apresentado
    const r = el.getBoundingClientRect();
    if (r.right > vw + 0.5 || r.left < -0.5) return true;
  }
  return false;
}
