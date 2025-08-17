import { useRef } from "react";
import styles from "./FacilityCard.module.css";
import TitleCaption from "../../../components/TitleCaption/TitleCaption";
import VideoBG from "../VideoBG/VideoBG";

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
  const videoRef = useRef(null);

  const play = () => videoRef.current?.play().catch(() => {});
  const stop = () => {
    if (!videoRef.current) return;
    videoRef.current.pause();
    videoRef.current.currentTime = 0;
  };

  return (
    <div className={styles.Block}>
      <div
        className={`${styles.card} ${containerClass}`}
        tabIndex={0}
        onMouseEnter={play}
        onFocus={play}
        onMouseLeave={stop}
        onBlur={stop}
        onTouchStart={play}
        onTouchEnd={stop}
        onTouchCancel={stop}
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
