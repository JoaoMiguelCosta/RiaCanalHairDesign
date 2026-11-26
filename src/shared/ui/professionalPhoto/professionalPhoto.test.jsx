import { describe, expect, test, vi } from "vitest";
import { createRef } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import ProfessionalPhoto from "./professionalPhoto";

describe("ProfessionalPhoto", () => {
  test("renderiza a imagem com alt, classes e atributos de performance", () => {
    const { container } = render(
      <ProfessionalPhoto ContainerImg="frame" imageClass="photo" src="/a.webp" alt="Cristina" />
    );
    const img = screen.getByRole("img", { name: "Cristina" });
    expect(img).toHaveClass("photo");
    expect(img).toHaveAttribute("loading", "lazy");
    expect(img).toHaveAttribute("decoding", "async");
    expect(container.firstChild).toHaveClass("frame");
  });

  test("alt vazio torna a imagem decorativa", () => {
    render(<ProfessionalPhoto src="/a.webp" />);
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
    expect(document.querySelector("img")).toHaveAttribute("role", "presentation");
  });

  test("encaminha onLoad e outros atributos para a <img>", () => {
    const onLoad = vi.fn();
    render(<ProfessionalPhoto src="/a.webp" alt="x" onLoad={onLoad} data-k="1" />);
    const img = screen.getByRole("img");
    expect(img).toHaveAttribute("data-k", "1");
    fireEvent.load(img);
    expect(onLoad).toHaveBeenCalledTimes(1);
  });

  test("em erro sem placeholder retira a <img> mas mantém o contentor", () => {
    const { container } = render(<ProfessionalPhoto ContainerImg="frame" src="/a.webp" alt="x" />);
    fireEvent.error(screen.getByRole("img"));
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
    expect(container.firstChild).toHaveClass("frame");
  });

  test("em erro mostra o placeholder (URL) como imagem decorativa", () => {
    render(<ProfessionalPhoto src="/a.webp" alt="x" placeholder="/fallback.webp" />);
    fireEvent.error(screen.getByRole("img"));
    const fallback = document.querySelector("img");
    expect(fallback).toHaveAttribute("src", "/fallback.webp");
    expect(fallback).toHaveAttribute("alt", "");
  });

  test("um novo src volta a ser tentado depois de um erro", () => {
    const { rerender } = render(<ProfessionalPhoto src="/a.webp" alt="x" />);
    fireEvent.error(screen.getByRole("img"));
    expect(screen.queryByRole("img")).not.toBeInTheDocument();

    rerender(<ProfessionalPhoto src="/b.webp" alt="x" />);
    expect(screen.getByRole("img")).toHaveAttribute("src", "/b.webp");

    // regressar ao src que falhou volta a tentá-lo após outro src
    rerender(<ProfessionalPhoto src="/a.webp" alt="x" />);
    expect(screen.getByRole("img")).toHaveAttribute("src", "/a.webp");
  });

  test("containerProps chegam ao contentor (ref e handlers)", () => {
    const ref = createRef();
    const onPointerEnter = vi.fn();
    const { container } = render(
      <ProfessionalPhoto src="/a.webp" alt="x" containerProps={{ ref, onPointerEnter }} />
    );
    expect(ref.current).toBe(container.firstChild);
    fireEvent.pointerOver(screen.getByRole("img"));
    expect(onPointerEnter).toHaveBeenCalled();
  });

  test("sem src nem placeholder renderiza só o contentor", () => {
    const { container } = render(<ProfessionalPhoto ContainerImg="frame" />);
    expect(container.firstChild).toHaveClass("frame");
    expect(container.firstChild).toBeEmptyDOMElement();
  });
});
