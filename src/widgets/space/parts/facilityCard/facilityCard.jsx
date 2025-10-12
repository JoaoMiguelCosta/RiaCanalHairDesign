import { useEffect, useMemo, useRef, useState } from "react";
import styles from "./facilityCard.module.css";
import TitleCaption from "@shared/ui/titleCaption/titleCaption.jsx";
import VideoBG from "@widgets/space/parts/videoBG/videoBG.jsx";
import { useHoverVideo } from "@widgets/space/hook/useHoverVideo";

/**
 * FacilityCard
 * - Desktop (hover/pointer:fine): imagem/vídeo aparece no :hover/:focus-visible
 * - Touch (hover:none): 1º toque abre e fica (classe .open), 2º toque fecha. Tocar fora fecha.
 * - Mantém a mesma API/markup externo.
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
}) => {
  const containerClass = styles[variant] || "";
  const captionClass = styles[`${variant}Caption`] || "";
  const { videoRef, handlers } = useHoverVideo();

  // Detecta ambiente touch
  const isTouch = useMemo(() => {
    if (typeof window === "undefined") return false;
    const mm = window.matchMedia?.("(hover: none)");
    return (
      "ontouchstart" in window ||
      navigator.maxTouchPoints > 0 ||
      (mm && mm.matches)
    );
  }, []);

  // Toggle fixo em touch
  const [open, setOpen] = useState(false);
  const cardRef = useRef(null);

  // Fechar ao tocar fora (apenas em touch)
  useEffect(() => {
    if (!isTouch) return;
    const onDocClick = (e) => {
      if (!cardRef.current) return;
      if (!cardRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, [isTouch]);

  const resolvedAlt = imageAlt || title || subtitle || "Área do salão";

  return (
    <div className={styles.Block}>
      <div
        ref={cardRef}
        className={`${styles.card} ${containerClass} ${open ? styles.open : ""}`}
        tabIndex={0}
        {...handlers}
        // Em touch: toggle no toque; em desktop, não altera
        onClick={
          isTouch
            ? (e) => {
                e.stopPropagation();
                setOpen((v) => !v);
              }
            : undefined
        }
        onKeyDown={
          isTouch
            ? (e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setOpen((v) => !v);
                }
              }
            : undefined
        }
      >
        {/* Mídia de fundo: vídeo tem prioridade; caso contrário, imagem acessível */}
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

        <div className={styles.first}>
          <div className={styles.firstin}>
            {title && <span className={styles.firstinspan}>{title}</span>}
          </div>
        </div>

        {subtitle && <div className={styles.second}>{subtitle}</div>}
        {description && <div className={styles.third}>{description}</div>}
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
