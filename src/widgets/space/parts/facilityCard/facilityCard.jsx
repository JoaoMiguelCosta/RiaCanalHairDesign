import { useEffect, useMemo, useRef, useState } from "react";
import styles from "./facilityCard.module.css";
import TitleCaption from "@shared/ui/titleCaption/titleCaption.jsx";
import VideoBG from "@widgets/space/parts/videoBG/videoBG.jsx";

const AUDIO_SRC = "/audio/IlyaSound_-_Inspiring_Background_Music.mp3";

const FacilityCard = ({
  variant = "variant1",
  title,
  subtitle,
  description,
  subtitle1,
  description1,
  imageSrc,
  videoSrc,
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

  // Ambiente touch?
  const isTouch = useMemo(() => {
    if (typeof window === "undefined") return false;
    const mm = window.matchMedia?.("(hover: none)");
    return (
      "ontouchstart" in window ||
      navigator.maxTouchPoints > 0 ||
      (mm && mm.matches)
    );
  }, []);

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
  const cardRef = useRef(null);

  // vídeo (2 camadas) + áudio
  const blurRef = useRef(null);
  const mainRef = useRef(null);
  const audioRef = useRef(null);

  const playMedia = async () => {
    const vids = [blurRef.current, mainRef.current].filter(Boolean);

    // vídeo sempre mudo (evita bloqueios)
    for (const v of vids) {
      try {
        v.muted = true;
        await v.play?.();
      } catch {
        // ignore
      }
    }

    // áudio por cima (precisa de interação do user)
    if (audioRef.current) {
      try {
        audioRef.current.volume = audioVolume;
        await audioRef.current.play?.();
      } catch {
        // ignore (bloqueado pelo browser)
      }
    }
  };

  const stopMedia = () => {
    const vids = [blurRef.current, mainRef.current].filter(Boolean);
    for (const v of vids) {
      try {
        v.pause?.();
        v.currentTime = 0;
      } catch {
        // ignore
      }
    }

    if (audioRef.current) {
      try {
        audioRef.current.pause?.();
        audioRef.current.currentTime = 0;
      } catch {
        // ignore
      }
    }
  };

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

  // Em tapMode, open => play, close => stop
  useEffect(() => {
    if (!tapMode) return;
    if (open) playMedia();
    else stopMedia();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, tapMode]);

  // Desktop: hover/focus controla
  const handlersDesktop = {
    onMouseEnter: () => {
      if (tapMode) return;
      playMedia();
    },
    onMouseLeave: () => {
      if (tapMode) return;
      stopMedia();
    },
    onFocus: () => {
      if (tapMode) return;
      playMedia();
    },
    onBlur: () => {
      if (tapMode) return;
      stopMedia();
    },
  };

  const resolvedAlt = imageAlt || title || subtitle || "Área do salão";

  return (
    <div className={styles.Block}>
      <div
        ref={cardRef}
        className={`${styles.card} ${containerClass} ${open ? styles.open : ""}`}
        tabIndex={0}
        {...handlersDesktop}
        onClick={(e) => {
          if (!tapMode) return;
          e.stopPropagation();
          setOpen((v) => !v);
        }}
        onKeyDown={(e) => {
          if (!tapMode) return;
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setOpen((v) => !v);
          }
        }}
      >
        {/* Indicador subtil (opção 2) */}
        <span className={styles.hoverIcon} aria-hidden="true">
          ↗
        </span>

        {/* Mídia */}
        {videoSrc ? (
          <div className={styles.media}>
            {/* fundo preenchido */}
            <VideoBG
              ref={blurRef}
              src={videoSrc}
              poster={poster}
              className={styles.bgVideoBlur}
              preload="metadata"
              autoPlay={false}
              muted
              loop
              playsInline
            />

            {/* vídeo principal sem distorcer */}
            <VideoBG
              ref={mainRef}
              src={videoSrc}
              poster={poster}
              className={styles.bgVideoMain}
              preload="metadata"
              autoPlay={false}
              muted
              loop
              playsInline
            />

            {/* áudio por cima */}
            <audio ref={audioRef} src={audioSrc} preload="auto" />
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
