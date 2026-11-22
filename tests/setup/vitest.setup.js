// tests/setup/vitest.setup.js
// Setup comum dos testes jsdom: matchers do jest-dom e limpeza entre testes.
// Mocks de APIs do browser NÃO são globais: cada teste instala só os que
// precisa (ver tests/setup/browserMocks.js).
import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach, vi } from "vitest";

// Fake timers + user-event/waitFor: a Testing Library só avança o relógio
// falso se encontrar a API do Jest (`jest.advanceTimersByTime`); sem ela, o
// setTimeout(0) que espera após cada ação nunca dispara e o teste bloqueia.
// Só é usado quando os timers estão de facto falsificados (deteção da própria
// biblioteca); com timers reais nada muda.
globalThis.jest = { advanceTimersByTime: (ms) => vi.advanceTimersByTime(ms) };

afterEach(() => {
  cleanup(); // desmonta antes de repor timers (os efeitos limpam-se com eles)
  vi.useRealTimers();
  document.body.style.overflow = "";
  window.history.replaceState(null, "", "/");
});
