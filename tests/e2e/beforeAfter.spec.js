// Slider Antes/Depois num browser real: Pointer Events (rato e toque),
// pointer capture, scroll vertical, teclado e motivos de pausa.
// O relógio da página (rAF, setTimeout, performance.now) é controlado com
// page.clock, para verificar a animação sem esperas reais.
import { test, expect, gotoHome, pauseClock, scrollToSection, setPageVisibility, touchDevice, VIEWPORTS } from "./fixtures.js";

const sliders = (page) => page.locator("#Transformations").getByRole("slider");
const groups = (page) => page.locator("#Transformations").getByRole("group", { name: /Comparação antes e depois/ });
const valueOf = async (slider) => Number(await slider.getAttribute("aria-valuenow"));
const activeSet = (page) =>
  page.locator('#Transformations button[aria-current="true"]').getAttribute("aria-label");
const pauseBtn = (page) => page.getByRole("button", { name: /animação das transformações/ });

/**
 * Home com o relógio parado; o tempo só avança com page.clock.
 * - runFor(): executa todos os frames (varrimento contínuo dos sliders);
 *   com loops rAF ativos custa ~1 s real por segundo simulado.
 * - fastForward(): salta o tempo e dispara cada temporizador devido uma vez;
 *   usado quando só interessa o setTimeout da rotação de conjuntos (6 s).
 */
async function openWithFrozenClock(page) {
  await page.clock.install();
  await gotoHome(page);
  await pauseClock(page);
  const section = await scrollToSection(page, "Transformations");
  await expect(groups(page)).toHaveCount(3);
  return section;
}

/** Ponteiro num ponto relativo (0–1) do cartão. */
async function pointAt(locator, fx, fy = 0.5) {
  const box = await locator.boundingBox();
  return { x: box.x + box.width * fx, y: box.y + box.height * fy, box };
}

/** Move o rato para fora da secção (sem hover). */
const mouseAway = (page) => page.mouse.move(2, 2);

test.describe("Slider — autoplay e pausas", () => {
  test.use({ viewport: VIEWPORTS.desktop });

  test("varre automaticamente quando visível", async ({ page }) => {
    await openWithFrozenClock(page);
    await mouseAway(page);
    const slider = sliders(page).first();
    const v0 = await valueOf(slider);
    await page.clock.runFor(1000);
    expect(await valueOf(slider)).not.toBe(v0);
  });

  test("hover pausa; ao sair retoma", async ({ page }) => {
    await openWithFrozenClock(page);
    const slider = sliders(page).first();
    const { x, y } = await pointAt(groups(page).first(), 0.5, 0.2);
    await page.mouse.move(x, y);
    const v = await valueOf(slider);
    await page.clock.runFor(3000);
    expect(await valueOf(slider)).toBe(v);

    await mouseAway(page);
    await page.clock.runFor(500);
    expect(await valueOf(slider)).not.toBe(v);
  });

  test("foco na pega pausa", async ({ page }) => {
    await openWithFrozenClock(page);
    await mouseAway(page);
    const slider = sliders(page).nth(1);
    await slider.focus();
    const v = await valueOf(slider);
    await page.clock.runFor(3000);
    expect(await valueOf(slider)).toBe(v);
  });

  test("fora do viewport não anima nem roda conjuntos", async ({ page }) => {
    await openWithFrozenClock(page);
    await mouseAway(page);
    const slider = sliders(page).first();
    await page.evaluate(() => {
      window.scrollTo(0, 0);
      document.body.scrollTo?.(0, 0);
    });
    await expect(page.locator("#Transformations")).not.toBeInViewport();
    const v = await valueOf(slider);
    const set = await activeSet(page);
    await page.clock.runFor(15000);
    expect(await valueOf(slider)).toBe(v);
    expect(await activeSet(page)).toBe(set);
  });

  test("Pausar é persistente (sem hover nem foco) e Retomar devolve o movimento", async ({ page }) => {
    await openWithFrozenClock(page);
    await pauseBtn(page).click();
    await expect(pauseBtn(page)).toHaveAccessibleName("Retomar animação das transformações");
    await mouseAway(page);
    const slider = sliders(page).first();
    const v = await valueOf(slider);
    const set = await activeSet(page);
    await page.clock.runFor(20000);
    expect(await valueOf(slider)).toBe(v);
    expect(await activeSet(page)).toBe(set);

    await pauseBtn(page).click();
    await mouseAway(page);
    await page.clock.runFor(500);
    expect(await valueOf(slider)).not.toBe(v);
  });

  test("roda conjuntos a cada 6 s e os indicadores navegam", async ({ page }) => {
    await openWithFrozenClock(page);
    await mouseAway(page);
    expect(await activeSet(page)).toBe("Conjunto 1 de 2");
    await page.clock.fastForward(6100);
    await expect.poll(() => activeSet(page)).toBe("Conjunto 2 de 2");

    await page.getByRole("button", { name: "Conjunto 1 de 2" }).click();
    expect(await activeSet(page)).toBe("Conjunto 1 de 2");
    await expect(page.locator("#Transformations article").first()).toContainText("Balayage");
  });

  test("separador oculto suspende a rotação de conjuntos", async ({ page }) => {
    await openWithFrozenClock(page);
    await mouseAway(page);
    await setPageVisibility(page, "hidden");
    await page.clock.fastForward(15000); // > 2 períodos de 6 s
    expect(await activeSet(page)).toBe("Conjunto 1 de 2");
    await setPageVisibility(page, "visible");
    await page.clock.fastForward(6100);
    await expect.poll(() => activeSet(page)).toBe("Conjunto 2 de 2");
  });

  test("movimento reduzido: começa em pausa", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await openWithFrozenClock(page);
    await mouseAway(page);
    await expect(pauseBtn(page)).toHaveAccessibleName("Retomar animação das transformações");
    const slider = sliders(page).first();
    const v = await valueOf(slider);
    await page.clock.runFor(10000);
    expect(await valueOf(slider)).toBe(v);
    expect(await activeSet(page)).toBe("Conjunto 1 de 2");
  });
});

