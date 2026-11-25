// Carrossel de Testemunhos num browser real. O tempo é medido pela animação
// CSS da barra de progresso (não por timers JS), por isso aqui verifica-se o
// estado efetivo da animação através da Web Animations API
// (document.getAnimations): playState e currentTime.
import { test, expect, expectPage, gotoHome, scrollToSection, setPageVisibility, VIEWPORTS } from "./fixtures.js";
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

/**
 * Tempo congelado da animação pausada, lido só depois de a pausa estar
 * efetivamente aplicada (`animation.ready`). Enquanto a pausa está pendente,
 * o playState já é "paused" mas o currentTime ainda é provisório: no WebKit
 * chega a ser superior ao valor com que a animação fica congelada (ex.:
 * 1943 → 1819), o que fazia a retoma parecer um recuo.
 */
const frozenTime = (page) =>
  page.evaluate(async () => {
    const anim = document.getAnimations().find((a) => /progressFill/.test(a.animationName));
    await anim.ready;
    return Number(anim.currentTime);
  });

/**
 * Começa a observar, frame a frame e dentro da página, o 1.º estado depois de
 * uma retoma (clique, scroll, …): devolve uma função que espera por ele.
 * Ler o estado e o tempo em chamadas separadas do teste não chega: sob carga,
 * o tempo restante pode esgotar-se entre as duas leituras e o cartão avança.
 * Cada amostra (autor + estado + tempo + mesma instância) é atómica, num
 * único frame. Se a retoma não acontecer em 5 s, devolve o estado dos
 * motivos de pausa (para a falha dizer porquê, em vez de esgotar o tempo do
 * teste sem informação).
 */
