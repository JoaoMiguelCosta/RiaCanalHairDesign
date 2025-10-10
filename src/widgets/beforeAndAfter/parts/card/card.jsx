// src/widgets/beforeAndAfter/parts/card/card.jsx
import { memo } from "react";
import styles from "./card.module.css";
import TitleCaption from "@shared/ui/titleCaption/titleCaption.jsx";
import { useBeforeAfterSlider } from "@widgets/beforeAndAfter/hook/useBeforeAfterSlider";

const {
  slider,
  sliderImage, // was sliderImg
  afterClip,
  afterBadge,
  beforeBadge,
  divider,
  handle,
  card,
  photos,
  titleBlock, // was customTitleBlock
} = styles;

function BeforeAfterSlider({
  beforeSrc,
  afterSrc,
  altBefore = "Antes",
  altAfter = "Depois",
  auto = true,
  speed = 20, // intervalo do setInterval (ms)
  pauseOnHover = true,
  startPercent = 50,
}) {
  const {
    containerRef,
    percent,
    onMouseDown,
    onTouchStart,
    onTouchMove,
    onKeyDown,
    hoverHandlers,
  } = useBeforeAfterSlider({ auto, speed, pauseOnHover, startPercent });

  return (
    <div
      ref={containerRef}
      className={slider}
      style={{ "--bg-img": `url(${beforeSrc})` }}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      role="region"
      aria-label="Comparação antes e depois"
      {...hoverHandlers}
    >
      {/* Base: imagem "antes" */}
      <img src={beforeSrc} alt={altBefore} className={sliderImage} />

      {/* Clip revelado: imagem "depois" + badge que a acompanha */}
      <div className={afterClip} style={{ width: `${percent}%` }}>
        <img src={afterSrc} alt={altAfter} className={sliderImage} />
        <span className={afterBadge}>Depois</span>
      </div>

      {/* Badge "Antes" só aparece enquanto percent < 100 */}
      {percent < 100 && <span className={beforeBadge}>Antes</span>}

      <div
        className={divider}
        style={{ left: `calc(${percent}% - 1px)` }}
        aria-hidden="true"
      />
      <button
        type="button"
        className={handle}
        style={{ left: `${percent}%` }}
        onMouseDown={onMouseDown}
        onKeyDown={onKeyDown}
        aria-label="Arraste para comparar"
      />
    </div>
  );
}

function Card({
  beforeSrc,
  afterSrc,
  title,
  caption,
  altBefore = "Antes",
  altAfter = "Depois",
  auto = true,
  speed = 20, // pode ser ajustado via prop
  pauseOnHover = true,
  startPercent = 50,
}) {
  return (
    <article className={card}>
      <div className={photos}>
        <BeforeAfterSlider
          beforeSrc={beforeSrc}
          afterSrc={afterSrc}
          altBefore={altBefore}
          altAfter={altAfter}
          auto={auto}
          speed={speed}
          pauseOnHover={pauseOnHover}
          startPercent={startPercent}
        />
      </div>

      <TitleCaption className={titleBlock} title={title} caption={caption} />
    </article>
  );
}

export default memo(Card);
