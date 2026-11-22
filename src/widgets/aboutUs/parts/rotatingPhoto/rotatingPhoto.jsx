// src/widgets/aboutUs/parts/rotatingPhoto/rotatingPhoto.jsx
import { useRef } from "react";
import ProfessionalPhoto from "@shared/ui/professionalPhoto/professionalPhoto.jsx";
import { useRotatingImage } from "@widgets/aboutUs/hook/useRotatingImage";
import { usePrefersReducedMotion } from "@shared/lib/usePrefersReducedMotion";

/**
 * Fotografia com rotação automática. Isolada num componente próprio para que
 * cada troca de imagem só re-renderize a fotografia e não a secção inteira.
 * A imagem não é focável, pelo que não há pausa por foco (só hover).
 */
const RotatingPhoto = ({ images, intervalMs = 3000, containerClass, imageClass, alt }) => {
  // Observa o contentor (tem aspect-ratio próprio e a <img> ocupa-o por
  // inteiro), não a <img>: se uma imagem falhar a <img> sai do DOM, mas o
  // contentor continua observável e a receber o hover, e a rotação prossegue.
  const frameRef = useRef(null);
  // Movimento reduzido: imagem fixa (a primeira), sem troca automática
  const reducedMotion = usePrefersReducedMotion();
  const { currentImage, pauseHandlers } = useRotatingImage(images, {
    intervalMs,
    enabled: !reducedMotion,
    rootRef: frameRef,
  });

  return (
    <ProfessionalPhoto
      ContainerImg={containerClass}
      imageClass={imageClass}
      src={currentImage}
      alt={alt}
      containerProps={{ ref: frameRef, ...pauseHandlers }}
    />
  );
};

export default RotatingPhoto;