test.describe("Slider — teclado", () => {
  test("setas, PageUp/PageDown, Home/End, limites e nome acessível", async ({ page }) => {
    await openWithFrozenClock(page);
    const slider = sliders(page).first();
    await expect(slider).toHaveAccessibleName("Posição da divisão — Balayage");
    await slider.focus();
    await expect(slider).toBeFocused();

    await page.keyboard.press("Home");
    await expect(slider).toHaveAttribute("aria-valuenow", "0");
    await page.keyboard.press("ArrowLeft");
    await expect(slider).toHaveAttribute("aria-valuenow", "0");
    await page.keyboard.press("ArrowRight");
    await expect(slider).toHaveAttribute("aria-valuenow", "2");
    await page.keyboard.press("PageUp");
    await expect(slider).toHaveAttribute("aria-valuenow", "12");
    await page.keyboard.press("End");
    await expect(slider).toHaveAttribute("aria-valuenow", "100");
    await expect(slider).toHaveAttribute("aria-valuetext", "100% da imagem depois");
    await page.keyboard.press("PageUp");
    await expect(slider).toHaveAttribute("aria-valuenow", "100");
    await page.keyboard.press("PageDown");
    await expect(slider).toHaveAttribute("aria-valuenow", "90");
  });

  test("as teclas não fazem scroll da página e o valor manual é preservado", async ({ page }) => {
    await openWithFrozenClock(page);
    const slider = sliders(page).first();
    await slider.focus();
    const scrollBefore = await page.evaluate(() => document.body.scrollTop + document.documentElement.scrollTop);
    await page.keyboard.press("PageDown");
    await page.keyboard.press("End");
    const scrollAfter = await page.evaluate(() => document.body.scrollTop + document.documentElement.scrollTop);
    expect(scrollAfter).toBe(scrollBefore);

    await slider.blur(); // sem foco nem hover: só o ajuste manual impede o autoplay
    await expect(slider).not.toBeFocused();
    await mouseAway(page);
    await page.clock.fastForward(10000);
    await expect(slider).toHaveAttribute("aria-valuenow", "100");
    expect(await activeSet(page)).toBe("Conjunto 1 de 2"); // conjunto mantido
  });
});

