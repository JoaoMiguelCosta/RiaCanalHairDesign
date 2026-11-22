// src/widgets/beforeAndAfter/parts/card/card.jsx
import { memo, useState } from "react";
import styles from "./card.module.css";
import TitleCaption from "@shared/ui/titleCaption/titleCaption.jsx";
import { useBeforeAfterSlider } from "@widgets/beforeAndAfter/hook/useBeforeAfterSlider";

const {
  slider,
  sliderImage,
  afterClip,
  afterBadge,
  beforeBadge,
  thumb,
  divider,
  handle,
  card,
  photos,
  titleBlock,
} = styles;

function BeforeAfterSlider({
  beforeSrc,
  afterSrc,
  title, // usado nos nomes acessíveis
  beforeAlt = "Antes",
  afterAlt = "Depois",
  // atributos de performance das imagens
  imgLoading = "lazy",
  imgDecoding = "async",
  autoplay = true,
  onManualChange,
  resumeSignal,
  startPercent = 50,
}) {
  const {
    containerRef,
    clipRef,
    thumbRef,
    handleRef,
    beforeBadgeRef,
    containerHandlers,
    onHandleKeyDown,
  } = useBeforeAfterSlider({
    autoplay,
    startPercent,
    onManualChange,
    resumeSignal,
  });

  const suffix = title ? ` — ${title}` : "";

  // O fundo desfocado (::before) reutiliza a imagem "antes"; só é aplicado
  // depois de a <img> lazy carregar, para não antecipar o download via CSS.
  // (`--p` é escrito pelo hook diretamente em .afterClip e .thumb.)
  const [bgReady, setBgReady] = useState(false);

  return (
    <div
      ref={containerRef}
      className={slider}
      style={bgReady ? { "--bg-img": `url(${beforeSrc})` } : undefined}
      // group (não landmark): evita 3 regiões com o mesmo nome; o título
      // distingue cada comparação
      role="group"
      aria-label={`Comparação antes e depois${suffix}`}
      {...containerHandlers}
    >
      {/* Base: imagem "antes" */}
      <img
        src={beforeSrc}
        alt={beforeAlt}
        className={sliderImage}
        loading={imgLoading}
        decoding={imgDecoding}
        onLoad={() => setBgReady(true)}
      />

      {/* Imagem "depois" em tamanho real, revelada por clip-path até --p % */}
      <div ref={clipRef} className={afterClip}>
        <img
          src={afterSrc}
          alt={afterAlt}
          className={sliderImage}
          loading={imgLoading}
          decoding={imgDecoding}
        />
      </div>

      {/* Linha, pega e badges acompanham --p via transform: "Antes" à
          direita da divisão (escondido pelo hook a 100 %), "Depois" à esquerda */}
      <div ref={thumbRef} className={thumb}>
        <span ref={beforeBadgeRef} className={beforeBadge}>
          Antes
        </span>
        <span className={afterBadge}>Depois</span>
        <div className={divider} aria-hidden="true" />
        {/* Slider personalizado (WAI-ARIA APG): aria-valuenow/valuetext são
            atualizados pelo hook; Setas ±2, PageUp/PageDown ±10, Home/End */}
        <div
          ref={handleRef}
          role="slider"
          tabIndex={0}
          className={handle}
          aria-label={`Posição da divisão${suffix}`}
          aria-valuemin={0}
          aria-valuemax={100}
          onKeyDown={onHandleKeyDown}
        />
      </div>
    </div>
  );
}

// As restantes props (imagens, alts, autoplay, …) seguem para o slider
function Card({ title, caption, ...sliderProps }) {
  return (
    <article className={card}>
      <div className={photos}>
        <BeforeAfterSlider title={title} {...sliderProps} />
      </div>

      <TitleCaption className={titleBlock} title={title} caption={caption} />
    </article>
  );
}

export default memo(Card);
