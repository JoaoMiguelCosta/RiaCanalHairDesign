import { beforeEach, describe, expect, test, vi } from "vitest";
import { act, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import BeforeAndAfterSection from "./beforeAndAfter";
import BeforeAfter from "@content/gallery/beforeAfter.js";
import {
  FAKE_TIMERS_WITH_RAF,
  installIntersectionObserver,
  installPointerEvent,
  userEventWithFakeTimers,
  installMatchMedia,
  mockVisibility,
  REDUCED_MOTION,
} from "../../../../tests/setup/browserMocks";

const ROTATE_MS = 6000;
const TOTAL_SETS = Math.ceil(BeforeAfter.length / 3);

function setup({ reducedMotion = false } = {}) {
  const io = installIntersectionObserver();
  installPointerEvent();
  const mm = installMatchMedia({ [REDUCED_MOTION]: reducedMotion });
  const vis = mockVisibility("visible");
  const utils = render(<BeforeAndAfterSection />);
  const section = screen.getByRole("region", { name: /Transformações/ });
  return {
    ...utils,
    io,
    mm,
    vis,
    section,
    showSection: () => act(() => io.setIntersecting(section, true)),
    hideSection: () => act(() => io.setIntersecting(section, false)),
    tick: (ms) => act(() => vi.advanceTimersByTime(ms)),
    activeDot: () =>
      screen.getAllByRole("button", { name: /^Conjunto \d de/ }).find((b) => b.getAttribute("aria-current") === "true"),
    // título visível de cada cartão (TitleCaption: 1.º <p>)
    cardTitles: () => screen.getAllByRole("article").map((a) => a.querySelector("p").textContent),
    pauseButton: () => screen.getByRole("button", { name: /animação das transformações/ }),
  };
}

describe("BeforeAndAfterSection", () => {
  beforeEach(() => vi.useFakeTimers(FAKE_TIMERS_WITH_RAF));

  test("pressuposto: os dados têm mais de um conjunto", () => {
    expect(TOTAL_SETS).toBeGreaterThan(1);
  });

  test("mostra o 1.º conjunto e os indicadores de conjuntos", () => {
    const { activeDot, cardTitles } = setup();
    expect(activeDot()).toHaveAccessibleName(`Conjunto 1 de ${TOTAL_SETS}`);
    expect(cardTitles()).toEqual(BeforeAfter.slice(0, 3).map((c) => c.title));
  });

  test("roda para o conjunto seguinte após 6 s visível", () => {
    const { showSection, tick, activeDot, cardTitles } = setup();
    showSection();
    tick(ROTATE_MS - 1);
    expect(activeDot()).toHaveAccessibleName(`Conjunto 1 de ${TOTAL_SETS}`);
    tick(1);
    expect(activeDot()).toHaveAccessibleName(`Conjunto 2 de ${TOTAL_SETS}`);
    expect(cardTitles()).toEqual(BeforeAfter.slice(3, 6).map((c) => c.title));
  });

  test("não roda fora do viewport nem com a página oculta", () => {
    const { showSection, hideSection, vis, tick, activeDot } = setup();
    tick(ROTATE_MS * 2);
    expect(activeDot()).toHaveAccessibleName(/^Conjunto 1/);

    showSection();
    act(() => vis.set("hidden"));
    tick(ROTATE_MS * 2);
    expect(activeDot()).toHaveAccessibleName(/^Conjunto 1/);

    act(() => vis.set("visible"));
    hideSection();
    tick(ROTATE_MS * 2);
    expect(activeDot()).toHaveAccessibleName(/^Conjunto 1/);
  });

  test("pausa com hover de rato e retoma com intervalo completo ao sair", () => {
    const { showSection, tick, activeDot, section } = setup();
    showSection();
    tick(ROTATE_MS - 1000);
    fireEvent.pointerOver(section, { pointerType: "mouse" });
    tick(ROTATE_MS * 2);
    expect(activeDot()).toHaveAccessibleName(/^Conjunto 1/);

    fireEvent.pointerOut(section, { pointerType: "mouse", relatedTarget: document.body });
    tick(ROTATE_MS - 1);
    expect(activeDot()).toHaveAccessibleName(/^Conjunto 1/);
    tick(1);
    expect(activeDot()).toHaveAccessibleName(/^Conjunto 2/);
  });

  test("pausa com foco de teclado dentro da secção", async () => {
    const user = userEvent.setup(userEventWithFakeTimers);
    const { showSection, tick, activeDot } = setup();
    showSection();
    await user.tab(); // 1.º controlo: "Conjunto anterior"
    expect(screen.getByRole("button", { name: "Conjunto anterior" })).toHaveFocus();
    tick(ROTATE_MS * 2);
    expect(activeDot()).toHaveAccessibleName(/^Conjunto 1/);
  });

  test("Pausar é persistente; Retomar volta a rodar", async () => {
    const user = userEvent.setup(userEventWithFakeTimers);
    const { showSection, tick, activeDot, pauseButton, section } = setup();
    showSection();
    await user.click(pauseButton());
    expect(pauseButton()).toHaveAccessibleName("Retomar animação das transformações");
    fireEvent.pointerOut(section, { pointerType: "mouse", relatedTarget: document.body });
    act(() => document.activeElement.blur());
    tick(ROTATE_MS * 3);
    expect(activeDot()).toHaveAccessibleName(/^Conjunto 1/);

    await user.click(pauseButton());
    expect(pauseButton()).toHaveAccessibleName("Pausar animação das transformações");
    fireEvent.pointerOut(section, { pointerType: "mouse", relatedTarget: document.body });
    act(() => document.activeElement.blur());
    tick(ROTATE_MS);
    expect(activeDot()).toHaveAccessibleName(/^Conjunto 2/);
  });

  test("movimento reduzido começa em pausa; a escolha explícita prevalece", async () => {
    const user = userEvent.setup(userEventWithFakeTimers);
    const { showSection, tick, activeDot, pauseButton, mm } = setup({ reducedMotion: true });
    showSection();
    expect(pauseButton()).toHaveAccessibleName("Retomar animação das transformações");
    tick(ROTATE_MS * 2);
    expect(activeDot()).toHaveAccessibleName(/^Conjunto 1/);

    await user.click(pauseButton()); // Retomar explícito
    act(() => mm.set(REDUCED_MOTION, true)); // nova notificação não anula a escolha
    expect(pauseButton()).toHaveAccessibleName("Pausar animação das transformações");
  });

  test("um ajuste manual mantém o conjunto até nova navegação", async () => {
    const { showSection, tick, activeDot } = setup();
    showSection();
    const [slider] = screen.getAllByRole("slider");
    fireEvent.keyDown(slider, { key: "End" });
    tick(ROTATE_MS * 3);
    expect(activeDot()).toHaveAccessibleName(/^Conjunto 1/);
    expect(Number(slider.getAttribute("aria-valuenow"))).toBe(100);

    fireEvent.click(screen.getByRole("button", { name: "Conjunto seguinte" }));
    expect(activeDot()).toHaveAccessibleName(/^Conjunto 2/);
    tick(ROTATE_MS);
    expect(activeDot()).toHaveAccessibleName(/^Conjunto 1/); // rotação retomada
  });

  test("anterior/seguinte e indicadores navegam com wrap-around", () => {
    const { activeDot } = setup();
    fireEvent.click(screen.getByRole("button", { name: "Conjunto anterior" }));
    expect(activeDot()).toHaveAccessibleName(`Conjunto ${TOTAL_SETS} de ${TOTAL_SETS}`);
    fireEvent.click(screen.getByRole("button", { name: `Conjunto 1 de ${TOTAL_SETS}` }));
    expect(activeDot()).toHaveAccessibleName(`Conjunto 1 de ${TOTAL_SETS}`);
  });

  test("uma navegação manual reinicia o intervalo (sem rotação imediata)", () => {
    const { showSection, tick, activeDot } = setup();
    showSection();
    tick(ROTATE_MS - 100);
    fireEvent.click(screen.getByRole("button", { name: "Conjunto seguinte" }));
    tick(200);
    expect(activeDot()).toHaveAccessibleName(/^Conjunto 2/);
  });

  test("sem timers, loops nem observers após desmontar", () => {
    const { showSection, unmount, io } = setup();
    showSection();
    act(() => io.setAll(true));
    expect(vi.getTimerCount()).toBeGreaterThan(0);
    unmount();
    expect(vi.getTimerCount()).toBe(0);
    expect(io.active()).toHaveLength(0);
  });
});
