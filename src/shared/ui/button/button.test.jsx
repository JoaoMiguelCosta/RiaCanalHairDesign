import { describe, expect, test, vi } from "vitest";
import { createRef } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Button from "./button";

describe("Button — ação (sem href)", () => {
  test("renderiza <button type=button> por defeito", () => {
    render(<Button>Enviar</Button>);
    const btn = screen.getByRole("button", { name: "Enviar" });
    expect(btn.tagName).toBe("BUTTON");
    expect(btn).toHaveAttribute("type", "button");
  });

  test("aceita type=submit explícito", () => {
    const onSubmit = vi.fn((e) => e.preventDefault());
    render(
      <form onSubmit={onSubmit}>
        <Button type="submit">Submeter</Button>
      </form>
    );
    const btn = screen.getByRole("button", { name: "Submeter" });
    expect(btn).toHaveAttribute("type", "submit");
    btn.click();
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  test("por defeito não submete formulários", async () => {
    const onSubmit = vi.fn((e) => e.preventDefault());
    render(
      <form onSubmit={onSubmit}>
        <Button>Ação</Button>
      </form>
    );
    await userEvent.click(screen.getByRole("button", { name: "Ação" }));
    expect(onSubmit).not.toHaveBeenCalled();
  });

  test("chama onClick com rato, Enter e Espaço", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Abrir</Button>);
    const btn = screen.getByRole("button", { name: "Abrir" });

    await user.tab();
    expect(btn).toHaveFocus();
    await user.keyboard("{Enter}");
    await user.keyboard(" ");
    expect(onClick).toHaveBeenCalledTimes(2);
    await user.click(btn);
    expect(onClick).toHaveBeenCalledTimes(3);
  });

  test("disabled bloqueia a ação", async () => {
    const onClick = vi.fn();
    render(
      <Button disabled onClick={onClick}>
        Indisponível
      </Button>
    );
    const btn = screen.getByRole("button", { name: "Indisponível" });
    expect(btn).toBeDisabled();
    await userEvent.click(btn);
    expect(onClick).not.toHaveBeenCalled();
  });

  test("encaminha className, aria-label, aria-pressed e ref", () => {
    const ref = createRef();
    render(
      <Button ref={ref} className="cta" aria-label="Pausar" aria-pressed={false}>
        ⏸
      </Button>
    );
    const btn = screen.getByRole("button", { name: "Pausar" });
    expect(btn).toHaveClass("cta");
    expect(btn).toHaveAttribute("aria-pressed", "false");
    expect(ref.current).toBe(btn);
  });
});

describe("Button — navegação (com href)", () => {
  test("renderiza <a href> sem atributos exclusivos de botão", () => {
    render(
      <Button href="#Works" type="submit" disabled>
        Ver
      </Button>
    );
    const link = screen.getByRole("link", { name: "Ver" });
    expect(link).toHaveAttribute("href", "#Works");
    expect(link).not.toHaveAttribute("type");
    expect(link).not.toHaveAttribute("disabled");
    expect(link).not.toHaveAttribute("target");
    expect(link).not.toHaveAttribute("rel");
  });

  test("target=_blank recebe rel=noopener noreferrer por defeito", () => {
    render(
      <Button href="https://example.com" target="_blank">
        Externo
      </Button>
    );
    const link = screen.getByRole("link", { name: "Externo" });
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });

  test("preserva um rel explícito", () => {
    render(
      <Button href="https://example.com" target="_blank" rel="noopener">
        Externo
      </Button>
    );
    expect(screen.getByRole("link")).toHaveAttribute("rel", "noopener");
  });

  test("encaminha className, aria-label, onClick e ref", async () => {
    const ref = createRef();
    const onClick = vi.fn((e) => e.preventDefault());
    render(
      <Button ref={ref} href="#x" className="ig" aria-label="Abrir Instagram" onClick={onClick}>
        @ria
      </Button>
    );
    const link = screen.getByRole("link", { name: "Abrir Instagram" });
    expect(link).toHaveClass("ig");
    expect(ref.current).toBe(link);
    await userEvent.click(link);
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
