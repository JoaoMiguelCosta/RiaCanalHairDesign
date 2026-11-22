import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { isTouchDevice } from "./isTouchDevice";
import { installMatchMedia } from "../../../tests/setup/browserMocks";

const HOVER_NONE = "(hover: none)";

// jsdom não define navigator.maxTouchPoints: cada teste fixa o valor
const setTouchPoints = (n) =>
  Object.defineProperty(navigator, "maxTouchPoints", { value: n, configurable: true });

describe("isTouchDevice", () => {
  // O jsdom expõe window.ontouchstart por defeito: cada teste parte de um
  // ambiente sem esse sinal e o descritor original é reposto no fim.
  let ontouchstartDescriptor;
  beforeEach(() => {
    ontouchstartDescriptor = Object.getOwnPropertyDescriptor(window, "ontouchstart");
    delete window.ontouchstart;
  });

  afterEach(() => {
    delete navigator.maxTouchPoints;
    delete window.ontouchstart;
    if (ontouchstartDescriptor) {
      Object.defineProperty(window, "ontouchstart", ontouchstartDescriptor);
    }
  });

  test("false num ambiente com rato (sem toque, com hover)", () => {
    installMatchMedia({ [HOVER_NONE]: false });
    setTouchPoints(0);
    expect(isTouchDevice()).toBe(false);
  });

  test("true quando existe ontouchstart", () => {
    installMatchMedia({ [HOVER_NONE]: false });
    setTouchPoints(0);
    window.ontouchstart = null;
    expect(isTouchDevice()).toBe(true);
  });

  test("true com pontos de toque (navigator.maxTouchPoints > 0)", () => {
    installMatchMedia({ [HOVER_NONE]: false });
    setTouchPoints(5);
    expect(isTouchDevice()).toBe(true);
  });

  test("true quando o dispositivo principal não tem hover", () => {
    installMatchMedia({ [HOVER_NONE]: true });
    setTouchPoints(0);
    expect(isTouchDevice()).toBe(true);
  });

  test("não depende da largura do viewport", () => {
    installMatchMedia({ [HOVER_NONE]: false });
    setTouchPoints(0);
    vi.spyOn(window, "innerWidth", "get").mockReturnValue(320);
    expect(isTouchDevice()).toBe(false);
  });

  test("sem matchMedia não falha e usa os restantes sinais", () => {
    vi.stubGlobal("matchMedia", undefined);
    setTouchPoints(0);
    expect(isTouchDevice()).toBe(false);
  });
});
