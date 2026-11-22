// src/shared/ui/logo/logoComponent.jsx
// WebP sem perdas (com transparência), 320×319: 2× o maior tamanho apresentado (Hero, 160px).
// O PNG original (2505×2496) mantém-se no repositório.
import Logo from "@shared/assets/branding/logo.webp";

// Dimensões intrínsecas: dão ao browser a proporção antes do download (evita CLS).
// O tamanho apresentado continua definido pelo CSS de cada local.
const LOGO_WIDTH = 320;
const LOGO_HEIGHT = 319;

/**
 * Componente de logo acessível.
 * - Por defeito, usa alt="Ria Canal Hair Design".
 * - Em contextos onde já existe texto equivalente (Hero, Footer, SignatureMark),
 *   passa alt="" e ariaHidden para evitar redundância na leitura.
 */
const LogoComponent = ({
  className,
  imgClassName,
  alt = "Ria Canal Hair Design",
  ariaHidden = false,
  width = LOGO_WIDTH,
  height = LOGO_HEIGHT,
  loading = "eager",
  decoding = "async",
  draggable = false,
}) => {
  return (
    <div className={className}>
      <img
        src={Logo}
        alt={alt}
        className={imgClassName}
        width={width}
        height={height}
        loading={loading}
        decoding={decoding}
        draggable={draggable}
        aria-hidden={ariaHidden || undefined}
      />
    </div>
  );
};

export default LogoComponent;
