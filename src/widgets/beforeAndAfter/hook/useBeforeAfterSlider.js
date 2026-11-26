// src/widgets/beforeAndAfter/hook/useBeforeAfterSlider.js
import { useCallback, useEffect, useLayoutEffect, useRef } from "react";

/** Velocidade do varrimento automático: 0,7 % a cada 20 ms (valor original). */
const SWEEP_PERCENT_PER_SEC = 35;
/** Permanência em 100 % antes de recomeçar em 0 %. */
const END_HOLD_MS = 1500;
const KEY_STEP = 2;
const PAGE_STEP = 10;
/** Limite de dt por frame: evita saltos quando o rAF esteve suspenso (separador
 *  em 2.º plano), mantendo a velocidade real até ~4 fps. */
const MAX_FRAME_MS = 250;
/** Deslocação mínima (px) para distinguir arrastamento/scroll de um toque. */
const TOUCH_SLOP_PX = 6;

const clamp = (v) => Math.min(100, Math.max(0, v));

/**
 * Slider Antes/Depois.
 *
 * Render: a posição (0–100) vive numa ref e é escrita diretamente no DOM como
 * variável CSS `--p` no clip e na camada da pega (e em aria-valuenow). A animação
 * não provoca renders React; o CSS deriva daí o clip, a linha e a pega.
 *
 * Autoplay (varrimento 0 → 100 %, pausa no fim, recomeço em 0 %) corre num
 * único loop requestAnimationFrame por cartão, baseado no tempo decorrido, e só
 * existe enquanto TODAS as condições o permitem. Cada motivo de pausa é
 * independente:
 *  - autoplay=false  → pausa explícita do utilizador ou movimento reduzido;
 *  - hover           → ponteiro (rato/caneta) sobre o cartão;
 *  - focus           → foco na pega;
 *  - offscreen       → cartão fora do viewport;
 *  - dragging        → arrastamento em curso;
 *  - manual          → o utilizador definiu a posição (arrastar, tocar,
 *                      teclado): o resultado é preservado e o autoplay deste
 *                      cartão não volta a disputar o valor. Só uma nova ação
 *                      explícita (Retomar → `resumeSignal`) o limpa. `onManualChange` avisa a
 *                      secção (para suspender a rotação de conjuntos).
 * O tempo de permanência no fim só avança enquanto o loop corre: um cartão em
 * pausa nunca é reiniciado.
 */
