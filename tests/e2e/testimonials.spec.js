// Carrossel de Testemunhos num browser real. O tempo é medido pela animação
// CSS da barra de progresso (não por timers JS), por isso aqui verifica-se o
// estado efetivo da animação através da Web Animations API
// (document.getAnimations): playState e currentTime.
import { test, expect, gotoHome, scrollToSection, setPageVisibility, VIEWPORTS } from "./fixtures.js";
import data from "../../src/content/testimonials/testimonials.json" with { type: "json" };

test.use({ viewport: VIEWPORTS.desktop });

const section = (page) => page.locator("#Testimonials");
const activeAuthor = (page) => section(page).locator('[data-active="true"] span').first().textContent();
const pauseBtn = (page) => page.getByRole("button", { name: /rotação dos testemunhos/ });

/** Estado das animações de progresso (só existe a do cartão ativo). */
const progress = (page) =>
  page.evaluate(() =>
    document
      .getAnimations()
      .filter((a) => /progressFill/.test(a.animationName)) // nome com hash (CSS Modules)
      .map((a) => ({ state: a.playState, time: Number(a.currentTime) }))
  );

async function open(page) {
  await gotoHome(page);
  await scrollToSection(page, "Testimonials");
  await page.mouse.move(2, 2); // sem hover sobre a secção
  await expect(section(page)).toBeInViewport();
}

test("roda automaticamente pela ordem dos dados, uma animação de cada vez", async ({ page }) => {
  await open(page);
  expect(await activeAuthor(page)).toBe(data[0].author);
  await expect.poll(() => progress(page)).toEqual([expect.objectContaining({ state: "running" })]);

  // regista as trocas de cartão para detetar avanços duplicados
  await page.evaluate(() => {
    window.__changes = [];
    const root = document.getElementById("Testimonials");
    new MutationObserver((records) => {
      for (const r of records) {
        if (r.target.getAttribute("data-active") === "true") window.__changes.push(performance.now());
      }
    }).observe(root, { attributes: true, attributeFilter: ["data-active"], subtree: true });
  });

  await expect.poll(() => activeAuthor(page), { timeout: 5000 }).toBe(data[1].author);
  await expect.poll(() => activeAuthor(page), { timeout: 5000 }).toBe(data[2].author);
  const changes = await page.evaluate(() => window.__changes);
  expect(changes).toHaveLength(2);
  expect(changes[1] - changes[0]).toBeGreaterThan(2500); // ~3 s por cartão
  expect(await progress(page)).toHaveLength(1);
});

test("Pausar congela o progresso; Retomar continua do mesmo ponto", async ({ page }) => {
  await open(page);
  await expect.poll(async () => (await progress(page))[0]?.time ?? 0).toBeGreaterThan(300);
  await pauseBtn(page).click();
  await expect(pauseBtn(page)).toHaveAccessibleName("Retomar rotação dos testemunhos");
  await page.mouse.move(2, 2);
  await expect.poll(async () => (await progress(page))[0].state).toBe("paused");
  const frozen = (await progress(page))[0].time;
  expect(frozen).toBeGreaterThan(0);
  expect(frozen).toBeLessThan(3000);
  const author = await activeAuthor(page);

  await page.waitForTimeout(800); // tempo real: a animação CSS não usa o relógio JS
  expect((await progress(page))[0].time).toBe(frozen);
  expect(await activeAuthor(page)).toBe(author);

  // o clique de rato foca o botão, mas sem :focus-visible não deve pausar
  await pauseBtn(page).click();
  await page.mouse.move(2, 2);
  await expect.poll(async () => (await progress(page))[0].state).toBe("running");
  expect((await progress(page))[0].time).toBeGreaterThanOrEqual(frozen);
});

test("hover pausa e sair retoma", async ({ page }) => {
  await open(page);
  await section(page).locator('[data-active="true"]').hover();
  await expect.poll(async () => (await progress(page))[0].state).toBe("paused");
  await page.mouse.move(2, 2);
  await expect.poll(async () => (await progress(page))[0].state).toBe("running");
});

test("foco de teclado dentro da secção pausa", async ({ page }) => {
  await open(page);
  await pauseBtn(page).focus(); // foco programático após teclado → :focus-visible
  await page.keyboard.press("Shift+Tab");
  await page.keyboard.press("Tab");
  await expect(pauseBtn(page)).toBeFocused();
  await expect.poll(async () => (await progress(page))[0].state).toBe("paused");
});

test("fora do viewport pausa e preserva o progresso", async ({ page }) => {
  await open(page);
  await expect.poll(async () => (await progress(page))[0]?.time ?? 0).toBeGreaterThan(300);
  await page.evaluate(() => {
    window.scrollTo(0, 0);
    document.body.scrollTo?.(0, 0);
  });
  await expect(section(page)).not.toBeInViewport();
  await expect.poll(async () => (await progress(page))[0].state).toBe("paused");
  const frozen = (await progress(page))[0].time;
  await scrollToSection(page, "Testimonials");
  await expect.poll(async () => (await progress(page))[0].state).toBe("running");
  expect((await progress(page))[0].time).toBeGreaterThanOrEqual(frozen);
});

test("separador oculto pausa (simulado via visibilitychange)", async ({ page }) => {
  await open(page);
  await setPageVisibility(page, "hidden");
  await expect.poll(async () => (await progress(page))[0].state).toBe("paused");
  await setPageVisibility(page, "visible");
  await expect.poll(async () => (await progress(page))[0].state).toBe("running");
});

test("movimento reduzido começa em pausa; Retomar mantém a duração real", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await open(page);
  await expect(pauseBtn(page)).toHaveAccessibleName("Retomar rotação dos testemunhos");
  await expect.poll(async () => (await progress(page))[0].state).toBe("paused");

  await pauseBtn(page).click();
  await page.mouse.move(2, 2);
  await expect.poll(async () => (await progress(page))[0].state).toBe("running");
  // a regra global de movimento reduzido não pode encurtar a barra
  const duration = await page.evaluate(
    () => document.getAnimations().find((a) => /progressFill/.test(a.animationName)).effect.getTiming().duration
  );
  expect(duration).toBe(3000);
  expect(await activeAuthor(page)).toBe(data[0].author);
});

test("sem setInterval na página (a rotação não usa timers JS)", async ({ page }) => {
  await page.addInitScript(() => {
    window.__intervals = 0;
    const original = window.setInterval;
    window.setInterval = (...args) => {
      window.__intervals++;
      return original(...args);
    };
  });
  await open(page);
  await expect.poll(() => activeAuthor(page), { timeout: 5000 }).toBe(data[1].author);
  expect(await page.evaluate(() => window.__intervals)).toBe(0);
});

test("continua a funcionar depois de navegar entre rotas", async ({ page }) => {
  await open(page);
  await page.getByRole("link", { name: "Termos & Condições" }).click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Termos & Condições");
  await page.goBack();
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await scrollToSection(page, "Testimonials");
  await page.mouse.move(2, 2);
  await expect.poll(() => progress(page)).toEqual([expect.objectContaining({ state: "running" })]);
  const first = await activeAuthor(page);
  await expect.poll(() => activeAuthor(page), { timeout: 5000 }).not.toBe(first);
});