async function watchResume(page) {
  await page.evaluate(() => {
    const find = () => document.getAnimations().find((a) => /progressFill/.test(a.animationName));
    const initial = find();
    const read = () => {
      const anim = find();
      return {
        author: document.querySelector('#Testimonials [data-active="true"] span')?.textContent,
        state: anim?.playState,
        time: Number(anim?.currentTime),
        sameAnimation: anim === initial,
      };
    };
    const diagnose = () => {
      const root = document.getElementById("Testimonials");
      const rect = root.getBoundingClientRect();
      const focused = document.activeElement;
      return {
        dataRunning: root.querySelector('[data-active="true"]')?.dataset.running,
        hover: root.matches(":hover"),
        focusInside: root.contains(focused),
        focusVisible: Boolean(focused?.matches?.(":focus-visible")),
        inViewport: rect.bottom > 0 && rect.top < window.innerHeight,
        visibilityState: document.visibilityState,
        button: root.querySelector("button")?.getAttribute("aria-label"),
      };
    };
    const start = read();
    window.__resumeDiagnose = () => ({ start, timedOut: { last: read(), ...diagnose() } });
    window.__resumeStopped = false;
    window.__resume = new Promise((resolve) => {
      const tick = () => {
        if (window.__resumeStopped) return; // prazo esgotado: termina o ciclo
        const s = read();
        if (s.author !== start.author || s.state === "running") resolve({ start, first: s });
        else requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });
  });
  // O prazo só começa quando o teste espera (depois do clique/scroll de
  // retoma, que sob carga pode demorar segundos a ser entregue).
  return async () => {
    const result = await page.evaluate(
      () =>
        new Promise((resolve) => {
          const timer = setTimeout(() => {
            window.__resumeStopped = true;
            resolve(window.__resumeDiagnose());
          }, 5_000);
          window.__resume.then((value) => {
            clearTimeout(timer);
            resolve(value);
          });
        })
    );
    expect(result.timedOut, `a retoma não aconteceu: ${JSON.stringify(result.timedOut)}`).toBeUndefined();
    return result;
  };
}

/**
 * Retomar continua do ponto congelado: no 1.º frame em que volta a correr, a
 * mesma animação do mesmo cartão tem tempo ≥ congelado; ou o tempo restante
 * esgotou-se dentro desse frame e o cartão já é o seguinte. Um recomeço
 * apareceria como outra instância da animação ou tempo < congelado.
 */
function expectContinued({ start, first }, frozen) {
  if (first.author === start.author) {
    expect(first.state).toBe("running");
    expect(first.sameAnimation).toBe(true);
    expect(first.time).toBeGreaterThanOrEqual(frozen);
  } else {
    const i = data.findIndex((t) => t.author === start.author);
    expect(first.author).toBe(data[(i + 1) % data.length].author);
  }
}

async function open(page) {
  await gotoHome(page);
  await scrollToSection(page, "Testimonials");
  await page.mouse.move(2, 2); // sem hover sobre a secção
  await expect(section(page)).toBeInViewport();
}

test("roda automaticamente pela ordem dos dados, uma animação de cada vez", async ({ page }) => {
  await gotoHome(page);
  // Fora do viewport o carrossel está parado: o registo das trocas começa
  // antes de a rotação poder arrancar, por mais lenta que seja a máquina.
  expect(await activeAuthor(page)).toBe(data[0].author);
  await page.evaluate(() => {
    window.__changes = [];
    const root = document.getElementById("Testimonials");
    new MutationObserver((records) => {
      for (const r of records) {
        if (r.target.getAttribute("data-active") === "true") {
          window.__changes.push({ at: performance.now(), author: r.target.querySelector("span")?.textContent });
        }
      }
    }).observe(root, { attributes: true, attributeFilter: ["data-active"], subtree: true });
  });
  await scrollToSection(page, "Testimonials");
  await page.mouse.move(2, 2); // sem hover sobre a secção
  await expect(section(page)).toBeInViewport();
  await expect.poll(() => progress(page)).toEqual([expect.objectContaining({ state: "running" })]);

  await expect.poll(() => activeAuthor(page), { timeout: 5000 }).toBe(data[1].author);
  await expect.poll(() => activeAuthor(page), { timeout: 5000 }).toBe(data[2].author);
  // as duas primeiras trocas: pela ordem dos dados, sem avanços duplicados
  const changes = await page.evaluate(() => window.__changes);
  expect(changes.slice(0, 2).map((c) => c.author)).toEqual([data[1].author, data[2].author]);
  expect(changes[1].at - changes[0].at).toBeGreaterThan(2500); // ~3 s por cartão
  expect(await progress(page)).toHaveLength(1);
});

test("Pausar congela o progresso; Retomar continua do mesmo ponto", async ({ page }) => {
  await open(page);
  // Pausar a meio de um cartão: a verificação do tempo e o clique no botão
  // acontecem no mesmo frame, dentro da página. Com locator.click() havia um
  // intervalo sem limite entre os dois (sob carga, a espera de estabilidade
  // do Playwright chegou a 4–9 s no WebKit) e a pausa caía no fim do cartão
  // ou no início do seguinte (tempo 0). A retoma, abaixo, usa o clique real.
  await page.evaluate(
    () =>
      new Promise((resolve) => {
        const tick = () => {
          const anim = document.getAnimations().find((a) => /progressFill/.test(a.animationName));
          if (anim?.playState === "running" && anim.currentTime > 300 && anim.currentTime < 1500) {
            document.querySelector("#Testimonials button").click();
            resolve();
          } else requestAnimationFrame(tick);
        };
        tick();
      })
  );
  await expect(pauseBtn(page)).toHaveAccessibleName("Retomar rotação dos testemunhos");
  await page.mouse.move(2, 2);
  await expect.poll(async () => (await progress(page))[0].state).toBe("paused");
  const frozen = await frozenTime(page);
  expect(frozen).toBeGreaterThan(0);
  expect(frozen).toBeLessThan(3000);
  const author = await activeAuthor(page);

  await page.waitForTimeout(800); // tempo real: a animação CSS não usa o relógio JS
  expect((await progress(page))[0].time).toBe(frozen);
  expect(await activeAuthor(page)).toBe(author);

  // o clique de rato foca o botão, mas sem :focus-visible não deve pausar
  const resumed = await watchResume(page);
  await pauseBtn(page).click();
  await page.mouse.move(2, 2);
  expectContinued(await resumed(), frozen);
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
  const frozen = await frozenTime(page);
  const resumed = await watchResume(page);
  await scrollToSection(page, "Testimonials");
  expectContinued(await resumed(), frozen);
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

  const resumed = await watchResume(page);
  await pauseBtn(page).click();
  await page.mouse.move(2, 2);
  // 1.º frame a correr: o mesmo cartão (o 1.º), sem saltar nenhum
  const { first } = await resumed();
  expect(first).toEqual(expect.objectContaining({ author: data[0].author, state: "running" }));
  // a regra global de movimento reduzido não pode encurtar a barra
  const duration = await page.evaluate(
    () => document.getAnimations().find((a) => /progressFill/.test(a.animationName)).effect.getTiming().duration
  );
  expect(duration).toBe(3000);
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
  await expectPage(page.getByRole("heading", { level: 1 })).toHaveText("Termos & Condições");
  await page.goBack();
  await expectPage(page.getByRole("heading", { level: 1 })).toBeVisible();
  await scrollToSection(page, "Testimonials");
  await page.mouse.move(2, 2);
  await expect.poll(() => progress(page)).toEqual([expect.objectContaining({ state: "running" })]);
  const first = await activeAuthor(page);
  await expect.poll(() => activeAuthor(page), { timeout: 5000 }).not.toBe(first);
});