export function useBeforeAfterSlider({
  autoplay = true,
  startPercent = 50,
  onManualChange, // chamado quando o utilizador ajusta a posição
  resumeSignal = 0, // muda a cada "Retomar" explícito
} = {}) {
  const onManualRef = useRef(onManualChange);
  useEffect(() => {
    onManualRef.current = onManualChange;
  }, [onManualChange]);

  const containerRef = useRef(null);
  const clipRef = useRef(null);
  const thumbRef = useRef(null);
  const handleRef = useRef(null);
  const beforeBadgeRef = useRef(null);

  const posRef = useRef(clamp(startPercent));
  const reasonsRef = useRef({
    autoplay,
    hover: false,
    focus: false,
    offscreen: true, // até o IntersectionObserver confirmar a visibilidade
    dragging: false,
    manual: false,
  });
  const loopRef = useRef({ raf: 0, last: 0, held: 0 });
  const dragRef = useRef(null); // { id, x0, y0, active }

  // --- escrita no DOM -------------------------------------------------------
  const setPos = useCallback((value) => {
    const p = clamp(value);
    posRef.current = p;
    // Só nos dois elementos que a usam: no contentor, a variável herdada
    // invalidava o estilo de todos os descendentes a cada frame.
    const css = String(p);
    clipRef.current?.style.setProperty("--p", css);
    thumbRef.current?.style.setProperty("--p", css);

    const handle = handleRef.current;
    const now = String(Math.round(p));
    if (handle && handle.getAttribute("aria-valuenow") !== now) {
      handle.setAttribute("aria-valuenow", now);
      handle.setAttribute("aria-valuetext", `${now}% da imagem depois`);
    }
    if (beforeBadgeRef.current) beforeBadgeRef.current.hidden = p >= 100;
  }, []);

  // --- loop de animação -----------------------------------------------------
  const stop = useCallback(() => {
    const loop = loopRef.current;
    if (loop.raf) cancelAnimationFrame(loop.raf);
    loop.raf = 0;
  }, []);

  const frame = useCallback(
    (now) => {
      const loop = loopRef.current;
      const dt = Math.min(now - loop.last, MAX_FRAME_MS);
      loop.last = now;

      const p = posRef.current;
      if (p < 100) {
        loop.held = 0;
        setPos(p + (SWEEP_PERCENT_PER_SEC * dt) / 1000);
      } else {
        loop.held += dt;
        if (loop.held >= END_HOLD_MS) {
          loop.held = 0;
          setPos(0);
        }
      }
      loop.raf = requestAnimationFrame(frame);
    },
    [setPos]
  );

  const sync = useCallback(() => {
    const r = reasonsRef.current;
    const shouldRun =
      r.autoplay && !r.hover && !r.focus && !r.offscreen && !r.dragging && !r.manual;
    const loop = loopRef.current;
    if (shouldRun && !loop.raf) {
      loop.last = performance.now();
      loop.raf = requestAnimationFrame(frame);
    } else if (!shouldRun) {
      stop();
    }
  }, [frame, stop]);

  const setReason = useCallback(
    (key, value) => {
      if (reasonsRef.current[key] === value) return;
      reasonsRef.current[key] = value;
      sync();
    },
    [sync]
  );

  // Estado inicial no DOM antes da primeira pintura
  useLayoutEffect(() => {
    setPos(posRef.current);
  }, [setPos]);

  // Pausa explícita / movimento reduzido
  useEffect(() => {
    reasonsRef.current.autoplay = autoplay;
    sync();
  }, [autoplay, sync]);

  // "Retomar" (ação explícita, sinalizada por `resumeSignal`) devolve o
  // autoplay também aos cartões ajustados manualmente. Uma mudança da
  // preferência de movimento não o faz.
  const resumeSignalRef = useRef(resumeSignal);
  useEffect(() => {
    if (resumeSignalRef.current === resumeSignal) return;
    resumeSignalRef.current = resumeSignal;
    reasonsRef.current.manual = false;
    sync();
  }, [resumeSignal, sync]);

  // Visibilidade; a limpeza também cancela o loop (desmontagem / StrictMode)
  useEffect(() => {
    const el = containerRef.current;
    const r = reasonsRef.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      r.offscreen = false;
      sync();
      return stop;
    }
    const io = new IntersectionObserver(
      ([entry]) => setReason("offscreen", !entry.isIntersecting),
      { threshold: 0.05 }
    );
    io.observe(el);
    return () => {
      io.disconnect();
      r.offscreen = true;
      stop();
    };
  }, [setReason, sync, stop]);

  // --- interação ------------------------------------------------------------
  // Posição definida pelo utilizador: prevalece sobre o autoplay
  const setManualPos = useCallback(
    (value) => {
      const r = reasonsRef.current;
      if (!r.manual) {
        r.manual = true;
        sync();
        onManualRef.current?.();
      }
      // nova posição: a espera no fim (se voltar a 100 %) recomeça do zero
      loopRef.current.held = 0;
      setPos(value);
    },
    [setPos, sync]
  );

  const setFromClientX = useCallback(
    (clientX) => {
      const el = containerRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      if (!rect.width) return;
      setManualPos(((clientX - rect.left) / rect.width) * 100);
    },
    [setManualPos]
  );

  const endDrag = useCallback(
    (e, isRelease) => {
      const drag = dragRef.current;
      if (!drag || drag.id !== e.pointerId) return;
      // Toque simples (dedo quase parado): posiciona no ponto tocado
      const still =
        Math.abs(e.clientX - drag.x0) < TOUCH_SLOP_PX &&
        Math.abs(e.clientY - drag.y0) < TOUCH_SLOP_PX;
      if (isRelease && !drag.active && still) {
        setFromClientX(e.clientX);
      }
      dragRef.current = null;
      setReason("dragging", false);
    },
    [setFromClientX, setReason]
  );

  const containerHandlers = {
    onPointerDown: (e) => {
      if (e.button !== 0 || dragRef.current) return;
      const isTouch = e.pointerType === "touch";
      dragRef.current = {
        id: e.pointerId,
        x0: e.clientX,
        y0: e.clientY,
        active: !isTouch, // toque: só após gesto horizontal claro
      };
      setReason("dragging", true);
      // Captura: o arrastamento continua (e termina) fora do cartão
      e.currentTarget.setPointerCapture?.(e.pointerId);
      // Rato/caneta: posiciona já. Toque: espera por movimento horizontal ou
      // por um toque simples, para não saltar quando o gesto é um scroll
      // vertical (touch-action: pan-y → o browser envia pointercancel, mas
      // só depois de alguns pointermove).
      if (!isTouch) {
        e.preventDefault(); // sem seleção de texto nem arrastamento de imagem
        setFromClientX(e.clientX);
      }
    },
    onPointerMove: (e) => {
      const drag = dragRef.current;
      if (!drag || drag.id !== e.pointerId) return;
      if (!drag.active) {
        const dx = Math.abs(e.clientX - drag.x0);
        const dy = Math.abs(e.clientY - drag.y0);
        if (dx < TOUCH_SLOP_PX || dx <= dy) return;
        drag.active = true;
      }
      setFromClientX(e.clientX);
    },
    onPointerUp: (e) => endDrag(e, true),
    onPointerCancel: (e) => endDrag(e, false),
    onLostPointerCapture: (e) => endDrag(e, false),
    onPointerEnter: (e) => {
      if (e.pointerType !== "touch") setReason("hover", true);
    },
    onPointerLeave: (e) => {
      if (e.pointerType !== "touch") setReason("hover", false);
    },
    onFocus: () => setReason("focus", true),
    onBlur: (e) => {
      if (!e.currentTarget.contains(e.relatedTarget)) setReason("focus", false);
    },
  };

  const onHandleKeyDown = (e) => {
    const deltas = {
      ArrowRight: KEY_STEP,
      ArrowUp: KEY_STEP,
      ArrowLeft: -KEY_STEP,
      ArrowDown: -KEY_STEP,
      PageUp: PAGE_STEP,
      PageDown: -PAGE_STEP,
    };
    let next;
    if (e.key in deltas) next = Math.round(posRef.current) + deltas[e.key];
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = 100;
    else return;

    e.preventDefault(); // sem scroll da página
    setManualPos(next);
  };

  return {
    containerRef,
    clipRef,
    thumbRef,
    handleRef,
    beforeBadgeRef,
    containerHandlers,
    onHandleKeyDown,
  };
}
