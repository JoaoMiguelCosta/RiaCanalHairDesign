// src/widgets/teamAndServices/hook/useGoToPortfolio.js
import { useCallback } from "react";

const PORTFOLIO_ID = "Works";

/**
 * Atualiza o hash para #Works (sem saltar) e dispara o evento global
 * "activate-portfolio-service". O Portfolio (usePortfolioTabs) ouve o evento,
 * ativa a tab correspondente e faz o scroll até #Works, respeitando o
 * movimento reduzido; o scroll não é repetido aqui.
 */
export function useGoToPortfolio() {
  return useCallback((service) => {
    if (window.location.hash !== `#${PORTFOLIO_ID}`) {
      history.replaceState(null, "", `#${PORTFOLIO_ID}`);
    }
    window.dispatchEvent(
      new CustomEvent("activate-portfolio-service", { detail: service })
    );
  }, []);
}
