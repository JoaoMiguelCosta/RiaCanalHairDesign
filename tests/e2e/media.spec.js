// Vídeo e áudio da secção "O Espaço" num browser real: downloads
// condicionados à interação, estados do botão de som e paragem ao sair.
import { test, expect, expectPage, gotoHome, scrollToSection, VIEWPORTS } from "./fixtures.js";

test.use({ viewport: VIEWPORTS.desktop });

const isVideo = (u) => /\.mp4($|\?)/.test(u);
const isAudio = (u) => /\.mp3($|\?)/.test(u);
const soundBtn = (page) => page.getByRole("button", { name: "Som do vídeo" });
const videoCard = (page) => soundBtn(page).locator("..");
const media = (page) =>
  videoCard(page).evaluate((card) => {
    const [blur, main] = card.querySelectorAll("video");
    const audio = card.querySelector("audio");
    return {
      mainPaused: main.paused,
      blurPaused: blur.paused,
      mainTime: main.currentTime,
      muted: main.muted && blur.muted,
      audioPaused: audio.paused,
      poster: main.getAttribute("poster"),
      // URL atribuído (o componente só o faz na interação; até lá: data-src)
      srcs: [blur, main, audio].map((m) => m.getAttribute("src")),
      // HTMLMediaElement: readyState 0 = HAVE_NOTHING;
      // networkState 0 = NETWORK_EMPTY, 2 = NETWORK_LOADING
      readyStates: [blur.readyState, main.readyState, audio.readyState],
      networkStates: [blur.networkState, main.networkState, audio.networkState],
      loading: [blur, main, audio].some((m) => m.networkState === 2),
    };
  });

/**
 * Arranque real de um vídeo: o primeiro play() só resolve quando há dados
 * suficientes do MP4, e o componente arranca as camadas em sequência
 * (await blur.play(), depois main.play()). O tempo depende do download e da
 * descodificação servidos pelo único `vite preview` local, partilhado por
 * todos os workers: com a suite em paralelo chegou a passar dos 5 s do
 * expect.poll por defeito (Fase 10). Limite próprio, abaixo dos 30 s do teste.
 */
const MEDIA_START_TIMEOUT = 20_000;

/**
 * WebKit do Playwright (port Windows): o backend de media faz os pedidos de
 * MP4/MP3 fora da camada de rede que o Playwright instrumenta (page.on
 * "request" e page.route não os veem). Antes da Fase 10 também os iniciava
 * logo no carregamento, ignorando preload="none" (pedidos confirmados no
 * servidor); por isso o componente só atribui o src na interação, e a
 * ausência de src/estado NETWORK_EMPTY é verificável nos três motores. As
 * asserções sobre pedidos de rede ficam para Chromium e Firefox; o Safari
 * real continua a verificar no Preview Deploy (docs/RELEASE.md).
 */
const mediaRequestsVisible = (browserName) => browserName !== "webkit";
const MEDIA_REQUESTS_REASON = "WebKit (Playwright, Windows): pedidos de media fora da instrumentação de rede";

/** Percorre a página inteira (dispara lazy loading e observers). */
async function scrollWholePage(page) {
  await page.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += 500) {
      window.scrollTo(0, y);
      document.body.scrollTo?.(0, y);
      await new Promise((r) => requestAnimationFrame(() => r()));
    }
  });
}

// Sem networkidle: a rede da página inteira não precisa de ficar parada (já
// provocou timeouts de 30 s). Observa-se o que importa: os três elementos de
// media não têm URL (src) — nenhum browser pode descarregar, mesmo os que
// ignoram preload="none" —, estão em NETWORK_EMPTY/HAVE_NOTHING, e (onde o
// Playwright os vê) não houve pedidos de MP4/MP3.
test("sem downloads de vídeo nem de MP3 antes da interação", async ({ page, sameOriginRequests, browserName }) => {
  await gotoHome(page);
  await scrollWholePage(page);
  await scrollToSection(page, "Space");
  await videoCard(page).scrollIntoViewIfNeeded();

  const state = await media(page);
  expect(state.poster).toMatch(/\/assets\/ria-canal-video-poster-[\w-]+\.webp$/);
  await expect.poll(() => sameOriginRequests.some((u) => u.endsWith(state.poster))).toBe(true);

  const after = await media(page);
  expect(after.srcs).toEqual([null, null, null]);
  expect(after.networkStates).toEqual([0, 0, 0]); // NETWORK_EMPTY: sem recurso
  expect(after.readyStates).toEqual([0, 0, 0]); // HAVE_NOTHING: nenhum dado de media
  expect(after.loading).toBe(false);
  if (mediaRequestsVisible(browserName)) {
    expect(sameOriginRequests.filter(isVideo)).toEqual([]);
    expect(sameOriginRequests.filter(isAudio)).toEqual([]);
  }
  expect(after.mainPaused && after.blurPaused && after.audioPaused).toBe(true);

  const posterRes = await page.request.get(state.poster);
  expect(posterRes.status()).toBe(200);
});

