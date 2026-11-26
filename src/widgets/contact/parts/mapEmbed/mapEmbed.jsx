// src/widgets/contact/parts/mapEmbed/mapEmbed.jsx
// Mapa do Google Maps carregado só depois de uma ação explícita do visitante.
// Até ao clique em «Mostrar mapa» não existe <iframe> no DOM, por isso o
// browser não faz nenhum pedido à Google (nem no carregamento, nem durante o
// scroll; `loading="lazy"` apenas adiava esse pedido). O clique é uma ação
// para carregar conteúdo externo, com a informação ao lado do botão: não é
// guardado (sem cookies nem localStorage) e vale só para a vista atual.
import { memo, useEffect, useId, useRef, useState } from "react";
import { Link } from "react-router-dom";
import styles from "./mapEmbed.module.css";

const MapEmbed = ({ src, title, heading, notice, privacyLabel, button }) => {
  const [shown, setShown] = useState(false);
  const frameRef = useRef(null);
  const headingId = useId();
  const noticeId = useId();

  // O botão desaparece com o clique: o foco passa para o mapa, em vez de se
  // perder para o <body> (teclado e leitores de ecrã continuam no sítio).
  useEffect(() => {
    if (shown) frameRef.current?.focus();
  }, [shown]);

  if (shown) {
    return (
      <iframe
        ref={frameRef}
        className={styles.frame}
        title={title}
        src={src}
        allowFullScreen
        // Nenhum Referer para a Google: o mapa incorporado (sem chave de API)
        // funciona sem ele (verificado em Chromium, Firefox e WebKit).
        referrerPolicy="no-referrer"
      />
    );
  }

  return (
    <div className={styles.placeholder} role="group" aria-labelledby={headingId}>
      <p id={headingId} className={styles.heading}>
        {heading}
      </p>
      <p id={noticeId} className={styles.notice}>
        {notice} <Link to="/privacidade">{privacyLabel}</Link>.
      </p>
      <button
        type="button"
        className={styles.button}
        aria-describedby={noticeId}
        onClick={() => setShown(true)}
      >
        {button}
      </button>
    </div>
  );
};

export default memo(MapEmbed);
