// src/widgets/teamAndServices/hook/useGoToPortfolio.js
import { useCallback } from "react";

/**
 * Dispara o evento global "activate-portfolio-service" e faz scroll até #Works.
 * Mantém exatamente o comportamento anterior (inclui update do hash).
 */
export function useGoToPortfolio() {
  return useCallback((service) => {
    // Notifica o Portfolio para ativar a tab correta
    window.dispatchEvent(
      new CustomEvent("activate-portfolio-service", { detail: service })
    );

    // Faz scroll suave para a secção #Works e atualiza o hash
    try {
      const id = "Works";
      const el = document.getElementById(id);
      if (el) {
        if (location.hash !== `#${id}`) {
          history.replaceState(null, "", `#${id}`);
        }
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    } catch {
      // ignora erros de ambiente sem DOM (SSR/tests)
    }
  }, []);
}
