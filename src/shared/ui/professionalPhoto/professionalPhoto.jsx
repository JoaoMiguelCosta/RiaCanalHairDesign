// ProfessionalPhoto.jsx
import { useState, useMemo } from "react";

const ProfessionalPhoto = ({
  ContainerImg, // classe do wrapper (já usas)
  imageClass, // classe do <img> (já usas)
  src,
  alt = "",
  width, // opcional: largura natural (px) → evita CLS
  height, // opcional: altura natural (px)
  sizes = "100vw", // opcional: para responsive images
  loading = "lazy", // lazy por defeito
  decoding = "async",
  fetchPriority, // "high" para imagens above-the-fold
  ratio, // opcional: força aspect-ratio no wrapper (ex: "4 / 3")
  fit = "cover", // object-fit por defeito
  placeholder, // opcional: JSX ou url de fallback
  ...rest
}) => {
  const [error, setError] = useState(false);

  // estilo inline só quando for útil (não colide com o teu CSS)
  const wrapperStyle = useMemo(() => {
    const style = {};
    if (ratio) style.aspectRatio = ratio;
    return style;
  }, [ratio]);

  if (!src && !placeholder) return <div className={ContainerImg} />;

  return (
    <div className={ContainerImg} style={wrapperStyle}>
      {!error ? (
        <img
          src={src}
          alt={alt}
          className={imageClass}
          loading={loading}
          decoding={decoding}
          fetchPriority={fetchPriority}
          sizes={sizes}
          width={width}
          height={height}
          style={{ objectFit: fit, width: "100%", height: "100%" }}
          onError={() => setError(true)}
          {...rest}
        />
      ) : placeholder ? (
        typeof placeholder === "string" ? (
          <img
            src={placeholder}
            alt={alt}
            className={imageClass}
            loading="lazy"
            decoding="async"
            style={{ objectFit: fit, width: "100%", height: "100%" }}
          />
        ) : (
          placeholder
        )
      ) : null}
    </div>
  );
};

export default ProfessionalPhoto;
