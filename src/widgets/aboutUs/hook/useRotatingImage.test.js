import { beforeEach, describe, expect, test, vi } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { useRotatingImage } from "./useRotatingImage";
import {
  installIntersectionObserver,
  mockVisibility,
} from "../../../../tests/setup/browserMocks";

const IMAGES = ["a.webp", "b.webp", "c.webp"];
const INTERVAL = 3000;
const hover = (handlers, pointerType = "mouse") =>
  act(() => handlers.onPointerEnter({ pointerType }));
const leave = (handlers, pointerType = "mouse") =>
  act(() => handlers.onPointerLeave({ pointerType }));

function setup(options = {}) {
  const io = installIntersectionObserver();
  const vis = mockVisibility("visible");
  const el = document.createElement("img");
  document.body.appendChild(el);
  const rootRef = { current: el };
  const hook = renderHook(
    ({ images, opts }) => useRotatingImage(images, { intervalMs: INTERVAL, rootRef, ...opts }),
    { initialProps: { images: IMAGES, opts: options } }
  );
  const show = () => act(() => io.setIntersecting(el, true));
  return { ...hook, io, vis, el, show };
}

describe("useRotatingImage", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  test("começa na primeira imagem e não roda enquanto está fora do viewport", () => {
    const { result } = setup();
    expect(result.current.currentImage).toBe("a.webp");
    act(() => vi.advanceTimersByTime(INTERVAL * 3));
    expect(result.current.currentImage).toBe("a.webp");
    expect(vi.getTimerCount()).toBe(0);
  });

  test("roda pela ordem definida e volta ao início", () => {
    const { result, show } = setup();
    show();
    const seen = [result.current.currentImage];
    for (let i = 0; i < 3; i++) {
      act(() => vi.advanceTimersByTime(INTERVAL));
      seen.push(result.current.currentImage);
    }
    expect(seen).toEqual(["a.webp", "b.webp", "c.webp", "a.webp"]);
  });

  test("usa um único timer de cada vez", () => {
    const { show } = setup();
    show();
    expect(vi.getTimerCount()).toBe(1);
    act(() => vi.advanceTimersByTime(INTERVAL));
    expect(vi.getTimerCount()).toBe(1);
  });

  test("pausa com hover de rato e retoma com um intervalo completo", () => {
    const { result, show } = setup();
    show();
    act(() => vi.advanceTimersByTime(INTERVAL - 500));
    hover(result.current.pauseHandlers);
    act(() => vi.advanceTimersByTime(INTERVAL * 2));
    expect(result.current.currentImage).toBe("a.webp");
    expect(vi.getTimerCount()).toBe(0);

    leave(result.current.pauseHandlers);
    act(() => vi.advanceTimersByTime(INTERVAL - 1));
    expect(result.current.currentImage).toBe("a.webp");
    act(() => vi.advanceTimersByTime(1));
    expect(result.current.currentImage).toBe("b.webp");
  });

  test("toque não conta como hover", () => {
    const { result, show } = setup();
    show();
    hover(result.current.pauseHandlers, "touch");
    act(() => vi.advanceTimersByTime(INTERVAL));
    expect(result.current.currentImage).toBe("b.webp");
  });

  test("pausa fora do viewport e retoma ao voltar", () => {
    const { result, show, io, el } = setup();
    show();
    act(() => io.setIntersecting(el, false));
    act(() => vi.advanceTimersByTime(INTERVAL * 2));
    expect(result.current.currentImage).toBe("a.webp");

    show();
    act(() => vi.advanceTimersByTime(INTERVAL));
    expect(result.current.currentImage).toBe("b.webp");
  });

  test("pausa com a página oculta e retoma quando volta a ficar visível", () => {
    const { result, show, vis } = setup();
    show();
    act(() => vis.set("hidden"));
    act(() => vi.advanceTimersByTime(INTERVAL * 2));
    expect(result.current.currentImage).toBe("a.webp");
    expect(vi.getTimerCount()).toBe(0);

    act(() => vis.set("visible"));
    act(() => vi.advanceTimersByTime(INTERVAL));
    expect(result.current.currentImage).toBe("b.webp");
  });

  test("movimento reduzido (enabled=false) mostra sempre a primeira imagem", () => {
    const { result, show, rerender } = setup();
    show();
    act(() => vi.advanceTimersByTime(INTERVAL));
    expect(result.current.currentImage).toBe("b.webp");

    rerender({ images: IMAGES, opts: { enabled: false } });
    expect(result.current.currentImage).toBe("a.webp");
    act(() => vi.advanceTimersByTime(INTERVAL * 3));
    expect(result.current.currentImage).toBe("a.webp");
    expect(vi.getTimerCount()).toBe(0);
  });

  test("uma só imagem não agenda timers; lista vazia devolve null", () => {
    const { result, show, rerender } = setup();
    rerender({ images: ["x.webp"], opts: {} });
    show();
    expect(result.current.currentImage).toBe("x.webp");
    expect(vi.getTimerCount()).toBe(0);

    rerender({ images: [], opts: {} });
    expect(result.current.currentImage).toBeNull();
  });

  test("sem timers nem observers após desmontar", () => {
    const { show, unmount, io } = setup();
    show();
    expect(vi.getTimerCount()).toBe(1);
    unmount();
    expect(vi.getTimerCount()).toBe(0);
    expect(io.active()).toHaveLength(0);
  });
});
