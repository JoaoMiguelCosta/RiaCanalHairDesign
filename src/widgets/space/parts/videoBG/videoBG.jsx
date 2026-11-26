// src/widgets/space/parts/videoBG/videoBG.jsx
import { forwardRef } from "react";

const VideoBG = forwardRef(function VideoBG(
  {
    src,
    className,
    poster,
    autoPlay = false,
    preload = "metadata",
    muted = true,
    loop = true,
    playsInline = true,
    ariaHidden = true,
    deferSrc = false,
    onError,
  },
  ref
) {
  if (!src) return null;

  return (
    <video
      ref={ref}
      className={className}
      // deferSrc: o URL fica em data-src e só passa a src quando o componente
      // pai o pede (attachMediaSrc). Sem src o browser não pode descarregar
      // nada, mesmo os que ignoram preload="none" (Fase 10).
      src={deferSrc ? undefined : src}
      data-src={deferSrc ? src : undefined}
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
