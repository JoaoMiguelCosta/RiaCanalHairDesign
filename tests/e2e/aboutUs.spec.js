// Rotação das fotografias de Quem Somos num browser real (IntersectionObserver
// e eventos de erro de imagem reais; timers controlados com page.clock).
import { test, expect, gotoHome, pauseClock, scrollToSection, setPageVisibility, VIEWPORTS } from "./fixtures.js";

test.use({ viewport: VIEWPORTS.desktop });

const photo = (page) => page.locator("#AboutUs").getByRole("img", { name: "Entrada do Salão" });
const currentFile = async (page) => {
  const img = photo(page);
  if ((await img.count()) === 0) return null;
  return (await img.getAttribute("src")).match(/entrance(Exterior|Interior)/)[1];
};

const ROTATION_MS = 3000;

/**
 * Regista na página os timers de rotação pendentes (setTimeout de 3 s do
 * useRotatingImage). A rotação só é agendada depois de o IntersectionObserver
 * da app notificar e de o efeito React correr — assíncrono e, sob carga,
 * posterior ao toBeInViewport() do Playwright; depois de cada troca, o timer
 * seguinte é rearmado num efeito passivo, após o commit que o teste já vê.
 * Avançar o relógio antes disso não roda nada. Instrumentação só do teste:
 * envolve o setTimeout/clearTimeout falsos do page.clock (instalados antes).
 */
async function trackRotationTimers(page) {
  await page.addInitScript((ms) => {
    const pending = new Set();
    const { setTimeout: st, clearTimeout: ct } = window;
    window.__rotationTimers = pending;
    window.setTimeout = function (fn, delay, ...args) {
      if (delay !== ms || typeof fn !== "function") return st.call(this, fn, delay, ...args);
      const id = st.call(this, (...a) => (pending.delete(id), fn(...a)), delay, ...args);
      pending.add(id);
      return id;
    };
    window.clearTimeout = function (id) {
      pending.delete(id);
      return ct.call(this, id);
    };
  }, ROTATION_MS);
}

/** Espera até haver um timer de rotação armado (a rotação está a correr). */
const rotationArmed = (page) =>
  expect.poll(() => page.evaluate(() => window.__rotationTimers.size)).toBeGreaterThan(0);

/** Avança um intervalo completo, depois de confirmar que o timer existe. */
async function nextRotation(page) {
  await rotationArmed(page);
  await page.clock.runFor(ROTATION_MS);
}

async function open(page) {
  await page.clock.install();
  await trackRotationTimers(page);
  await gotoHome(page);
  await pauseClock(page);
  await page.mouse.move(2, 2);
  await scrollToSection(page, "AboutUs");
  await photo(page).scrollIntoViewIfNeeded();
  await expect(photo(page)).toBeInViewport();
}

test("alterna exterior → interior → exterior a cada 3 s", async ({ page }) => {
  await open(page);
  const first = await currentFile(page);
  const second = first === "Exterior" ? "Interior" : "Exterior";
  await nextRotation(page);
  await expect.poll(() => currentFile(page)).toBe(second);
  await nextRotation(page);
  await expect.poll(() => currentFile(page)).toBe(first);
});

test("hover pausa; sair retoma com intervalo completo", async ({ page }) => {
  await open(page);
  const first = await currentFile(page);
  await photo(page).hover();
  await page.clock.runFor(9000);
  expect(await currentFile(page)).toBe(first);
  await page.mouse.move(2, 2);
  await rotationArmed(page); // intervalo completo conta a partir de agora
  await page.clock.runFor(2900);
  expect(await currentFile(page)).toBe(first);
  await page.clock.runFor(200);
  await expect.poll(() => currentFile(page)).not.toBe(first);
});

test("fora do viewport e com a página oculta não roda", async ({ page }) => {
  await open(page);
  const first = await currentFile(page);
  await scrollToSection(page, "Location");
  await expect(photo(page)).not.toBeInViewport();
  await page.clock.runFor(9000);
  expect(await currentFile(page)).toBe(first);

  await photo(page).scrollIntoViewIfNeeded();
  await setPageVisibility(page, "hidden");
  await page.clock.runFor(9000);
  expect(await currentFile(page)).toBe(first);

  await setPageVisibility(page, "visible");
  await nextRotation(page);
  await expect.poll(() => currentFile(page)).not.toBe(first);
});

test("movimento reduzido fixa a primeira imagem", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await open(page);
  expect(await currentFile(page)).toBe("Exterior");
  await page.clock.runFor(9000);
  expect(await currentFile(page)).toBe("Exterior");
});

// Regressão (Fase 6/7): uma imagem que falha não pode parar a rotação.
test("uma imagem que não carrega não interrompe a rotação", async ({ page }) => {
  await page.route(/entranceInterior-[\w-]+\.webp$/, (route) => route.fulfill({ status: 404, body: "" }));
  await open(page);
  expect(await currentFile(page)).toBe("Exterior");

  await nextRotation(page); // interior: falha → <img> retirada
  await expect(photo(page)).toHaveCount(0);
  const frame = page.locator("#AboutUs [class*='imageContainer']");
  await expect(frame).toBeVisible(); // o contentor mantém-se (e continua observado)

  await nextRotation(page); // volta ao exterior
  await expect.poll(() => currentFile(page)).toBe("Exterior");
  await expect(photo(page)).toBeVisible();
});
