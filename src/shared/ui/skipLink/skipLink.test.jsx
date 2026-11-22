import { describe, expect, test } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SkipLink from "./skipLink";

describe("SkipLink", () => {
  test("é o primeiro controlo focável e aponta para #main", async () => {
    render(
      <>
        <SkipLink />
        <a href="#x">Outro</a>
        <main id="main" tabIndex={-1} />
      </>
    );
    await userEvent.tab();
    const link = screen.getByRole("link", { name: "Saltar para o conteúdo" });
    expect(link).toHaveFocus();
    expect(link).toHaveAttribute("href", "#main");
  });

  test("move o foco para o <main> sem alterar o hash", async () => {
    window.history.replaceState(null, "", "/#Works");
    render(
      <>
        <SkipLink />
        <main id="main" tabIndex={-1} data-testid="main" />
      </>
    );
    await userEvent.click(screen.getByRole("link", { name: "Saltar para o conteúdo" }));
    expect(screen.getByTestId("main")).toHaveFocus();
    expect(window.location.hash).toBe("#Works");
  });

  test("sem destino deixa o comportamento nativo (não impede a navegação)", () => {
    render(<SkipLink targetId="inexistente" />);
    // Listener no document (corre depois do handler do React): regista se a
    // app impediu a navegação e só então a cancela, para que a navegação de
    // hash assíncrona do jsdom não contamine os testes seguintes.
    let preventedByApp;
    const inspect = (e) => {
      preventedByApp = e.defaultPrevented;
      e.preventDefault();
    };
    document.addEventListener("click", inspect);
    screen.getByRole("link").click();
    document.removeEventListener("click", inspect);
    expect(preventedByApp).toBe(false);
  });
});
