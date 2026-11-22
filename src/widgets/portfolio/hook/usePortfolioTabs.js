// src/widgets/portfolio/hook/usePortfolioTabs.js
import { useCallback, useEffect, useMemo, useState } from "react";
import { prefersReducedMotion } from "@shared/lib/usePrefersReducedMotion";

const DEFAULT_SERVICE = "Cabeleireiro";

// Agrupa em linhas de `size`, evitando 1 card isolado na última (função pura)
function groupWorks(arr, size = 3) {
  if (!Array.isArray(arr) || arr.length === 0) return [];
  const chunks = [];
  for (let i = 0; i < arr.length; i += size)
    chunks.push(arr.slice(i, i + size));
  if (chunks.length > 1 && chunks[chunks.length - 1].length === 1) {
    const last = chunks.pop();
    const prev = chunks.pop();
    chunks.push(prev.slice(0, -1), [prev[prev.length - 1], ...last]);
  }
  return chunks;
}

/**
 * Controla tabs de serviços e paginação visual (linhas) do portfólio.
 * Mantém o comportamento original:
 * - serviço inicial via ?service= (se válido) ou "Cabeleireiro"
 * - evento externo "activate-portfolio-service" ativa tab e faz scroll
 * - se URL tem #Works em refresh, faz scroll
 * - agrupa trabalhos por linhas (máx. 3) evitando 1 isolado na última linha
 */
export function usePortfolioTabs(
  services = [],
  worksMap = {},
  itemsPerRow = 3
) {
  const SERVICE_SET = useMemo(() => new Set(services), [services]);
  const isValid = useCallback((s) => s && SERVICE_SET.has(s), [SERVICE_SET]);

  const [activeService, setActiveService] = useState(() => {
    const s = new URLSearchParams(window.location.search).get("service");
    return isValid(s) ? s : DEFAULT_SERVICE;
  });

  const scrollToWorks = useCallback(() => {
    document.getElementById("Works")?.scrollIntoView({
      behavior: prefersReducedMotion() ? "auto" : "smooth",
      block: "start",
    });
  }, []);

  const selectServiceAndScroll = useCallback(
    (service) => {
      setActiveService(service);
      scrollToWorks();
    },
    [scrollToWorks]
  );

  // Ouve evento externo para ativar serviço
  useEffect(() => {
    const handler = (e) => {
      const service = e.detail;
      if (!isValid(service)) return;
      selectServiceAndScroll(service);
    };
    window.addEventListener("activate-portfolio-service", handler);
    return () =>
      window.removeEventListener("activate-portfolio-service", handler);
  }, [isValid, selectServiceAndScroll]);

  // Se entra com #Works na URL (refresh), faz scroll
  useEffect(() => {
    if (window.location.hash === "#Works") {
      setTimeout(scrollToWorks, 0);
    }
  }, [scrollToWorks]);

  const rows = useMemo(
    () => groupWorks(worksMap?.[activeService] ?? [], itemsPerRow),
    [worksMap, activeService, itemsPerRow]
  );

  return { activeService, selectServiceAndScroll, rows };
}
