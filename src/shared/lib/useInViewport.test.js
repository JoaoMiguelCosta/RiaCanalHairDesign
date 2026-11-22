import { describe, expect, test } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { useInViewport } from "./useInViewport";
import { installIntersectionObserver } from "../../../tests/setup/browserMocks";

const makeRef = () => {
  const el = document.createElement("div");
  document.body.appendChild(el);
  return { current: el };
};

describe("useInViewport", () => {
  test("começa fora do viewport até o observer confirmar", () => {
    installIntersectionObserver();
    const { result } = renderHook(() => useInViewport(makeRef()));
    expect(result.current).toBe(false);
  });

  test("passa a true ao entrar e a false ao sair do viewport", () => {
    const io = installIntersectionObserver();
    const ref = makeRef();
    const { result } = renderHook(() => useInViewport(ref));

    act(() => io.setIntersecting(ref.current, true));
    expect(result.current).toBe(true);

    act(() => io.setIntersecting(ref.current, false));
    expect(result.current).toBe(false);
  });

  test("usa o limiar por defeito (qualquer píxel visível)", () => {
    // O hook não expõe limiar configurável: confirma que não define threshold
    const io = installIntersectionObserver();
    renderHook(() => useInViewport(makeRef()));
    expect(io.all()[0].options).toEqual({});
  });

  test("desliga o observer ao desmontar", () => {
    const io = installIntersectionObserver();
    const { unmount } = renderHook(() => useInViewport(makeRef()));
    expect(io.active()).toHaveLength(1);
    unmount();
    expect(io.active()).toHaveLength(0);
    expect(io.all()[0].disconnected).toBe(true);
  });

  test("sem IntersectionObserver assume visível", () => {
    expect(globalThis.IntersectionObserver).toBeUndefined();
    const { result } = renderHook(() => useInViewport(makeRef()));
    expect(result.current).toBe(true);
  });

  test("sem elemento referenciado não cria observer", () => {
    const io = installIntersectionObserver();
    const { result } = renderHook(() => useInViewport({ current: null }));
    expect(io.all()).toHaveLength(0);
    expect(result.current).toBe(false);
  });
});
