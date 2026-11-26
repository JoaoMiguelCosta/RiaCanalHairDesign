import { useCallback, useEffect, useRef, useState } from "react";
import styles from "./facilityCard.module.css";
import TitleCaption from "@shared/ui/titleCaption/titleCaption.jsx";
import VideoBG from "@widgets/space/parts/videoBG/videoBG.jsx";
import Icon from "@shared/ui/icons/icons.jsx";
import { isTouchDevice } from "@shared/lib/isTouchDevice";

const AUDIO_SRC = "/audio/IlyaSound_-_Inspiring_Background_Music.mp3";

/**
 * Os URLs dos vídeos e do áudio só passam a src na interação (estão em
 * data-src até lá). preload="none" é apenas uma sugestão: o WebKit (port
 * Windows do Playwright) descarregava o MP4 de 9 MB e o MP3 logo ao carregar
 * a página (pedidos confirmados no servidor, Fase 10). Sem src nenhum browser
 * pode descarregar. Chamado no mesmo gesto, imediatamente antes de play().
 */
function attachMediaSrc(el) {
  if (!el || el.getAttribute("src")) return;
  const src = el.dataset.src;
  if (src) el.src = src;
}

/**
 * Cartão da secção Espaço (imagem ou vídeo revelados por hover/foco/toque).
 *
 * Áudio (WCAG 1.4.2): o vídeo reproduz sempre sem som ao hover/foco/toque;
 * a música só começa com uma ação explícita no botão "Som do vídeo"
 * (aria-pressed), que também a desliga. Sair do cartão para tudo e repõe o
 * som desligado, para que um hover seguinte nunca inicie áudio.
 */
