import { useEffect, useMemo, useRef, useState } from "react";
import styles from "./facilityCard.module.css";
import TitleCaption from "@shared/ui/titleCaption/titleCaption.jsx";
import VideoBG from "@widgets/space/parts/videoBG/videoBG.jsx";
import { useHoverVideo } from "@widgets/space/hook/useHoverVideo";

/**
 * FacilityCard
 * - Desktop: mídia aparece no :hover / :focus-visible
 * - Touch/SmallMobile: 1º toque abre (classe .open), 2º toque fecha; tocar fora fecha.
 *
 * Props extra:
 *  - showHint (boolean) => mostra o “toque para ver” (default: true)
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
  imageAlt,
  imgLoading = "lazy",
  imgDecoding = "async",
  showHint = true,
}) => {
  const containerClass = styles[variant] || "";
  const captionClass = styles[`${variant}Caption`] || "";
  const { videoRef, handlers } = useHoverVideo();

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

  // Força modo "tap" em ecrãs <= 375px (mesmo que não haja touch real — útil no emulador)
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

  // Fechar ao tocar fora (quando tapMode)
  useEffect(() => {
    if (!tapMode) return;
    const onDocClick = (e) => {
      if (!cardRef.current) return;
      if (!cardRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, [tapMode]);

  const resolvedAlt = imageAlt || title || subtitle || "Área do salão";

  return (
    <div className={styles.Block}>
      <div
        ref={cardRef}
        className={`${styles.card} ${containerClass} ${open ? styles.open : ""}`}
        tabIndex={0}
        {...handlers}
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
        {/* Mídia de fundo */}
        {videoSrc ? (
          <VideoBG ref={videoRef} src={videoSrc} className={styles.bgVideo} />
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

        {/* Grelha interna nivelada */}
        <div className={styles.first}>
          <div className={styles.firstin}>
            {title && <span className={styles.firstinspan}>{title}</span>}
          </div>
        </div>

        {subtitle && <div className={styles.second}>{subtitle}</div>}
        {description && <div className={styles.third}>{description}</div>}

        {/* Hint touch — só se showHint=true e quando não está aberto */}
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
