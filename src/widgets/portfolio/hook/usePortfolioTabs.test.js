import { describe, expect, test, vi } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { usePortfolioTabs } from "./usePortfolioTabs";

const SERVICES = ["Cabeleireiro", "Estética", "Unhas"];
const works = (n) => Array.from({ length: n }, (_, i) => ({ titulo: `T${i + 1}` }));
const sizes = (rows) => rows.map((r) => r.length);

const renderTabs = (map) => renderHook(() => usePortfolioTabs(SERVICES, map, 3));

describe("usePortfolioTabs — agrupamento em linhas", () => {
  test.each([
    [0, []],
    [1, [1]],
    [2, [2]],
    [3, [3]],
    [4, [2, 2]], // evita 1 cartão isolado na última linha
    [5, [3, 2]],
    [6, [3, 3]],
    [7, [3, 2, 2]],
    [8, [3, 3, 2]],
    [9, [3, 3, 3]],
  ])("%i trabalhos → linhas %j", (n, expected) => {
    const { result } = renderTabs({ Cabeleireiro: works(n) });
    expect(sizes(result.current.rows)).toEqual(expected);
  });

  test("preserva a ordem e todos os itens", () => {
    const list = works(7);
    const { result } = renderTabs({ Cabeleireiro: list });
    expect(result.current.rows.flat()).toEqual(list);
  });
});

describe("usePortfolioTabs — serviço ativo", () => {
  test("começa em Cabeleireiro por defeito", () => {
    const { result } = renderTabs({});
    expect(result.current.activeService).toBe("Cabeleireiro");
  });

  test("aceita ?service= válido e ignora inválidos", () => {
    window.history.replaceState(null, "", "/?service=Unhas");
    expect(renderTabs({}).result.current.activeService).toBe("Unhas");
    window.history.replaceState(null, "", "/?service=Hack");
    expect(renderTabs({}).result.current.activeService).toBe("Cabeleireiro");
  });

  test("o evento activate-portfolio-service ativa o serviço e faz scroll até #Works", () => {
    const works = document.createElement("section");
    works.id = "Works";
    works.scrollIntoView = vi.fn(); // jsdom não implementa layout/scroll
    document.body.appendChild(works);

    const { result } = renderTabs({});
    act(() => {
      window.dispatchEvent(new CustomEvent("activate-portfolio-service", { detail: "Estética" }));
    });
    expect(result.current.activeService).toBe("Estética");
    expect(works.scrollIntoView).toHaveBeenCalledWith({ behavior: "smooth", block: "start" });

    act(() => {
      window.dispatchEvent(new CustomEvent("activate-portfolio-service", { detail: "Inválido" }));
    });
    expect(result.current.activeService).toBe("Estética");
    works.remove();
  });

  test("remove o listener ao desmontar", () => {
    const remove = vi.spyOn(window, "removeEventListener");
    const { unmount } = renderTabs({});
    unmount();
    expect(remove).toHaveBeenCalledWith("activate-portfolio-service", expect.any(Function));
  });
});
