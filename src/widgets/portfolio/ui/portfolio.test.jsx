import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Portfolio from "./portfolio";
import TeamAndServices from "@widgets/teamAndServices/ui/teamAndServices.jsx";
import { worksHair, worksEstetica, worksUnhas } from "@content/services/services.js";
import { installMatchMedia } from "../../../../tests/setup/browserMocks";

const titles = (list) => list.map((w) => w.titulo);

// Modo do dispositivo fixado por teste (o jsdom expõe ontouchstart por
// defeito, o que faria isTouchDevice() devolver true).
function setDevice(touch) {
  installMatchMedia({ "(hover: none)": touch });
  Object.defineProperty(navigator, "maxTouchPoints", { value: touch ? 5 : 0, configurable: true });
  if (!touch) delete window.ontouchstart;
}

let ontouchstartDescriptor;
beforeEach(() => {
  ontouchstartDescriptor = Object.getOwnPropertyDescriptor(window, "ontouchstart");
  // jsdom não implementa scroll/layout
  Element.prototype.scrollIntoView = vi.fn();
});
afterEach(() => {
  delete Element.prototype.scrollIntoView;
  delete navigator.maxTouchPoints;
  if (ontouchstartDescriptor) Object.defineProperty(window, "ontouchstart", ontouchstartDescriptor);
});

const section = () => screen.getByRole("region", { name: /Portfólio/i });
const filter = (name) => within(section()).getByRole("button", { name });
const cardTitles = () => within(section()).getAllByRole("heading", { level: 3 }).map((h) => h.textContent);

describe("Portfolio — filtros", () => {
  beforeEach(() => setDevice(false));

  test("Cabeleireiro ativo por defeito, com os trabalhos correspondentes", () => {
    render(<Portfolio />);
    expect(filter("Cabeleireiro")).toHaveAttribute("aria-pressed", "true");
    expect(filter("Estética")).toHaveAttribute("aria-pressed", "false");
    expect(filter("Unhas")).toHaveAttribute("aria-pressed", "false");
    expect(cardTitles()).toEqual(titles(worksHair));
  });

  test("selecionar um filtro mostra apenas o conteúdo correspondente", async () => {
    const user = userEvent.setup();
    render(<Portfolio />);
    await user.click(filter("Estética"));
    expect(filter("Estética")).toHaveAttribute("aria-pressed", "true");
    expect(filter("Cabeleireiro")).toHaveAttribute("aria-pressed", "false");
    expect(cardTitles()).toEqual(titles(worksEstetica));

    await user.click(filter("Unhas"));
    expect(cardTitles()).toEqual(titles(worksUnhas));
  });

  test("filtros ativáveis por teclado (Enter e Espaço)", async () => {
    const user = userEvent.setup();
    render(<Portfolio />);
    filter("Estética").focus();
    await user.keyboard("{Enter}");
    expect(filter("Estética")).toHaveAttribute("aria-pressed", "true");
    filter("Unhas").focus();
    await user.keyboard(" ");
    expect(filter("Unhas")).toHaveAttribute("aria-pressed", "true");
  });

  test("mudar de filtro faz scroll até ao portefólio", async () => {
    const user = userEvent.setup();
    render(<Portfolio />);
    await user.click(filter("Unhas"));
    expect(Element.prototype.scrollIntoView).toHaveBeenCalled();
  });
});

describe("Portfolio — cartões em desktop (rato/teclado)", () => {
  beforeEach(() => setDevice(false));

  test("cada cartão é um grupo focável com nome = título e descrição no DOM", async () => {
    const user = userEvent.setup();
    render(<Portfolio />);
    const groups = within(section()).getAllByRole("group");
    expect(groups).toHaveLength(worksHair.length);
    expect(groups[0]).toHaveAccessibleName(worksHair[0].titulo);
    expect(groups[0]).toHaveAttribute("tabindex", "0");
    expect(groups[0]).toHaveTextContent(worksHair[0].descricao);

    // Tab chega aos cartões depois dos filtros
    filter("Unhas").focus();
    await user.tab();
    expect(groups[0]).toHaveFocus();
    expect(screen.getAllByRole("img", { name: worksHair[0].titulo })[0]).toBeInTheDocument();
  });

  test("sem botões de alternância de toque", () => {
    render(<Portfolio />);
    const buttons = within(section()).getAllByRole("button").map((b) => b.textContent);
    expect(buttons).toEqual(["Cabeleireiro", "Estética", "Unhas"]); // só os filtros
  });
});

describe("Portfolio — cartões em ecrã tátil", () => {
  beforeEach(() => setDevice(true));

  test("toque alterna o cartão (aria-pressed) e só um fica aberto", async () => {
    const user = userEvent.setup();
    render(<Portfolio />);
    const [first, second] = within(section()).getAllByRole("button", { name: worksHair[0].titulo }).concat(
      within(section()).getAllByRole("button", { name: worksHair[1].titulo })
    );
    expect(within(section()).queryByRole("group")).not.toBeInTheDocument();
    expect(first).toHaveAttribute("aria-pressed", "false");

    await user.click(first);
    expect(first).toHaveAttribute("aria-pressed", "true");
    await user.click(second);
    expect(first).toHaveAttribute("aria-pressed", "false");
    expect(second).toHaveAttribute("aria-pressed", "true");
    await user.click(second);
    expect(second).toHaveAttribute("aria-pressed", "false");
  });

  test("tocar fora fecha; mudar de filtro fecha", async () => {
    const user = userEvent.setup();
    render(<Portfolio />);
    const card = within(section()).getByRole("button", { name: worksHair[0].titulo });
    await user.click(card);
    await user.click(document.body);
    expect(card).toHaveAttribute("aria-pressed", "false");

    await user.click(card);
    await user.click(filter("Cabeleireiro"));
    expect(within(section()).getByRole("button", { name: worksHair[0].titulo })).toHaveAttribute(
      "aria-pressed",
      "false"
    );
  });

  test("Enter/Espaço no botão de toque também alternam", async () => {
    const user = userEvent.setup();
    render(<Portfolio />);
    const card = within(section()).getByRole("button", { name: worksHair[0].titulo });
    card.focus();
    await user.keyboard("{Enter}");
    expect(card).toHaveAttribute("aria-pressed", "true");
    await user.keyboard(" ");
    expect(card).toHaveAttribute("aria-pressed", "false");
  });
});

describe("VER PORTFÓLIO (Equipa & Serviços → Portefólio)", () => {
  beforeEach(() => setDevice(false));

  test("ativa o filtro do profissional e atualiza o hash para #Works", async () => {
    const user = userEvent.setup();
    render(
      <>
        <TeamAndServices />
        <Portfolio />
      </>
    );
    const buttons = screen.getAllByRole("button", { name: "VER PORTFÓLIO" });
    expect(buttons).toHaveLength(3); // Cabeleireiro, Estética, Unhas

    await user.click(buttons[1]); // Sabrina → Estética
    expect(filter("Estética")).toHaveAttribute("aria-pressed", "true");
    expect(cardTitles()).toEqual(titles(worksEstetica));
    expect(window.location.hash).toBe("#Works");

    await user.click(buttons[2]); // Mary → Unhas
    expect(filter("Unhas")).toHaveAttribute("aria-pressed", "true");

    await user.click(buttons[0]); // Cabeleireiras
    expect(filter("Cabeleireiro")).toHaveAttribute("aria-pressed", "true");
  });
});
