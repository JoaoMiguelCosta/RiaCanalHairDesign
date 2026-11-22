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
    onError,
  },
  ref
) {
  if (!src) return null;

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
