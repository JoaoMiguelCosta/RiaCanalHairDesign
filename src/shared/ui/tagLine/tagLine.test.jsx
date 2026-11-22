import { describe, expect, test } from "vitest";
import { render } from "@testing-library/react";
import TagLine from "./tagLine";

describe("TagLine", () => {
  test("texto acessível separa as palavras da marca", () => {
    const { container } = render(<TagLine />);
    expect(container.firstChild).toHaveTextContent("Ria Canal HAIRDESIGN", {
      normalizeWhitespace: false,
    });
  });

  test("não usa papéis ARIA inválidos nem aria-label genérico", () => {
    const { container } = render(<TagLine />);
    const root = container.firstChild;
    expect(root.tagName).toBe("DIV");
    expect(root).not.toHaveAttribute("role");
    expect(root).not.toHaveAttribute("aria-label");
  });

  test("a variante footer usa classes próprias; variante desconhecida cai na default", () => {
    const { container, rerender } = render(<TagLine />);
    const defaultClass = container.firstChild.className;

    rerender(<TagLine variant="footer" />);
    expect(container.firstChild.className).not.toBe(defaultClass);

    rerender(<TagLine variant="inexistente" />);
    expect(container.firstChild.className).toBe(defaultClass);
  });
});
