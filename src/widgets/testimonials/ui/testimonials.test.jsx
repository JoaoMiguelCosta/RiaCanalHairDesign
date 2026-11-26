// Testes jsdom da lógica do carrossel: estado ativo, motivos de pausa e
// avanço no fim da animação. O progresso/pausa visual da animação CSS só
// existe num browser real e é verificado em tests/e2e/testimonials.spec.js.
import { beforeEach, describe, expect, test, vi } from "vitest";
import { act, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Testimonials from "./testimonials";
import data from "@content/testimonials/testimonials.json";
import {
  installIntersectionObserver,
  installMatchMedia,
  installPointerEvent,
  mockVisibility,
  REDUCED_MOTION,
} from "../../../../tests/setup/browserMocks";

const unquote = (t) => t.replace(/^\s*[“”"«]\s*/, "").replace(/\s*[“”"»]\s*$/, "");

function setup({ reducedMotion = false } = {}) {
  const io = installIntersectionObserver();
  installMatchMedia({ [REDUCED_MOTION]: reducedMotion });
  installPointerEvent();
  const vis = mockVisibility("visible");
  const utils = render(<Testimonials />);
  const section = screen.getByRole("region", { name: /O Que Dizem/ });
  const cards = () => [...section.querySelectorAll("[data-active]")];
  const activeCard = () => section.querySelector('[data-active="true"]');
  return {
    ...utils,
    io,
    vis,
    section,
    cards,
    activeCard,
    activeIndex: () => cards().indexOf(activeCard()),
    isRunning: () => activeCard().getAttribute("data-running") === "true",
    show: () => act(() => io.setIntersecting(section, true)),
    hide: () => act(() => io.setIntersecting(section, false)),
    /** Simula o fim da animação CSS da barra do cartão ativo. */
    endProgress: () => fireEvent.animationEnd(activeCard().querySelector("[style]")),
    pauseButton: () => screen.getByRole("button", { name: /rotação dos testemunhos/ }),
  };
}

describe("Testimonials", () => {
  test("renderiza todos os testemunhos pela ordem dos dados, 1.º ativo", () => {
    const { cards, activeIndex } = setup();
    expect(cards()).toHaveLength(data.length);
    cards().forEach((card, i) => expect(card).toHaveTextContent(data[i].author));
    expect(activeIndex()).toBe(0);
  });

  test("o destaque acompanha o cartão ativo, sem aspas duplicadas", () => {
    const { section } = setup();
    const first = data[0];
    expect(section).toHaveTextContent(`“${unquote(first.quote)}”`);
    expect(section).not.toHaveTextContent(`““`);
    expect(section).toHaveTextContent(`${first.service} · ${first.location}`);
  });

  test("a duração da barra é passada ao CSS (3 s por cartão)", () => {
    const { activeCard } = setup();
    expect(activeCard().querySelector("[style]").style.getPropertyValue("--progress-duration")).toBe("3000ms");
  });

  test("só corre visível no viewport; fora dele fica parado", () => {
    const { show, hide, isRunning } = setup();
    expect(isRunning()).toBe(false);
    show();
    expect(isRunning()).toBe(true);
    hide();
    expect(isRunning()).toBe(false);
  });

  test("apenas o cartão ativo tem a animação a correr", () => {
    const { show, cards } = setup();
    show();
    const running = cards().filter((c) => c.getAttribute("data-running") === "true");
    expect(running).toHaveLength(1);
  });

  test("o fim da animação avança pela ordem e dá a volta", () => {
    const { show, endProgress, activeIndex, section } = setup();
    show();
    for (let i = 1; i <= data.length; i++) {
      endProgress();
      expect(activeIndex()).toBe(i % data.length);
    }
    expect(section).toHaveTextContent(data[0].author);
  });

  test("animationend de um cartão inativo não avança", () => {
    const { show, cards, activeIndex } = setup();
    show();
    fireEvent.animationEnd(cards()[2].querySelector("[style]"));
    expect(activeIndex()).toBe(0);
  });

  test("Pausar/Retomar explícito", async () => {
    const user = userEvent.setup();
    const { show, isRunning, pauseButton, section } = setup();
    show();
    await user.click(pauseButton());
    expect(pauseButton()).toHaveAccessibleName("Retomar rotação dos testemunhos");
    expect(pauseButton()).toHaveAttribute("title", "Retomar");
    await user.unhover(section);
    expect(isRunning()).toBe(false);

    await user.click(pauseButton());
    await user.unhover(section);
    expect(pauseButton()).toHaveAccessibleName("Pausar rotação dos testemunhos");
    // O jsdom trata :focus-visible como :focus, pelo que aqui o foco deixado
    // pelo clique ainda pausa; num browser real não pausa (ver E2E).
    act(() => pauseButton().blur());
    expect(isRunning()).toBe(true);
  });

  test("pausa com hover de rato, não com toque", () => {
    const { show, isRunning, section } = setup();
    show();
    fireEvent.pointerOver(section, { pointerType: "mouse" });
    expect(isRunning()).toBe(false);
    fireEvent.pointerOut(section, { pointerType: "mouse", relatedTarget: document.body });
    expect(isRunning()).toBe(true);
    fireEvent.pointerOver(section, { pointerType: "touch" });
    expect(isRunning()).toBe(true);
  });

  // Regressão: o pointerleave pode perder-se (ex.: o ícone sob o ponteiro é
  // substituído no clique em Pausar/Retomar); mover o ponteiro para fora da
  // secção também termina o hover.
  test("hover termina com movimento fora da secção, mesmo sem pointerleave", () => {
    const { show, isRunning, section, pauseButton } = setup();
    show();
    fireEvent.pointerOver(section, { pointerType: "mouse" });
    expect(isRunning()).toBe(false);
    fireEvent.pointerMove(pauseButton(), { pointerType: "mouse" }); // dentro: mantém
    expect(isRunning()).toBe(false);
    fireEvent.pointerMove(document.body, { pointerType: "touch" }); // toque: ignorado
    expect(isRunning()).toBe(false);
    fireEvent.pointerMove(document.body, { pointerType: "mouse" }); // fora: retoma
    expect(isRunning()).toBe(true);
  });

  test("pausa com foco de teclado e retoma ao sair da secção", async () => {
    const user = userEvent.setup();
    const { show, isRunning, pauseButton } = setup();
    show();
    await user.tab();
    expect(pauseButton()).toHaveFocus();
    expect(isRunning()).toBe(false);
    await user.tab(); // sai da secção
    expect(isRunning()).toBe(true);
  });

  test("pausa com a página oculta", () => {
    const { show, vis, isRunning } = setup();
    show();
    act(() => vis.set("hidden"));
    expect(isRunning()).toBe(false);
    act(() => vis.set("visible"));
    expect(isRunning()).toBe(true);
  });

  test("movimento reduzido começa em pausa", () => {
    const { show, isRunning, pauseButton } = setup({ reducedMotion: true });
    show();
    expect(isRunning()).toBe(false);
    expect(pauseButton()).toHaveAccessibleName("Retomar rotação dos testemunhos");
  });

  test("não usa timers JavaScript para medir o tempo", () => {
    vi.useFakeTimers();
    const { show } = setup();
    show();
    expect(vi.getTimerCount()).toBe(0);
  });

  test("os indicadores (bolinhas) são decorativos", () => {
    const { section } = setup();
    const dots = section.querySelector('[aria-hidden="true"]');
    expect(dots).toBeInTheDocument();
    expect(screen.queryByRole("tab")).not.toBeInTheDocument();
  });
});

describe("Testimonials — cleanup", () => {
  beforeEach(() => vi.useFakeTimers());

  test("desliga o observer ao desmontar", () => {
    const { show, unmount, io } = setup();
    show();
    unmount();
    expect(io.active()).toHaveLength(0);
    expect(vi.getTimerCount()).toBe(0);
  });
});
