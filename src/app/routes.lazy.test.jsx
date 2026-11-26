// Suspensão das páginas lazy (jsdom): o que só se observa no 1.º render de
// cada React.lazy(). Ficheiro próprio porque o Vitest isola o registo de
// módulos por ficheiro: aqui os lazy() do AppRoutes começam sempre por
// resolver, sem vi.resetModules() nem dependência da ordem dos testes.
// Cada teste usa uma página diferente (Termos / Home) — um lazy() já
// resolvido não volta a suspender; testes novos devem manter essa regra.
import { beforeEach, describe, expect, test, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { render, screen, waitFor } from "@testing-library/react";
import AppRoutes from "./routes";
import { installIntersectionObserver } from "../../tests/setup/browserMocks";
import { setupRoutePageTests } from "../../tests/setup/routePages";

setupRoutePageTests();

beforeEach(() => {
  installIntersectionObserver();
  vi.spyOn(HTMLMediaElement.prototype, "pause").mockImplementation(() => {});
  vi.spyOn(HTMLMediaElement.prototype, "play").mockResolvedValue(undefined);
});

describe("Rotas — suspensão das páginas lazy", () => {
  test("mostra o indicador de carregamento enquanto a página lazy chega", async () => {
    render(
      <MemoryRouter initialEntries={["/termos"]}>
        <AppRoutes />
      </MemoryRouter>
    );
    expect(screen.getByRole("status")).toHaveTextContent("A carregar…");
    await screen.findByRole("heading", { level: 1, name: "Termos & Condições" });
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  test("fragmento: o scroll só acontece depois de a secção existir", async () => {
    const existedOnScroll = [];
    Element.prototype.scrollIntoView = vi.fn(function () {
      existedOnScroll.push(document.contains(this));
    });
    try {
      render(
        <MemoryRouter initialEntries={["/#Location"]}>
          <AppRoutes />
        </MemoryRouter>
      );
      expect(screen.getByRole("status")).toHaveTextContent("A carregar…");
      expect(document.getElementById("Location")).toBeNull();
      await screen.findByRole("heading", { level: 1 });
      await waitFor(() => expect(existedOnScroll).toEqual([true]));
    } finally {
      delete Element.prototype.scrollIntoView;
    }
  });
});
