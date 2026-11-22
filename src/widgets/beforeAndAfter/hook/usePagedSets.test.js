import { describe, expect, test } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { usePagedSets } from "./usePagedSets";

const items = (n) => Array.from({ length: n }, (_, i) => i);

describe("usePagedSets", () => {
  test("divide em conjuntos de N e expõe o conjunto ativo", () => {
    const { result } = renderHook(() => usePagedSets(items(7), 3));
    expect(result.current.totalSets).toBe(3);
    expect(result.current.hasPagination).toBe(true);
    expect(result.current.visible).toEqual([0, 1, 2]);
  });

  test("next/prev dão a volta nos extremos", () => {
    const list = items(6);
    const { result } = renderHook(() => usePagedSets(list, 3));
    act(() => result.current.next());
    expect(result.current.visible).toEqual([3, 4, 5]);
    act(() => result.current.next());
    expect(result.current.activeSet).toBe(0);
    act(() => result.current.prev());
    expect(result.current.activeSet).toBe(1);
  });

  test("setActiveSet salta diretamente para um conjunto", () => {
    const list = items(7);
    const { result } = renderHook(() => usePagedSets(list, 3));
    act(() => result.current.setActiveSet(2));
    expect(result.current.visible).toEqual([6]);
  });

  test("sem paginação com um só conjunto (next/prev inertes)", () => {
    const list = items(3);
    const { result } = renderHook(() => usePagedSets(list, 3));
    expect(result.current.hasPagination).toBe(false);
    act(() => result.current.next());
    expect(result.current.activeSet).toBe(0);
  });

  test("lista vazia ou inválida", () => {
    const { result } = renderHook(() => usePagedSets([], 3));
    expect(result.current.totalItems).toBe(0);
    expect(result.current.totalSets).toBe(0);
    expect(result.current.visible).toEqual([]);

    const { result: r2 } = renderHook(() => usePagedSets(undefined, 3));
    expect(r2.current.totalItems).toBe(0);
  });
});
