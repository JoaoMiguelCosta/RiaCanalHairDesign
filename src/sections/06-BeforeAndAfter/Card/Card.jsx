import { useRef, useState, useCallback, useEffect, useMemo } from "react";
import styles from "./Card.module.css";
import TitleCaption from "../../../components/TitleCaption/TitleCaption";

// Mantido 100% igual em comportamento/medidas/ CSS; apenas removi hardcodes
// para poder reutilizar as FOTOS e o TitleCaption via props do Card.

function BeforeAfterSlider({
  beforeSrc,
  afterSrc,
  altBefore = "Antes",
  altAfter = "Depois",
  auto = true,
  speed = 20,
  pauseOnHover = true,
  startPercent = 50,
}) {
  const containerRef = useRef(null);
  const [percent, setPercent] = useState(startPercent);
  const [paused, setPaused] = useState(false);
  const directionRef = useRef(1);

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

  // autoplay
  useEffect(() => {
    if (!auto || paused) return;
    const id = setInterval(() => {
      setPercent((p) => {
        let next = p + directionRef.current * 1;
        if (next >= 100) {
          next = 100;
          directionRef.current = -1;
        } else if (next <= 0) {
          next = 0;
          directionRef.current = 1;
        }
        return next;
      });
    }, speed);
    return () => clearInterval(id);
  }, [auto, paused, speed]);

  // pausa quando sai do ecrã
  useEffect(() => {
    const el = containerRef.current;
    if (!el || !auto) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        setPaused(!entry.isIntersecting);
      },
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
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      role="region"
      aria-label="Comparação antes e depois"
      {...hoverHandlers}
    >
      <img src={beforeSrc} alt={altBefore} className={styles.sliderImg} />

      <div className={styles.afterClip} style={{ width: `${percent}%` }}>
        <img src={afterSrc} alt={altAfter} className={styles.sliderImg} />
      </div>

      {/* Mantém textos/estrutura exatamente como no original */}
      <span className={styles.beforeBadge}>Depois</span>
      <span className={styles.afterBadge}>Antes</span>

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

// Card: igual no markup/ CSS; apenas recebe as fotos e o conteúdo do TitleCaption por props.
export default function Card({
  beforeSrc,
  afterSrc,
  title,
  caption,
  altBefore = "Antes",
  altAfter = "Depois",
  auto = true,
  speed = 20,
  pauseOnHover = true,
  startPercent = 50,
}) {
  return (
    <div className={styles.card}>
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
    </div>
  );
}