const FacilityCard = ({
  variant = "variant1",
  title,
  subtitle,
  description,
  subtitle1,
  description1,
  imageSrc,
  videoSrc,
  videoBlurSrc, // versão de baixa resolução para a camada desfocada (opcional)
  imageAlt,
  imgLoading = "lazy",
  imgDecoding = "async",
  showHint = true,
  poster,
  audioSrc = AUDIO_SRC,
  audioVolume = 0.22,
}) => {
  const containerClass = styles[variant] || "";
  const captionClass = styles[`${variant}Caption`] || "";
  const hasVideo = Boolean(videoSrc);

  // Ambiente touch? (lido uma vez, na montagem)
  const [isTouch] = useState(isTouchDevice);

  // Força modo "tap" em ecrãs <= 375px
  const [isSmallMobile, setIsSmallMobile] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mq = window.matchMedia("(max-width: 23.5rem)"); // <= 376px
    const update = () => setIsSmallMobile(mq.matches);
    update();
    mq.addEventListener?.("change", update);
    return () => mq.removeEventListener?.("change", update);
  }, []);

  const tapMode = isTouch || isSmallMobile;

  const [open, setOpen] = useState(false);
  const [soundOn, setSoundOn] = useState(false);
  const cardRef = useRef(null);

  // vídeo (2 camadas) + áudio
  const blurRef = useRef(null);
  const mainRef = useRef(null);
  const audioRef = useRef(null);

  // playVideo / stopSound / stopMedia só usam refs e o setter de estado
  // (estáveis): identidade estável, sem dependências escondidas no efeito
  // de tapMode abaixo.

  // Vídeo sempre mudo (decorativo; evita bloqueios de autoplay)
  const playVideo = useCallback(async () => {
    const vids = [blurRef.current, mainRef.current].filter(Boolean);
    for (const v of vids) {
      try {
        v.muted = true;
        attachMediaSrc(v);
        await v.play?.();
      } catch {
        // ignore
      }
    }
  }, []);

  const stopSound = useCallback(() => {
    setSoundOn(false);
    if (!audioRef.current) return;
    try {
      audioRef.current.pause?.();
    } catch {
      // ignore
    }
  }, []);

  // Chamado diretamente no clique (gesto do utilizador exigido pelo browser).
  // Estado otimista: com preload="none" o play() só resolve depois de o MP3
  // carregar; marcar logo como ligado mantém aria-pressed coerente e permite
  // desligar durante o carregamento (pause() rejeita o play pendente → catch).
  const startSound = async () => {
    if (!audioRef.current) return;
    setSoundOn(true);
    try {
      audioRef.current.volume = audioVolume;
      attachMediaSrc(audioRef.current);
      await audioRef.current.play?.();
    } catch {
      setSoundOn(false); // bloqueado pelo browser ou interrompido
    }
  };

  const stopMedia = useCallback(() => {
    const vids = [blurRef.current, mainRef.current].filter(Boolean);
    for (const v of vids) {
      try {
        v.pause?.();
        v.currentTime = 0;
      } catch {
        // ignore
      }
    }

    stopSound();
    if (audioRef.current) {
      try {
        audioRef.current.currentTime = 0;
      } catch {
        // ignore
      }
    }
  }, [stopSound]);

  // Fechar ao tocar fora (tapMode)
  useEffect(() => {
    if (!tapMode) return;
    const onDocClick = (e) => {
      if (!cardRef.current) return;
      if (!cardRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, [tapMode]);

  // Em tapMode, open => vídeo (mudo), close => stop
  useEffect(() => {
    if (!tapMode) return;
    if (open) playVideo();
    else stopMedia();
  }, [open, tapMode, playVideo, stopMedia]);

  // Desktop: hover/focus controla o vídeo (sem som)
  const handlersDesktop = {
    onMouseEnter: () => {
      if (tapMode) return;
      playVideo();
    },
    onMouseLeave: () => {
      if (tapMode) return;
      // mantém a reprodução se o foco de TECLADO continuar dentro do cartão
      // (um clique de rato no botão também o foca, mas sem :focus-visible)
      if (cardRef.current?.querySelector(":focus-visible")) return;
      stopMedia();
    },
    onFocus: () => {
      if (tapMode) return;
      playVideo();
    },
    onBlur: (e) => {
      if (tapMode) return;
      // foco a mover-se dentro do cartão (ex.: para o botão de som)
      if (cardRef.current?.contains(e.relatedTarget)) return;
      stopMedia();
    },
  };

  const toggleSound = (e) => {
    e.stopPropagation(); // não alterna o cartão em tapMode
    if (soundOn) {
      stopSound();
      return;
    }
    if (tapMode) setOpen(true);
    else playVideo();
    startSound();
  };

  const resolvedAlt = imageAlt || title || subtitle || "Área do salão";

  // Cartões de imagem: em desktop são focáveis para revelar a imagem por
  // teclado (como o hover); em tapMode o controlo é um <button> nativo de
  // alternância que cobre o cartão (o cartão em si não é role="button", que
  // juntaria imagem e textos num nome acessível longo). O cartão de vídeo
  // não é focável: o controlo de teclado é o botão de som interior (evita
  // controlos interativos aninhados).
  const imageCardA11y = hasVideo || tapMode ? {} : { tabIndex: 0 };
  const showToggle = tapMode && !hasVideo;

  return (
    <div className={styles.Block}>
      <div
        ref={cardRef}
        className={`${styles.card} ${containerClass} ${open ? styles.open : ""}`}
        {...imageCardA11y}
        {...handlersDesktop}
        // em tapMode também recebe o clique (borbulhado) do botão de
        // alternância, incluindo o gerado por Enter/Espaço
        onClick={(e) => {
          if (!tapMode) return;
          e.stopPropagation();
          setOpen((v) => !v);
        }}
      >
        {/* Indicador subtil (opção 2) */}
        <span className={styles.hoverIcon} aria-hidden="true">
          ↗
        </span>

        {/* Mídia */}
        {hasVideo ? (
          <div className={styles.media}>
            {/* fundo preenchido (desfocado: basta uma versão de baixa resolução) */}
            <VideoBG
              ref={blurRef}
              src={videoBlurSrc || videoSrc}
              poster={poster}
              className={styles.bgVideoBlur}
              preload="none"
              deferSrc
              autoPlay={false}
              muted
              loop
              playsInline
            />

            {/* vídeo principal sem distorcer; só descarrega ao reproduzir */}
            <VideoBG
              ref={mainRef}
              src={videoSrc}
              poster={poster}
              className={styles.bgVideoMain}
              preload="none"
              deferSrc
              autoPlay={false}
              muted
              loop
              playsInline
            />

            {/* áudio: só toca após ação explícita no botão de som */}
            <audio
              ref={audioRef}
              data-src={audioSrc}
              preload="none"
              onEnded={() => setSoundOn(false)}
            />
          </div>
        ) : (
          imageSrc && (
            <img
              src={imageSrc}
              alt={resolvedAlt}
              className={styles.bg}
              loading={imgLoading}
              decoding={imgDecoding}
            />
          )
        )}

        {hasVideo && audioSrc && (
          <button
            type="button"
            className={styles.soundButton}
            onClick={toggleSound}
            aria-pressed={soundOn}
            aria-label="Som do vídeo"
            title={soundOn ? "Desativar som" : "Ativar som"}
          >
            <Icon
              name={soundOn ? "volumeOn" : "volumeOff"}
              aria-hidden="true"
              focusable="false"
            />
          </button>
        )}

        {/* Conteúdo */}
        <div className={styles.first}>
          <div className={styles.firstin}>
            {title && <span className={styles.firstinspan}>{title}</span>}
          </div>
        </div>

        {subtitle && <div className={styles.second}>{subtitle}</div>}
        {description && <div className={styles.third}>{description}</div>}

        {showHint && tapMode && !open && (
          <div className={styles.tapHint}>toque para ver</div>
        )}

        {showToggle && (
          <button
            type="button"
            className={styles.cardToggle}
            aria-pressed={open}
            aria-label={resolvedAlt}
          />
        )}
      </div>

      {(subtitle1 || description1) && (
        <TitleCaption
          title={subtitle1}
          caption={description1}
          className={captionClass}
        />
      )}
    </div>
  );
};

export default FacilityCard;
