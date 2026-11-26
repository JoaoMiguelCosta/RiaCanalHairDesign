// tests/setup/browserMocks.js
// Substitutos controláveis de APIs que o jsdom não implementa. São instalados
// teste a teste (vi.stubGlobal / vi.spyOn), e repostos automaticamente pela
// configuração `unstubGlobals` / `restoreMocks` do Vitest.
import { vi } from "vitest";

/**
 * IntersectionObserver controlado pelo teste: nada é "visível" até o teste
 * chamar `setIntersecting(el, true)`. Regista as opções recebidas e o estado
 * de cada observer (para verificar o cleanup).
 */
export function installIntersectionObserver() {
  const observers = new Set();

  class MockIntersectionObserver {
    constructor(callback, options = {}) {
      this.callback = callback;
      this.options = options;
      this.targets = new Set();
      this.disconnected = false;
      observers.add(this);
    }
    observe(el) {
      this.targets.add(el);
    }
    unobserve(el) {
      this.targets.delete(el);
    }
    disconnect() {
      this.targets.clear();
      this.disconnected = true;
    }
    takeRecords() {
      return [];
    }
  }

  vi.stubGlobal("IntersectionObserver", MockIntersectionObserver);

  const all = () => [...observers];
  return {
    all,
    /** Observers ainda ligados a pelo menos um elemento. */
    active: () => all().filter((o) => !o.disconnected && o.targets.size > 0),
    /** Elementos atualmente observados (todos os observers ativos). */
    observedElements: () => all().flatMap((o) => [...o.targets]),
    /** Notifica os observers que observam `el` (envolver em act()). */
    setIntersecting(el, isIntersecting) {
      for (const o of all()) {
        if (!o.disconnected && o.targets.has(el)) {
          o.callback([{ target: el, isIntersecting }], o);
        }
      }
    },
    /** Notifica todos os elementos observados. */
    setAll(isIntersecting) {
      for (const o of all()) {
        for (const el of [...o.targets]) {
          if (!o.disconnected) o.callback([{ target: el, isIntersecting }], o);
        }
      }
    },
  };
}

/**
 * window.matchMedia com resultados definidos pelo teste e eventos "change".
 * `initial` mapeia a media query → matches.
 */
export function installMatchMedia(initial = {}) {
  const state = { ...initial };
  const lists = new Map();

  const getList = (query) => {
    if (!lists.has(query)) {
      const listeners = new Set();
      lists.set(query, {
        listeners,
        mql: {
          media: query,
          get matches() {
            return Boolean(state[query]);
          },
          onchange: null,
          addEventListener: (type, fn) => type === "change" && listeners.add(fn),
          removeEventListener: (type, fn) =>
            type === "change" && listeners.delete(fn),
          addListener: (fn) => listeners.add(fn),
          removeListener: (fn) => listeners.delete(fn),
          dispatchEvent: () => true,
        },
      });
    }
    return lists.get(query);
  };

  vi.stubGlobal(
    "matchMedia",
    vi.fn((query) => getList(query).mql)
  );

  return {
    /** Altera o resultado e emite "change" (envolver em act()). */
    set(query, matches) {
      state[query] = matches;
      const { listeners, mql } = getList(query);
      for (const fn of [...listeners]) fn({ matches, media: query, target: mql });
    },
    listenerCount: (query) => getList(query).listeners.size,
  };
}

/** document.visibilityState controlado + evento visibilitychange. */
export function mockVisibility(initial = "visible") {
  let current = initial;
  vi.spyOn(document, "visibilityState", "get").mockImplementation(() => current);
  return {
    set(state) {
      current = state;
      document.dispatchEvent(new Event("visibilitychange"));
    },
  };
}

/**
 * O jsdom não implementa PointerEvent: sem ele, pointerType/pointerId/button/
 * clientX não chegam aos handlers. Subclasse mínima de MouseEvent (que já
 * trata clientX/clientY/button) com os campos usados pela aplicação.
 */
export function installPointerEvent() {
  if (typeof window.PointerEvent === "function") return;
  class PointerEvent extends MouseEvent {
    constructor(type, init = {}) {
      super(type, init);
      this.pointerId = init.pointerId ?? 0;
      this.pointerType = init.pointerType ?? "";
      this.isPrimary = init.isPrimary ?? true;
    }
  }
  vi.stubGlobal("PointerEvent", PointerEvent);
}

/** Fake timers que incluem o relógio de animação (rAF + performance.now). */
export const FAKE_TIMERS_WITH_RAF = {
  toFake: [
    "setTimeout",
    "clearTimeout",
    "requestAnimationFrame",
    "cancelAnimationFrame",
    "performance",
    "Date",
  ],
};

/** user-event sincronizado com os fake timers do Vitest. */
export const userEventWithFakeTimers = { advanceTimers: (ms) => vi.advanceTimersByTime(ms) };

export const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";
