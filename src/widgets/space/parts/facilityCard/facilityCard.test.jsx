// Lógica dos controlos multimédia do cartão de vídeo. O jsdom não reproduz
// media: play()/pause() são substituídos por espiões que registam as chamadas
// (o play() do áudio fica pendente, como num MP3 com preload="none" a
// carregar). A reprodução e os downloads reais são verificados em E2E.
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { act, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import FacilityCard from "./facilityCard";
import { installMatchMedia } from "../../../../../tests/setup/browserMocks";

let pendingAudio;
let ontouchstartDescriptor;

beforeEach(() => {
  ontouchstartDescriptor = Object.getOwnPropertyDescriptor(window, "ontouchstart");
  delete window.ontouchstart; // modo desktop (rato)
  installMatchMedia({ "(hover: none)": false, "(max-width: 23.5rem)": false });
  pendingAudio = null;
  vi.spyOn(HTMLMediaElement.prototype, "play").mockImplementation(function () {
    if (this.tagName === "AUDIO") {
      return new Promise((resolve, reject) => {
        pendingAudio = { resolve, reject };
      });
    }
    return Promise.resolve();
  });
  vi.spyOn(HTMLMediaElement.prototype, "pause").mockImplementation(function () {
    if (this.tagName === "AUDIO" && pendingAudio) {
      // como no browser: pause() rejeita um play() pendente
      pendingAudio.reject(new DOMException("interrupted", "AbortError"));
      pendingAudio = null;
    }
  });
});

afterEach(() => {
  if (ontouchstartDescriptor) Object.defineProperty(window, "ontouchstart", ontouchstartDescriptor);
});

const renderVideoCard = () => {
  const utils = render(
    <FacilityCard
      title="O Espaço"
      videoSrc="/video.mp4"
      videoBlurSrc="/video-blur.mp4"
      poster="/poster.webp"
      audioSrc="/audio.mp3"
    />
  );
  const [blur, main] = utils.container.querySelectorAll("video");
  const audio = utils.container.querySelector("audio");
  // o botão de som é filho direto do cartão (que recebe hover/foco)
  const card = screen.getByRole("button", { name: "Som do vídeo" }).parentElement;
  return { ...utils, blur, main, audio, card, sound: () => screen.getByRole("button", { name: "Som do vídeo" }) };
};

const played = (el) => HTMLMediaElement.prototype.play.mock.contexts.filter((c) => c === el).length;

describe("FacilityCard (vídeo) — recursos otimizados", () => {
  test("vídeos e áudio com preload=none, poster e sem autoplay", () => {
    const { blur, main, audio } = renderVideoCard();
    for (const v of [blur, main]) {
      expect(v).toHaveAttribute("preload", "none");
      expect(v).toHaveAttribute("poster", "/poster.webp");
      expect(v).not.toHaveAttribute("autoplay");
      expect(v.muted).toBe(true);
      expect(v).toHaveAttribute("aria-hidden", "true");
    }
    // Fase 10: sem src até à interação (nenhum browser pode descarregar,
    // mesmo os que ignoram preload="none"); o URL fica em data-src
    expect(blur).not.toHaveAttribute("src");
    expect(main).not.toHaveAttribute("src");
    expect(audio).not.toHaveAttribute("src");
    expect(blur).toHaveAttribute("data-src", "/video-blur.mp4");
    expect(main).toHaveAttribute("data-src", "/video.mp4");
    expect(audio).toHaveAttribute("data-src", "/audio.mp3");
    expect(audio).toHaveAttribute("preload", "none");
    expect(HTMLMediaElement.prototype.play).not.toHaveBeenCalled();
  });

  test("o botão de som começa desligado", () => {
    const { sound } = renderVideoCard();
    expect(sound()).toHaveAttribute("aria-pressed", "false");
    expect(sound()).toHaveAttribute("title", "Ativar som");
  });
});

describe("FacilityCard (vídeo) — interação", () => {
  test("hover reproduz o vídeo sem som e não inicia o áudio", async () => {
    const { card, blur, main, audio, sound } = renderVideoCard();
    await act(async () => fireEvent.mouseEnter(card));
    expect(played(blur)).toBe(1);
    expect(played(main)).toBe(1);
    expect(main.muted).toBe(true);
    // o URL dos vídeos só é atribuído aqui; o do áudio continua por atribuir
    expect(blur).toHaveAttribute("src", "/video-blur.mp4");
    expect(main).toHaveAttribute("src", "/video.mp4");
    expect(audio).not.toHaveAttribute("src");
    expect(played(audio)).toBe(0);
    expect(sound()).toHaveAttribute("aria-pressed", "false");
  });

  test("ativar o som inicia o áudio (estado otimista enquanto carrega)", async () => {
    const user = userEvent.setup();
    const { audio, sound } = renderVideoCard();
    await user.click(sound());
    expect(played(audio)).toBe(1);
    expect(audio).toHaveAttribute("src", "/audio.mp3"); // atribuído no clique
    expect(audio.volume).toBeCloseTo(0.22);
    expect(sound()).toHaveAttribute("aria-pressed", "true");
    expect(sound()).toHaveAttribute("title", "Desativar som");

    await act(async () => pendingAudio.resolve());
    expect(sound()).toHaveAttribute("aria-pressed", "true");
  });

  test("é possível desligar o som enquanto o ficheiro ainda carrega", async () => {
    const user = userEvent.setup();
    const { sound } = renderVideoCard();
    await user.click(sound());
    expect(pendingAudio).not.toBeNull();
    await user.click(sound());
    expect(sound()).toHaveAttribute("aria-pressed", "false");
    expect(pendingAudio).toBeNull(); // play pendente interrompido
  });

  test("play() bloqueado pelo browser repõe o estado desligado", async () => {
    const user = userEvent.setup();
    const { sound } = renderVideoCard();
    await user.click(sound());
    await act(async () => pendingAudio.reject(new DOMException("blocked", "NotAllowedError")));
    expect(sound()).toHaveAttribute("aria-pressed", "false");
  });

  test("sair do cartão para vídeo e som e repõe o som desligado", async () => {
    const { card, main, audio, sound } = renderVideoCard();
    await act(async () => fireEvent.mouseEnter(card));
    // fireEvent.click não move o foco: equivale a um clique de rato sem
    // :focus-visible (o jsdom trataria o foco do user.click como visível)
    fireEvent.click(sound());
    await act(async () => pendingAudio.resolve());
    main.currentTime = 3;

    fireEvent.mouseLeave(card);
    expect(HTMLMediaElement.prototype.pause.mock.contexts).toEqual(expect.arrayContaining([main, audio]));
    expect(main.currentTime).toBe(0);
    expect(sound()).toHaveAttribute("aria-pressed", "false");

    // um novo hover volta a reproduzir o vídeo, mas nunca o áudio
    const audioPlays = played(audio);
    await act(async () => fireEvent.mouseEnter(card));
    expect(played(audio)).toBe(audioPlays);
  });

  test("o fim do áudio repõe o botão", async () => {
    const user = userEvent.setup();
    const { audio, sound } = renderVideoCard();
    await user.click(sound());
    await act(async () => pendingAudio.resolve());
    fireEvent.ended(audio);
    expect(sound()).toHaveAttribute("aria-pressed", "false");
  });
});
