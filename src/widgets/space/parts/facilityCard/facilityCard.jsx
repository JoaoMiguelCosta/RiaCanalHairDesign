// src/widgets/space/parts/facilityCard/facilityCard.jsx
import styles from "./facilityCard.module.css";
import TitleCaption from "@shared/ui/titleCaption/titleCaption.jsx";
// caminho correto do componente de vídeo (fora de /parts)
import VideoBG from "@widgets/space/parts/videoBG/videoBG.jsx"
import { useHoverVideo } from "@widgets/space/hook/useHoverVideo";

/**
 * A11y + performance:
 * - Quando usa imagem, renderiza <img> com alt/ lazy/ async (em vez de background-image)
 * - Mantém API/markup externo iguais (sem alterar lógica)
 */
const FacilityCard = ({
  variant = "variant1",
  title,
  subtitle,
  description,
  subtitle1,
  description1,
  imageSrc, // passe só UM: imageSrc...
  videoSrc, // ...ou videoSrc
  // novos opcionais (não obrigatórios)
  imageAlt, // alt explícito; se não vier, cai para title/subtitle/default
  imgLoading = "lazy",
  imgDecoding = "async",
}) => {
  const containerClass = styles[variant] || "";
  const captionClass = styles[`${variant}Caption`] || "";

  const { videoRef, handlers } = useHoverVideo();

  // alt resolvido (curto e descritivo)
  const resolvedAlt = imageAlt || title || subtitle || "Área do salão";

  return (
    <div className={styles.Block}>
      <div
        className={`${styles.card} ${containerClass}`}
        tabIndex={0}
        {...handlers}
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
