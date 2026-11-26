import { describe, expect, test, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import Icon from "./icons";

describe("Icon", () => {
  test("é decorativo por defeito (aria-hidden, focusable=false, sem role)", () => {
    const { container } = render(<Icon name="instagram" />);
    const svg = container.querySelector("svg");
    expect(svg).toHaveAttribute("aria-hidden", "true");
    expect(svg).toHaveAttribute("focusable", "false");
    expect(svg).not.toHaveAttribute("role");
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });

  test("com aria-label passa a imagem com nome acessível", () => {
    const { container } = render(<Icon name="phone" aria-label="Telefone" />);
    const svg = container.querySelector("svg");
    expect(svg).not.toHaveAttribute("aria-hidden");
    expect(svg).toHaveAttribute("focusable", "false");
    expect(screen.getByRole("img", { name: "Telefone" })).toBe(svg);
  });

  test("com title também deixa de ser ocultado", () => {
    const { container } = render(<Icon name="clock" title="Horário" />);
    const svg = container.querySelector("svg");
    expect(svg).not.toHaveAttribute("aria-hidden");
    expect(svg).toHaveAttribute("role", "img");
  });

  test("encaminha className e outros atributos", () => {
    const { container } = render(<Icon name="menu" className="ico" data-testid="m" />);
    const svg = container.querySelector("svg");
    expect(svg).toHaveClass("ico");
    expect(svg).toHaveAttribute("data-testid", "m");
  });

  test("nome desconhecido não renderiza nada e avisa", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const { container } = render(<Icon name="nope" />);
    expect(container).toBeEmptyDOMElement();
    expect(warn).toHaveBeenCalledWith('Icon "nope" not found.');
  });

  test("dentro de um botão, o nome vem do botão e não do ícone", () => {
    render(
      <button type="button" aria-label="Fechar">
        <Icon name="close" />
      </button>
    );
    expect(screen.getByRole("button", { name: "Fechar" })).toBeInTheDocument();
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });
});