test.describe("Slider — rato", () => {
  test.use({ viewport: VIEWPORTS.desktop });

  test("arrastar com pointer capture; largar fora do cartão termina o arrastamento", async ({ page }) => {
    await openWithFrozenClock(page);
    const group = groups(page).first();
    const slider = sliders(page).first();
    const a = await pointAt(group, 0.25);
    await page.mouse.move(a.x, a.y);
    await page.mouse.down();
    expect(Math.abs((await valueOf(slider)) - 25)).toBeLessThanOrEqual(1);
    expect(await group.evaluate((el) => el.hasPointerCapture(1))).toBe(true);

    const b = await pointAt(group, 0.75);
    await page.mouse.move(b.x, b.y, { steps: 5 });
    expect(Math.abs((await valueOf(slider)) - 75)).toBeLessThanOrEqual(1);

    // continua a acompanhar fora do cartão (captura) e limita a 100
    await page.mouse.move(a.box.x + a.box.width + 150, b.y + 120, { steps: 5 });
    expect(await valueOf(slider)).toBe(100);
    await page.mouse.up();
    expect(await group.evaluate((el) => el.hasPointerCapture(1))).toBe(false);

    // depois de largar, mover o rato já não altera a posição
    await page.mouse.move(a.x, a.y, { steps: 5 });
    expect(await valueOf(slider)).toBe(100);
  });

  test("um clique simples posiciona a divisão", async ({ page }) => {
    await openWithFrozenClock(page);
    const group = groups(page).nth(2);
    const p = await pointAt(group, 0.4);
    await page.mouse.click(p.x, p.y);
    expect(Math.abs((await valueOf(sliders(page).nth(2))) - 40)).toBeLessThanOrEqual(1);
  });
});

test.describe("Slider — toque", () => {
  test.use(touchDevice(VIEWPORTS.mobile));

  /** Gesto de toque real (CDP → touch → Pointer Events com pointerType touch). */
  async function touchGesture(page, from, to, steps = 8) {
    const cdp = await page.context().newCDPSession(page);
    await cdp.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x: from.x, y: from.y, id: 1 }] });
    for (let i = 1; i <= steps; i++) {
      const x = from.x + ((to.x - from.x) * i) / steps;
      const y = from.y + ((to.y - from.y) * i) / steps;
      await cdp.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ x, y, id: 1 }] });
    }
    await cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
    await cdp.detach();
  }

  test("arrastar horizontalmente com o dedo move a divisão", async ({ page }) => {
    await openWithFrozenClock(page);
    const group = groups(page).first();
    await group.scrollIntoViewIfNeeded();
    const slider = sliders(page).first();
    const from = await pointAt(group, 0.3);
    const to = await pointAt(group, 0.8);
    await touchGesture(page, from, to);
    expect(Math.abs((await valueOf(slider)) - 80)).toBeLessThanOrEqual(2);
  });

  test("scroll vertical sobre o cartão não altera a posição (pointercancel)", async ({ page }) => {
    await openWithFrozenClock(page);
    await pauseBtn(page).tap(); // sem autoplay: qualquer mudança seria do gesto
    const group = groups(page).first();
    await group.scrollIntoViewIfNeeded();
    const slider = sliders(page).first();
    const v = await valueOf(slider);
    const scrollTop = () => page.evaluate(() => document.body.scrollTop + document.documentElement.scrollTop);
    const before = await scrollTop();

    await group.evaluate((el) => {
      window.__cancels = 0;
      el.addEventListener("pointercancel", () => window.__cancels++);
    });
    const from = await pointAt(group, 0.5, 0.8);
    await touchGesture(page, from, { x: from.x + 4, y: from.y - 200 }, 12);

    await expect.poll(scrollTop).toBeGreaterThan(before);
    expect(await valueOf(slider)).toBe(v);
    expect(await page.evaluate(() => window.__cancels)).toBeGreaterThan(0);
  });

  test("toque simples posiciona a divisão; indicadores respondem ao toque", async ({ page }) => {
    await openWithFrozenClock(page);
    const group = groups(page).first();
    await group.scrollIntoViewIfNeeded();
    const p = await pointAt(group, 0.2);
    await page.touchscreen.tap(p.x, p.y);
    expect(Math.abs((await valueOf(sliders(page).first())) - 20)).toBeLessThanOrEqual(2);

    await page.getByRole("button", { name: "Conjunto 2 de 2" }).tap();
    expect(await activeSet(page)).toBe("Conjunto 2 de 2");
  });
});
