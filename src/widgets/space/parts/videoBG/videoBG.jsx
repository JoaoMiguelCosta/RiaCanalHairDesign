// src/widgets/space/videoBG/VideoBG.jsx
import { forwardRef } from "react";

const VideoBG = forwardRef(function VideoBG(
  {
    src,
    className,
    // novos opcionais (não obrigatórios)
    poster, // imagem de poster (reduz flash/preload)
    autoPlay = false, // por defeito não auto-reproduz (hover/JS controla)
    preload = "metadata", // equilibrado para performance
    muted = true, // bg video deve ser mudo
    loop = true,
    playsInline = true,
    ariaHidden = true, // é decorativo no fundo
    onError, // callback opcional
  },
  ref
) {
  if (!src) return null; // segurança: não renderiza sem src

  return (
    <video
      ref={ref}
      className={className}
      src={src}
      poster={poster}
      autoPlay={autoPlay}
      muted={muted}
      loop={loop}
      playsInline={playsInline}
      preload={preload}
      aria-hidden={ariaHidden}
      tabIndex={-1}
      disablePictureInPicture
      onError={onError}
    />
  );
});

export default VideoBG;
