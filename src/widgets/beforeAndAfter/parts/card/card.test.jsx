import { beforeEach, describe, expect, test, vi } from "vitest";
import { StrictMode } from "react";
import { act, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Card from "./card";
import {
  FAKE_TIMERS_WITH_RAF,
  installIntersectionObserver,
  installPointerEvent,
  userEventWithFakeTimers,
} from "../../../../../tests/setup/browserMocks";

// Varrimento: 35 %/s; permanência em 100 %: 1500 ms (useBeforeAfterSlider)
const RECT = { left: 100, top: 0, width: 400, height: 300, right: 500, bottom: 300, x: 100, y: 0 };

function setup(props = {}, { strict = false } = {}) {
  const io = installIntersectionObserver();
  installPointerEvent();
  const onManualChange = vi.fn();
  const ui = (p) => (
    <Card
      title="Balayage"
      caption="Reflexos naturais"
      beforeSrc="/before.webp"
      afterSrc="/after.webp"
      beforeAlt="Antes — Balayage"
      afterAlt="Depois — Balayage"
      onManualChange={onManualChange}
      {...p}
    />
  );
  const wrap = (node) => (strict ? <StrictMode>{node}</StrictMode> : node);
  const utils = render(wrap(ui(props)));
  const slider = screen.getByRole("slider", { name: "Posição da divisão — Balayage" });
  const group = screen.getByRole("group", { name: "Comparação antes e depois — Balayage" });
  vi.spyOn(group, "getBoundingClientRect").mockReturnValue(RECT);
  return {
    ...utils,
    io,
    slider,
    group,
    onManualChange,
    value: () => Number(slider.getAttribute("aria-valuenow")),
    show: () => act(() => io.setIntersecting(group, true)),
    hide: () => act(() => io.setIntersecting(group, false)),
    tick: (ms) => act(() => vi.advanceTimersByTime(ms)),
    rerenderWith: (p) => utils.rerender(wrap(ui({ ...props, ...p }))),
  };
}

describe("BeforeAfter Card — estrutura acessível", () => {
  beforeEach(() => vi.useFakeTimers(FAKE_TIMERS_WITH_RAF));

  test("slider com nome, limites e valor inicial", () => {
    const { slider } = setup();
    expect(slider).toHaveAttribute("tabindex", "0");
    expect(slider).toHaveAttribute("aria-valuemin", "0");
    expect(slider).toHaveAttribute("aria-valuemax", "100");
    expect(slider).toHaveAttribute("aria-valuenow", "50");
    expect(slider).toHaveAttribute("aria-valuetext", "50% da imagem depois");
    expect(screen.getByRole("img", { name: "Antes — Balayage" })).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "Depois — Balayage" })).toBeInTheDocument();
    expect(screen.getByRole("article")).toHaveTextContent("Reflexos naturais");
  });
});

describe("BeforeAfter Card — autoplay e pausas", () => {
  beforeEach(() => vi.useFakeTimers(FAKE_TIMERS_WITH_RAF));

  test("sem animação enquanto o cartão está fora do viewport", () => {
    const { value, tick } = setup();
    expect(vi.getTimerCount()).toBe(0);
    tick(2000);
    expect(value()).toBe(50);
  });

  test("varre até 100 %, mantém-se 1,5 s e recomeça em 0 %", () => {
    const { value, show, tick } = setup();
    show();
    tick(1000);
    expect(value()).toBeGreaterThanOrEqual(84);
    expect(value()).toBeLessThanOrEqual(86);
    tick(500); // 85 + 35 %/s × 0,43 s → 100 aos ~1430 ms
    expect(value()).toBe(100);
    tick(1000); // 2500 ms: ainda na permanência (termina aos ~2930 ms)
    expect(value()).toBe(100);
    tick(600); // 3100 ms: recomeçou em 0 %
    expect(value()).toBeLessThan(10);
  });

  test("um único loop rAF, também em StrictMode", () => {
    const { show } = setup({}, { strict: true });
    show();
    expect(vi.getTimerCount()).toBe(1);
  });

  test("pausa com hover de rato e retoma ao sair", () => {
    const { value, show, tick, group } = setup();
    show();
    fireEvent.pointerOver(group, { pointerType: "mouse" });
    const v = value();
    tick(1000);
    expect(value()).toBe(v);
    expect(vi.getTimerCount()).toBe(0);

    fireEvent.pointerOut(group, { pointerType: "mouse", relatedTarget: document.body });
    tick(500);
    expect(value()).toBeGreaterThan(v);
  });

  test("toque não conta como hover", () => {
    const { value, show, tick, group } = setup();
    show();
    fireEvent.pointerOver(group, { pointerType: "touch" });
    tick(500);
    expect(value()).toBeGreaterThan(50);
  });

  test("pausa com foco na pega e retoma ao perder o foco", () => {
    const { value, show, tick, slider } = setup();
    show();
    act(() => slider.focus());
    const v = value();
    tick(1000);
    expect(value()).toBe(v);

    act(() => slider.blur());
    tick(500);
    expect(value()).toBeGreaterThan(v);
  });

  test("pausa fora do viewport sem reiniciar a posição", () => {
    const { value, show, hide, tick } = setup();
    show();
    tick(500);
    hide();
    const v = value();
    tick(2000);
    expect(value()).toBe(v);
    show();
    tick(200);
    expect(value()).toBeGreaterThan(v);
  });

  test("autoplay=false (pausa explícita/movimento reduzido) congela; true retoma", () => {
    const { value, show, tick, rerenderWith } = setup({ autoplay: false });
    show();
    tick(1000);
    expect(value()).toBe(50);
    expect(vi.getTimerCount()).toBe(0);

    rerenderWith({ autoplay: true });
    tick(500);
    expect(value()).toBeGreaterThan(50);
  });
});

