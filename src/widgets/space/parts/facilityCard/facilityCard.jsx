// src/widgets/space/parts/facilityCard/facilityCard.jsx
import styles from "./facilityCard.module.css";
import TitleCaption from "@shared/ui/titleCaption/titleCaption.jsx";
import VideoBG from "@widgets/space/parts/videoBG/videoBG.jsx";
import { useHoverVideo } from "@widgets/space/hook/useHoverVideo";

const FacilityCard = ({
  variant = "variant1",
  title,
  subtitle,
  description,
  subtitle1,
  description1,
  imageSrc, // passe só UM: imageSrc...
  videoSrc, // ...ou videoSrc
}) => {
  const containerClass = styles[variant] || "";
  const captionClass = styles[`${variant}Caption`] || "";

  const { videoRef, handlers } = useHoverVideo();

  return (
    <div className={styles.Block}>
      <div
        className={`${styles.card} ${containerClass}`}
        tabIndex={0}
        {...handlers}
      >
        {/* mídia de fundo: se tiver videoSrc usa vídeo, senão usa imagem */}
        {videoSrc ? (
          <VideoBG ref={videoRef} src={videoSrc} className={styles.bgVideo} />
        ) : (
          imageSrc && (
            <div
              className={styles.bg}
              style={{ backgroundImage: `url(${imageSrc})` }}
              aria-hidden="true"
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