test("hover reproduz o vídeo sem som; o áudio não começa nem descarrega", async ({
  page,
  sameOriginRequests,
  browserName,
}) => {
  await gotoHome(page);
  await scrollToSection(page, "Space");
  await videoCard(page).scrollIntoViewIfNeeded();
  await videoCard(page).hover();

  // as duas camadas arrancam em sequência: o play() do blur é imediato
  // (paused=false); o da principal só depois de o blur ter dados
  await expect.poll(async () => (await media(page)).blurPaused).toBe(false);
  await expect
    .poll(async () => (await media(page)).mainPaused, { timeout: MEDIA_START_TIMEOUT })
    .toBe(false);
  const state = await media(page);
  expect(state.muted).toBe(true);
  expect(state.audioPaused).toBe(true);
  expect(state.srcs[0]).toMatch(/ria-canal-video-blur-/);
  expect(state.srcs[1]).toMatch(/ria-canal-video-web-/);
  expect(state.srcs[2]).toBeNull(); // o MP3 só com o botão de som
  await expect(soundBtn(page)).toHaveAttribute("aria-pressed", "false");

  if (mediaRequestsVisible(browserName)) {
    const videos = sameOriginRequests.filter(isVideo);
    const firstBlur = videos.findIndex((u) => /ria-canal-video-blur-/.test(u));
    const firstMain = videos.findIndex((u) => /ria-canal-video-web-/.test(u));
    expect(firstBlur).toBe(0);
    expect(firstMain).toBeGreaterThan(firstBlur);
    expect(sameOriginRequests.filter(isAudio)).toEqual([]);
  }
});

test("sair do cartão para o vídeo e repõe o início", async ({ page }) => {
  await gotoHome(page);
  await videoCard(page).scrollIntoViewIfNeeded();
  await videoCard(page).hover();
  await expect
    .poll(async () => (await media(page)).mainTime, { timeout: MEDIA_START_TIMEOUT })
    .toBeGreaterThan(0.2);
  await page.mouse.move(2, 2);
  await expect.poll(async () => (await media(page)).mainPaused).toBe(true);
  // currentTime = 0 pedido pelo componente; o WebKit reporta o instante do
  // frame mais próximo (ex.: 0,002 s). Qualquer valor < 1 frame é o início.
  expect((await media(page)).mainTime).toBeLessThan(0.04);
});

test("ativar o som descarrega e toca o MP3; desligar pára", async ({ page, sameOriginRequests, browserName }) => {
  await gotoHome(page);
  await videoCard(page).scrollIntoViewIfNeeded();
  await soundBtn(page).click();
  await expect(soundBtn(page)).toHaveAttribute("aria-pressed", "true");
  await expect(soundBtn(page)).toHaveAttribute("title", "Desativar som");
  expect((await media(page)).srcs[2]).toMatch(/.mp3$/); // atribuído no clique
  if (mediaRequestsVisible(browserName)) {
    await expect.poll(() => sameOriginRequests.filter(isAudio).length).toBe(1);
  }
  await expect.poll(async () => (await media(page)).audioPaused).toBe(false);

  await soundBtn(page).click();
  await expect(soundBtn(page)).toHaveAttribute("aria-pressed", "false");
  await expect.poll(async () => (await media(page)).audioPaused).toBe(true);
});

test("é possível desligar o som enquanto o MP3 ainda carrega", async ({ page, browserName }) => {
  // page.route não interceta o MP3 no WebKit: não há como manter o play() pendente
  test.skip(!mediaRequestsVisible(browserName), MEDIA_REQUESTS_REASON);
  // atrasa a resposta do MP3 para manter o play() pendente
  let release;
  const gate = new Promise((r) => (release = r));
  await page.route(/\.mp3$/, async (route) => {
    await gate;
    await route.continue().catch(() => {});
  });
  await gotoHome(page);
  await videoCard(page).scrollIntoViewIfNeeded();

  await soundBtn(page).click();
  await expect(soundBtn(page)).toHaveAttribute("aria-pressed", "true"); // estado otimista
  await soundBtn(page).click();
  await expect(soundBtn(page)).toHaveAttribute("aria-pressed", "false");
  // deixa o pedido terminar (concluído ou cancelado): o áudio não pode arrancar
  const settled = Promise.race([
    page.waitForEvent("requestfinished", (r) => isAudio(r.url())),
    page.waitForEvent("requestfailed", (r) => isAudio(r.url())),
  ]);
  release();
  await settled;
  await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => r())));
  expect((await media(page)).audioPaused).toBe(true);
  await expect(soundBtn(page)).toHaveAttribute("aria-pressed", "false");
});

test("sair do cartão com o som ligado pára o áudio e repõe o botão", async ({ page }) => {
  await gotoHome(page);
  await videoCard(page).scrollIntoViewIfNeeded();
  await soundBtn(page).click();
  await expect.poll(async () => (await media(page)).audioPaused).toBe(false);
  await page.mouse.move(2, 2);
  await expect.poll(async () => (await media(page)).audioPaused).toBe(true);
  await expect(soundBtn(page)).toHaveAttribute("aria-pressed", "false");

  // novo hover: vídeo sim, áudio não
  await videoCard(page).hover();
  await expect
    .poll(async () => (await media(page)).mainPaused, { timeout: MEDIA_START_TIMEOUT })
    .toBe(false);
  expect((await media(page)).audioPaused).toBe(true);
});

test("depois de mudar de rota e voltar, a Home continua sem descarregar media", async ({ page, sameOriginRequests, browserName }) => {
  await page.goto("/termos");
  await expectPage(page.getByRole("heading", { level: 1 })).toHaveText("Termos & Condições");
  await page.getByRole("link", { name: "Voltar à página inicial" }).click();
  await expectPage(page.getByRole("heading", { level: 1 })).toHaveText(/Ria Canal/);
  await videoCard(page).scrollIntoViewIfNeeded();
  await page.mouse.move(2, 2);
  expect((await media(page)).srcs).toEqual([null, null, null]);
  if (mediaRequestsVisible(browserName)) {
    expect(sameOriginRequests.filter((u) => isVideo(u) || isAudio(u))).toEqual([]);
  }
});
