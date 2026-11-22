import { beforeEach, describe, expect, test, vi } from "vitest";
import { act, fireEvent, render, screen } from "@testing-library/react";
import RotatingPhoto from "./rotatingPhoto";
import {
  installIntersectionObserver,
  installMatchMedia,
  mockVisibility,
  REDUCED_MOTION,
} from "../../../../../tests/setup/browserMocks";

const IMAGES = ["/exterior.webp", "/interior.webp"];
const INTERVAL = 3000;

function setup({ reducedMotion = false } = {}) {
  const io = installIntersectionObserver();
  installMatchMedia({ [REDUCED_MOTION]: reducedMotion });
  mockVisibility("visible");
  const utils = render(
    <RotatingPhoto
      images={IMAGES}
      intervalMs={INTERVAL}
      containerClass="frame"
      imageClass="photo"
      alt="Entrada do Salão"
    />
  );
  const showAll = () => act(() => io.setAll(true));
  const img = () => screen.queryByRole("img", { name: "Entrada do Salão" });
  return { ...utils, io, showAll, img };
}

describe("RotatingPhoto", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  test("alterna exterior → interior → exterior", () => {
    const { showAll, img } = setup();
    showAll();
    expect(img()).toHaveAttribute("src", "/exterior.webp");
    act(() => vi.advanceTimersByTime(INTERVAL));
    expect(img()).toHaveAttribute("src", "/interior.webp");
    act(() => vi.advanceTimersByTime(INTERVAL));
    expect(img()).toHaveAttribute("src", "/exterior.webp");
  });

  test("pausa com hover sobre a fotografia", () => {
    const { showAll, img } = setup();
    showAll();
    fireEvent.pointerOver(img(), { pointerType: "mouse" });
    act(() => vi.advanceTimersByTime(INTERVAL * 2));
    expect(img()).toHaveAttribute("src", "/exterior.webp");
  });

  test("movimento reduzido fixa a primeira imagem", () => {
    const { showAll, img } = setup({ reducedMotion: true });
    showAll();
    act(() => vi.advanceTimersByTime(INTERVAL * 3));
    expect(img()).toHaveAttribute("src", "/exterior.webp");
    expect(vi.getTimerCount()).toBe(0);
  });

  // Regressão (Fase 6): uma imagem que falha não pode parar a rotação.
  describe("erro de carregamento de uma imagem", () => {
    test("a rotação continua e a imagem seguinte volta a ser mostrada", () => {
      const { showAll, img } = setup();
      showAll();
      act(() => vi.advanceTimersByTime(INTERVAL));
      expect(img()).toHaveAttribute("src", "/interior.webp");

      fireEvent.error(img()); // /interior.webp falha
      expect(img()).not.toBeInTheDocument();

      act(() => vi.advanceTimersByTime(INTERVAL));
      expect(img()).toHaveAttribute("src", "/exterior.webp");
    });

    test("o elemento observado (viewport) e o alvo do hover continuam no DOM", () => {
      const { showAll, img, io } = setup();
      showAll();
      act(() => vi.advanceTimersByTime(INTERVAL));
      fireEvent.error(img());

      const observed = io.observedElements();
      expect(observed.length).toBeGreaterThan(0);
      for (const el of observed) expect(el.isConnected).toBe(true);
    });
  });

  test("sem timers nem observers após desmontar", () => {
    const { showAll, unmount, io } = setup();
    showAll();
    unmount();
    expect(vi.getTimerCount()).toBe(0);
    expect(io.active()).toHaveLength(0);
  });
});
