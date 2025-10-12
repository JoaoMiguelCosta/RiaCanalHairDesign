// src/shared/ui/logo/logoComponent.jsx
import Logo from "@shared/assets/branding/logo.png";

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
  width, // opcional: ajuda a evitar CLS
  height, // opcional
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
