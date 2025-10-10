// src/widgets/beforeAndAfter/hook/usePagedSets.js
import { useCallback, useMemo, useState } from "react";

/**
 * Pagina uma lista em conjuntos de N itens.
 * Mantém a mesma lógica do componente original:
 * - calcula totalSets
 * - next/prev com wrap-around
 * - hasPagination só é true quando há >1 conjunto
 * - expõe os itens visíveis do conjunto ativo
 */
export function usePagedSets(items = [], itemsPerPage = 3) {
  const totalItems = Array.isArray(items) ? items.length : 0;
  const totalSets = Math.ceil(totalItems / itemsPerPage);

  const [activeSet, setActiveSet] = useState(0);
  const hasPagination = totalSets > 1;

  const next = useCallback(() => {
    if (!hasPagination) return;
    setActiveSet((p) => (p + 1) % totalSets);
  }, [hasPagination, totalSets]);

  const prev = useCallback(() => {
    if (!hasPagination) return;
    setActiveSet((p) => (p - 1 + totalSets) % totalSets);
  }, [hasPagination, totalSets]);

  const visible = useMemo(() => {
    const start = activeSet * itemsPerPage;
    return items.slice(start, start + itemsPerPage);
  }, [activeSet, items, itemsPerPage]);

  return {
    totalItems,
    totalSets,
    hasPagination,
    activeSet,
    setActiveSet,
    next,
    prev,
    visible,
  };
}
