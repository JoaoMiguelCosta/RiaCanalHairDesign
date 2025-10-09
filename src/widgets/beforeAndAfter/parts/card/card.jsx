// src/widgets/beforeAndAfter/parts/card/card.jsx
import { useRef, useState, useCallback, useEffect, useMemo } from "react";
import styles from "./card.module.css";
import TitleCaption from "@shared/ui/titleCaption/titleCaption.jsx";

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
  const containerRef = useRef(null);
  const [percent, setPercent] = useState(startPercent);
  const [paused, setPaused] = useState(false);
  const timeoutRef = useRef(null); // limpa o setTimeout da pausa

  const setFromClientX = useCallback((clientX) => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = Math.min(Math.max(clientX - rect.left, 0), rect.width);
    setPercent(Math.round((x / rect.width) * 100));
  }, []);

  const onMouseDown = (e) => {
    e.preventDefault();
    setFromClientX(e.clientX);
    const onMove = (ev) => setFromClientX(ev.clientX);
    const onUp = () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  };

  const onTouchStart = (e) => setFromClientX(e.touches[0].clientX);
  const onTouchMove = (e) => setFromClientX(e.touches[0].clientX);

  const onKeyDown = (e) => {
    if (e.key === "ArrowLeft") setPercent((p) => Math.max(0, p - 2));
    if (e.key === "ArrowRight") setPercent((p) => Math.min(100, p + 2));
  };

  // autoplay: revela "depois" e recomeça do zero após pequena pausa
  useEffect(() => {
    if (!auto || paused) return;

    const id = setInterval(() => {
      setPercent((p) => {
        let next = p + 0.7;
        if (next >= 100) {
          next = 100;
          clearInterval(id);
          setPaused(true);
          timeoutRef.current = setTimeout(() => {
            setPercent(0);
            setPaused(false);
          }, 1500);
        }
        return next;
      });
    }, speed);

    return () => {
      clearInterval(id);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [auto, paused, speed]);

  // pausa autoplay quando sai do viewport
  useEffect(() => {
    const el = containerRef.current;
    if (!el || !auto) return;
    const observer = new IntersectionObserver(
      ([entry]) => setPaused(!entry.isIntersecting),
      { threshold: 0.2 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [auto]);

  const hoverHandlers = useMemo(
    () =>
      pauseOnHover
        ? {
            onMouseEnter: () => setPaused(true),
            onMouseLeave: () => setPaused(false),
            onFocus: () => setPaused(true),
            onBlur: () => setPaused(false),
          }
        : {},
    [pauseOnHover]
  );

  return (
    <div
      ref={containerRef}
      className={styles.slider}
      style={{ "--bg-img": `url(${beforeSrc})` }}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      role="region"
      aria-label="Comparação antes e depois"
      {...hoverHandlers}
    >
      {/* Base: imagem "antes" */}
      <img src={beforeSrc} alt={altBefore} className={styles.sliderImg} />

      {/* Clip revelado: imagem "depois" + badge que a acompanha */}
      <div className={styles.afterClip} style={{ width: `${percent}%` }}>
        <img src={afterSrc} alt={altAfter} className={styles.sliderImg} />
        <span className={styles.afterBadge}>Depois</span>
      </div>

      {/* Badge "Antes" só aparece enquanto percent < 100 */}
      {percent < 100 && <span className={styles.beforeBadge}>Antes</span>}

      <div
        className={styles.divider}
        style={{ left: `calc(${percent}% - 1px)` }}
        aria-hidden="true"
      />
      <button
        type="button"
        className={styles.handle}
        style={{ left: `${percent}%` }}
        onMouseDown={onMouseDown}
        onKeyDown={onKeyDown}
        aria-label="Arraste para comparar"
      />
    </div>
  );
}

export default function Card({
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
    <article className={styles.card}>
      <div className={styles.photos}>
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

      <TitleCaption
        className={styles.customTitleBlock}
        title={title}
        caption={caption}
      />
    </article>
  );
}