describe("BeforeAfter Card — teclado", () => {
  beforeEach(() => vi.useFakeTimers(FAKE_TIMERS_WITH_RAF));

  test("setas, PageUp/PageDown, Home/End e limites 0–100", async () => {
    const user = userEvent.setup(userEventWithFakeTimers);
    const { slider, value } = setup({ autoplay: false });
    await user.tab();
    expect(slider).toHaveFocus();

    await user.keyboard("{ArrowRight}");
    expect(value()).toBe(52);
    await user.keyboard("{ArrowUp}");
    expect(value()).toBe(54);
    await user.keyboard("{ArrowLeft}{ArrowDown}");
    expect(value()).toBe(50);
    await user.keyboard("{PageUp}");
    expect(value()).toBe(60);
    await user.keyboard("{PageDown}{PageDown}");
    expect(value()).toBe(40);
    await user.keyboard("{End}");
    expect(value()).toBe(100);
    await user.keyboard("{ArrowRight}{PageUp}");
    expect(value()).toBe(100);
    await user.keyboard("{Home}");
    expect(value()).toBe(0);
    await user.keyboard("{ArrowLeft}{PageDown}");
    expect(value()).toBe(0);
    expect(slider).toHaveAttribute("aria-valuetext", "0% da imagem depois");
  });

  test("as teclas do slider não fazem scroll; outras teclas são ignoradas", () => {
    const { slider, value } = setup({ autoplay: false });
    const ev = new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true, cancelable: true });
    act(() => slider.dispatchEvent(ev));
    expect(ev.defaultPrevented).toBe(true);

    const other = new KeyboardEvent("keydown", { key: "a", bubbles: true, cancelable: true });
    act(() => slider.dispatchEvent(other));
    expect(other.defaultPrevented).toBe(false);
    expect(value()).toBe(52);
  });

  test("um ajuste manual é preservado: o autoplay não volta a disputar o valor", () => {
    const { slider, value, show, tick, onManualChange } = setup();
    show();
    act(() => slider.focus());
    fireEvent.keyDown(slider, { key: "Home" });
    act(() => slider.blur()); // sem foco nem hover…
    tick(3000);
    expect(value()).toBe(0); // …o valor manual mantém-se
    expect(vi.getTimerCount()).toBe(0);
    expect(onManualChange).toHaveBeenCalledTimes(1);

    fireEvent.keyDown(slider, { key: "End" });
    expect(onManualChange).toHaveBeenCalledTimes(1); // só avisa a 1.ª vez
  });

  test("só um Retomar explícito (resumeSignal) devolve o autoplay ao cartão ajustado", () => {
    const { slider, value, show, tick, rerenderWith } = setup({ resumeSignal: 0 });
    show();
    fireEvent.keyDown(slider, { key: "Home" });
    rerenderWith({ autoplay: false, resumeSignal: 0 });
    rerenderWith({ autoplay: true, resumeSignal: 0 }); // mudança de preferência
    tick(1000);
    expect(value()).toBe(0);

    rerenderWith({ autoplay: true, resumeSignal: 1 }); // Retomar
    tick(1000);
    expect(value()).toBeGreaterThan(0);
  });
});

