// Vídeo e áudio da secção "O Espaço" num browser real: downloads
// condicionados à interação, estados do botão de som e paragem ao sair.
import { test, expect, gotoHome, scrollToSection, VIEWPORTS } from "./fixtures.js";

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
    };
  });

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

test("sem downloads de vídeo nem de MP3 antes da interação", async ({ page, sameOriginRequests }) => {
  await gotoHome(page);
  await scrollWholePage(page);
  await scrollToSection(page, "Space");
  await page.waitForLoadState("networkidle");
  expect(sameOriginRequests.filter(isVideo)).toEqual([]);
  expect(sameOriginRequests.filter(isAudio)).toEqual([]);

  const state = await media(page);
  expect(state.poster).toMatch(/\/assets\/ria-canal-video-poster-[\w-]+\.webp$/);
  const posterRes = await page.request.get(state.poster);
  expect(posterRes.status()).toBe(200);
});

test("hover reproduz o vídeo sem som; o áudio não começa nem descarrega", async ({ page, sameOriginRequests }) => {
  await gotoHome(page);
  await scrollToSection(page, "Space");
  await videoCard(page).scrollIntoViewIfNeeded();
  await videoCard(page).hover();

  // as duas camadas arrancam em sequência (blur primeiro, depois a principal)
  const videoUrls = () => sameOriginRequests.filter(isVideo).join(" ");
  await expect.poll(videoUrls).toMatch(/ria-canal-video-blur-/);
  await expect.poll(videoUrls).toMatch(/ria-canal-video-web-/);
  await expect.poll(async () => (await media(page)).mainPaused).toBe(false);
  const state = await media(page);
  expect(state.muted).toBe(true);
  expect(state.audioPaused).toBe(true);
  await expect(soundBtn(page)).toHaveAttribute("aria-pressed", "false");
  expect(sameOriginRequests.filter(isAudio)).toEqual([]);
});

test("sair do cartão para o vídeo e repõe o início", async ({ page }) => {
  await gotoHome(page);
  await videoCard(page).scrollIntoViewIfNeeded();
  await videoCard(page).hover();
  await expect.poll(async () => (await media(page)).mainTime).toBeGreaterThan(0.2);
  await page.mouse.move(2, 2);
  await expect.poll(async () => (await media(page)).mainPaused).toBe(true);
  expect((await media(page)).mainTime).toBe(0);
});

test("ativar o som descarrega e toca o MP3; desligar pára", async ({ page, sameOriginRequests }) => {
  await gotoHome(page);
  await videoCard(page).scrollIntoViewIfNeeded();
  await soundBtn(page).click();
  await expect(soundBtn(page)).toHaveAttribute("aria-pressed", "true");
  await expect(soundBtn(page)).toHaveAttribute("title", "Desativar som");
  await expect.poll(() => sameOriginRequests.filter(isAudio).length).toBe(1);
  await expect.poll(async () => (await media(page)).audioPaused).toBe(false);

  await soundBtn(page).click();
  await expect(soundBtn(page)).toHaveAttribute("aria-pressed", "false");
  await expect.poll(async () => (await media(page)).audioPaused).toBe(true);
});

test("é possível desligar o som enquanto o MP3 ainda carrega", async ({ page }) => {
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
  await expect.poll(async () => (await media(page)).mainPaused).toBe(false);
  expect((await media(page)).audioPaused).toBe(true);
});
