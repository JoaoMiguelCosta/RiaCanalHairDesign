import { describe, expect, test, vi } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { usePageVisibility } from "./usePageVisibility";
import { mockVisibility } from "../../../tests/setup/browserMocks";

describe("usePageVisibility", () => {
  test("true com a página visível", () => {
    mockVisibility("visible");
    const { result } = renderHook(() => usePageVisibility());
    expect(result.current).toBe(true);
  });

  test("false com a página oculta", () => {
    mockVisibility("hidden");
    const { result } = renderHook(() => usePageVisibility());
    expect(result.current).toBe(false);
  });

  test("acompanha o evento visibilitychange", () => {
    const vis = mockVisibility("visible");
    const { result } = renderHook(() => usePageVisibility());

    act(() => vis.set("hidden"));
    expect(result.current).toBe(false);

    act(() => vis.set("visible"));
    expect(result.current).toBe(true);
  });

  test("remove o listener ao desmontar", () => {
    const add = vi.spyOn(document, "addEventListener");
    const remove = vi.spyOn(document, "removeEventListener");
    const { unmount } = renderHook(() => usePageVisibility());

    const handler = add.mock.calls.find(([type]) => type === "visibilitychange")?.[1];
    expect(handler).toBeTypeOf("function");
    unmount();
    expect(remove).toHaveBeenCalledWith("visibilitychange", handler);
  });
});
