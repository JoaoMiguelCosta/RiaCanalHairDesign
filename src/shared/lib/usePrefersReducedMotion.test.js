import { describe, expect, test } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { prefersReducedMotion, usePrefersReducedMotion } from "./usePrefersReducedMotion";
import { installMatchMedia, REDUCED_MOTION } from "../../../tests/setup/browserMocks";

describe("usePrefersReducedMotion", () => {
  test("false quando a preferência está desativada", () => {
    installMatchMedia({ [REDUCED_MOTION]: false });
    const { result } = renderHook(() => usePrefersReducedMotion());
    expect(result.current).toBe(false);
  });

  test("true quando a preferência está ativa desde o início", () => {
    installMatchMedia({ [REDUCED_MOTION]: true });
    const { result } = renderHook(() => usePrefersReducedMotion());
    expect(result.current).toBe(true);
  });

  test("reage a alterações dinâmicas da preferência", () => {
    const mm = installMatchMedia({ [REDUCED_MOTION]: false });
    const { result } = renderHook(() => usePrefersReducedMotion());

    act(() => mm.set(REDUCED_MOTION, true));
    expect(result.current).toBe(true);

    act(() => mm.set(REDUCED_MOTION, false));
    expect(result.current).toBe(false);
  });

  test("remove o listener ao desmontar", () => {
    const mm = installMatchMedia({ [REDUCED_MOTION]: false });
    const { unmount } = renderHook(() => usePrefersReducedMotion());
    expect(mm.listenerCount(REDUCED_MOTION)).toBe(1);
    unmount();
    expect(mm.listenerCount(REDUCED_MOTION)).toBe(0);
  });

  test("sem matchMedia assume movimento normal", () => {
    // jsdom não implementa matchMedia
    expect(window.matchMedia).toBeUndefined();
    const { result } = renderHook(() => usePrefersReducedMotion());
    expect(result.current).toBe(false);
    expect(prefersReducedMotion()).toBe(false);
  });

  test("prefersReducedMotion() faz uma leitura pontual", () => {
    installMatchMedia({ [REDUCED_MOTION]: true });
    expect(prefersReducedMotion()).toBe(true);
  });
});
