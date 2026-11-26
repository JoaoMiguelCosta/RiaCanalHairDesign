import { describe, expect, test } from "vitest";
import { render, screen } from "@testing-library/react";
import Title from "./title";

describe("Title", () => {
  test("renderiza um <h2> com as duas linhas por defeito", () => {
    render(<Title line1="Quem" line2="Somos" />);
    const heading = screen.getByRole("heading", { level: 2 });
    expect(heading).toHaveTextContent("QuemSomos");
    expect(heading.querySelectorAll("span")).toHaveLength(2);
  });

  test("a prop `as` altera o elemento semântico", () => {
    const { rerender } = render(<Title as="h3" line1="Filosofia" />);
    expect(screen.getByRole("heading", { level: 3 })).toHaveTextContent("Filosofia");

    rerender(<Title as="p" line1="Slogan" />);
    expect(screen.queryByRole("heading")).not.toBeInTheDocument();
    expect(screen.getByText("Slogan").closest("p")).toBeInTheDocument();
  });

  test("encaminha id (alvo de aria-labelledby) e atributos HTML", () => {
    render(
      <section aria-labelledby="Works-title">
        <Title id="Works-title" line1="O Nosso" line2="Portfólio" data-x="1" />
      </section>
    );
    const heading = screen.getByRole("heading", { level: 2 });
    expect(heading).toHaveAttribute("id", "Works-title");
    expect(heading).toHaveAttribute("data-x", "1");
    expect(screen.getByRole("region", { name: /O Nosso\s*Portfólio/ })).toBeInTheDocument();
  });

  test("className externa acrescenta-se à classe da variante", () => {
    const { rerender } = render(<Title line1="A" />);
    const base = screen.getByRole("heading").className;
    expect(base).not.toBe("");

    rerender(<Title line1="A" className="extra" />);
    const heading = screen.getByRole("heading");
    expect(heading).toHaveClass("extra");
    expect(heading.className).toContain(base);
  });

  test("a variante highlight usa uma classe diferente da default", () => {
    const { rerender } = render(<Title line1="A" />);
    const defaultClass = screen.getByRole("heading").className;
    rerender(<Title line1="A" variant="highlight" />);
    expect(screen.getByRole("heading").className).not.toBe(defaultClass);
  });

  test("omite linhas vazias", () => {
    render(<Title line2="No Instagram" />);
    const heading = screen.getByRole("heading");
    expect(heading.querySelectorAll("span")).toHaveLength(1);
    expect(heading).toHaveTextContent("No Instagram");
  });
});
