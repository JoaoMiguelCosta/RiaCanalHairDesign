import { useState, useMemo } from "react";

const ProfessionalPhoto = ({
  ContainerImg, // classe do wrapper
  imageClass, // classe da <img>
  src,
  alt = "",
  width,
  height,
  srcSet,
  sizes = "100vw",
  loading = "lazy",
  decoding = "async",
  fetchPriority,
  ratio,
  fit = "cover",
  placeholder, // JSX ou url de fallback
  draggable = false,
  // atributos do wrapper (ex.: ref observada e handlers de hover), que fica
  // sempre no DOM mesmo quando a <img> falha
  containerProps,
  ...rest
}) => {
  const [error, setError] = useState(false);
  // O erro pertence ao src que falhou: cada mudança de src volta a tentar
  // (ajuste de estado durante o render, padrão recomendado pelo React)
  const [lastSrc, setLastSrc] = useState(src);
  if (src !== lastSrc) {
    setLastSrc(src);
    setError(false);
  }

  // Hooks SEMPRE no topo (antes de qualquer return)
  const wrapperStyle = useMemo(() => {
    const style = {};
    if (ratio) style.aspectRatio = ratio;
    return style;
  }, [ratio]);

  const imgStyle = useMemo(() => {
    if (ratio) {
      return { objectFit: fit, width: "100%", height: "100%" };
    }
    return { objectFit: fit, width: "100%", height: "auto" };
  }, [ratio, fit]);

  const role = alt === "" ? "presentation" : undefined;

  // Após hooks, podes ter returns condicionais
  if (!src && !placeholder)
    return <div className={ContainerImg} {...containerProps} />;

  return (
    <div className={ContainerImg} style={wrapperStyle} {...containerProps}>
      {!error ? (
        <img
          src={src}
          alt={alt}
          className={imageClass}
          loading={loading}
          decoding={decoding}
          fetchPriority={fetchPriority}
          srcSet={srcSet}
          sizes={srcSet ? sizes : undefined}
          width={width}
          height={height}
          style={imgStyle}
          onError={() => setError(true)}
          draggable={draggable}
          role={role}
          {...rest}
        />
      ) : placeholder ? (
        typeof placeholder === "string" ? (
          <img
            src={placeholder}
            alt=""
            className={imageClass}
            loading="lazy"
            decoding="async"
            style={imgStyle}
            draggable={draggable}
            role="presentation"
          />
        ) : (
          placeholder
        )
      ) : null}
    </div>
  );
};

export default ProfessionalPhoto;
