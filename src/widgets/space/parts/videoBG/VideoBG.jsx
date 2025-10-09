import { forwardRef } from "react";

const VideoBG = forwardRef(function VideoBG({ src, className }, ref) {
  if (!src) return null; // segurança: não renderiza sem src
  return (
    <video
      ref={ref}
      className={className}
      src={src}
      muted
      loop
      playsInline
      preload="metadata"
      aria-hidden="true"
    />
  );
});

export default VideoBG;