describe("BeforeAfter Card — ponteiro (lógica; o gesto real é testado em E2E)", () => {
  beforeEach(() => vi.useFakeTimers(FAKE_TIMERS_WITH_RAF));

  test("rato: posiciona no clique e acompanha o arrastamento", () => {
    const { group, value, onManualChange } = setup({ autoplay: false });
    fireEvent.pointerDown(group, { pointerId: 1, pointerType: "mouse", button: 0, clientX: 200, clientY: 10 });
    expect(value()).toBe(25);
    fireEvent.pointerMove(group, { pointerId: 1, pointerType: "mouse", clientX: 400, clientY: 10 });
    expect(value()).toBe(75);
    fireEvent.pointerUp(group, { pointerId: 1, pointerType: "mouse", clientX: 400, clientY: 10 });
    fireEvent.pointerMove(group, { pointerId: 1, pointerType: "mouse", clientX: 150, clientY: 10 });
    expect(value()).toBe(75); // depois de largar já não acompanha
    expect(onManualChange).toHaveBeenCalledTimes(1);
  });

  test("rato fora do cartão fica limitado a 0–100", () => {
    const { group, value } = setup({ autoplay: false });
    fireEvent.pointerDown(group, { pointerId: 1, pointerType: "mouse", button: 0, clientX: 300, clientY: 10 });
    fireEvent.pointerMove(group, { pointerId: 1, pointerType: "mouse", clientX: 900, clientY: 10 });
    expect(value()).toBe(100);
    fireEvent.pointerMove(group, { pointerId: 1, pointerType: "mouse", clientX: -50, clientY: 10 });
    expect(value()).toBe(0);
  });

  test("botão secundário do rato é ignorado", () => {
    const { group, value } = setup({ autoplay: false });
    fireEvent.pointerDown(group, { pointerId: 1, pointerType: "mouse", button: 2, clientX: 200 });
    expect(value()).toBe(50);
  });

  test("toque: um gesto vertical (scroll) não altera a posição", () => {
    const { group, value, onManualChange } = setup({ autoplay: false });
    fireEvent.pointerDown(group, { pointerId: 7, pointerType: "touch", button: 0, clientX: 300, clientY: 100 });
    fireEvent.pointerMove(group, { pointerId: 7, pointerType: "touch", clientX: 304, clientY: 140 });
    fireEvent.pointerCancel(group, { pointerId: 7, pointerType: "touch", clientX: 304, clientY: 160 });
    expect(value()).toBe(50);
    expect(onManualChange).not.toHaveBeenCalled();
  });

  test("toque: gesto horizontal claro arrasta a divisão", () => {
    const { group, value } = setup({ autoplay: false });
    fireEvent.pointerDown(group, { pointerId: 7, pointerType: "touch", button: 0, clientX: 300, clientY: 100 });
    fireEvent.pointerMove(group, { pointerId: 7, pointerType: "touch", clientX: 340, clientY: 102 });
    expect(value()).toBe(60);
    fireEvent.pointerUp(group, { pointerId: 7, pointerType: "touch", clientX: 340, clientY: 102 });
    expect(value()).toBe(60);
  });

  test("toque simples posiciona no ponto tocado", () => {
    const { group, value } = setup({ autoplay: false });
    fireEvent.pointerDown(group, { pointerId: 7, pointerType: "touch", button: 0, clientX: 180, clientY: 100 });
    expect(value()).toBe(50); // ainda não sabe se é scroll
    fireEvent.pointerUp(group, { pointerId: 7, pointerType: "touch", clientX: 181, clientY: 101 });
    expect(value()).toBe(20);
  });

  test("pointercancel durante o arrastamento termina sem saltos", () => {
    const { group, value } = setup({ autoplay: false });
    fireEvent.pointerDown(group, { pointerId: 1, pointerType: "mouse", button: 0, clientX: 200, clientY: 10 });
    fireEvent.pointerCancel(group, { pointerId: 1, pointerType: "mouse", clientX: 450, clientY: 10 });
    fireEvent.pointerMove(group, { pointerId: 1, pointerType: "mouse", clientX: 450, clientY: 10 });
    expect(value()).toBe(25);
  });

  test("durante o arrastamento o autoplay não corre", () => {
    const { group, value, show, tick } = setup();
    show();
    fireEvent.pointerDown(group, { pointerId: 7, pointerType: "touch", button: 0, clientX: 300, clientY: 100 });
    tick(1000);
    expect(value()).toBe(50);
  });
});

describe("BeforeAfter Card — ciclo de vida", () => {
  beforeEach(() => vi.useFakeTimers(FAKE_TIMERS_WITH_RAF));

  test("cancela o loop e o observer ao desmontar", () => {
    const { show, unmount, io } = setup();
    show();
    expect(vi.getTimerCount()).toBe(1);
    unmount();
    expect(vi.getTimerCount()).toBe(0);
    expect(io.active()).toHaveLength(0);
  });
});
