import styles from "./portfolio.module.css";

import Subtitle from "@shared/ui/subtitle/subtitle.jsx";
import Title from "@shared/ui/title/title.jsx";
import Text from "@shared/ui/text/text.jsx";
import Button from "@shared/ui/button/button.jsx";
import ProfessionalPhoto from "@shared/ui/professionalPhoto/professionalPhoto.jsx";
import Quote from "@shared/ui/quote/quote.jsx";

import Hero from "@media/hero/hero-1920.webp";
import {
  services, // ["Cabeleireiro", "Estética", "Unhas"]
  worksHair,
  worksEstetica,
  worksUnhas,
} from "@content/services/services.js";

import data from "@content/portfolio/portfolio.json";
import { usePortfolioTabs } from "@widgets/portfolio/hook/usePortfolioTabs";
import { isTouchDevice } from "@shared/lib/isTouchDevice";
import { useEffect, useRef, useState } from "react";

const worksByService = {
  Cabeleireiro: worksHair,
  Estética: worksEstetica,
  Unhas: worksUnhas || [],
};

const Portfolio = () => {
  const { activeService, selectServiceAndScroll, rows } = usePortfolioTabs(
    services,
    worksByService,
    3
  );

  // === Touch toggle (mesma deteção do Space; lida uma vez, na montagem) ===
  const [isTouch] = useState(isTouchDevice);
  const [openId, setOpenId] = useState(null);
  const gridRef = useRef(null);

  // O fundo desfocado (::before) usa a mesma foto; só é aplicado depois de a
  // <img> lazy carregar, para não forçar o download antecipado via CSS.
  const [loadedPhotos, setLoadedPhotos] = useState(() => new Set());
  const markPhotoLoaded = (src) =>
    setLoadedPhotos((prev) => (prev.has(src) ? prev : new Set(prev).add(src)));

  // fechar ao tocar fora (apenas touch)
  useEffect(() => {
    if (!isTouch) return;
    const onDoc = (e) => {
      if (!gridRef.current) return;
      if (!gridRef.current.contains(e.target)) setOpenId(null);
    };
    document.addEventListener("click", onDoc);
    return () => document.removeEventListener("click", onDoc);
  }, [isTouch]);

  return (
    <section
      id="Works"
      className={styles.portfolio}
      aria-labelledby="Works-title"
    >
      <Subtitle>{data.subtitle}</Subtitle>
      <Title
        id="Works-title"
        line1={data.title1}
        line2={data.title2}
        variant="highlight"
      />

      <Text className={styles.aboutText} variant="centerMobile">
        <span>{data.intro}</span>
      </Text>

      {/* Botões como tabs */}
      <div className={styles.Buttons}>
        {services.map((label) => {
          const isActive = activeService === label;
          return (
            <Button
              key={label}
              className={styles.serviceBtn}
              onClick={() => {
                setOpenId(null); // fecha abertos ao mudar de tab
                selectServiceAndScroll(label);
              }}
              // Filtro de seleção única: aria-pressed comunica o estado
              // (aria-current era redundante num botão de alternância)
              aria-pressed={isActive}
              data-active={isActive ? "true" : "false"}
            >
              {label}
            </Button>
          );
        })}
      </div>

      {/* Grelha de trabalhos */}
      {rows.length > 0 ? (
        rows.map((grupo, index) => (
          <div
            key={`${activeService}-row-${index}`}
            className={styles.jobs}
            ref={index === 0 ? gridRef : undefined}
          >
            {grupo.map((trabalho, idx) => {
              const id = `${activeService}-${index}-${idx}`;
              const titleId = `portfolio-${id}-title`;
              const isOpen = isTouch && openId === id;
              const photo = trabalho.foto || Hero;

              return (
                <div
                  key={`${activeService}-job-${index}-${idx}`}
                  className={styles.job}
                >
                  <div
                    className={`${styles.imageHoverCard} ${
                      isOpen ? styles.open : ""
                    }`}
                    style={
                      loadedPhotos.has(photo)
                        ? { "--photo-src": `url(${photo})` }
                        : undefined
                    }
                    // toggle só em touch
                    onClick={
                      isTouch
                        ? (e) => {
                            e.stopPropagation();
                            setOpenId((prev) => (prev === id ? null : id));
                          }
                        : undefined
                    }
                    // Desktop: grupo focável para revelar a descrição por
                    // teclado (equivalente ao hover, via :focus-visible no CSS).
                    // Touch: o controlo é o <button> nativo abaixo; o cartão
                    // não é um role="button", que tornaria o <h3> e a
                    // descrição presentacionais.
                    role={isTouch ? undefined : "group"}
                    aria-labelledby={isTouch ? undefined : titleId}
                    tabIndex={isTouch ? undefined : 0}
                  >
                    <ProfessionalPhoto
                      ContainerImg={styles.myImageContainer}
                      imageClass={styles.myImage}
                      src={photo}
                      alt={trabalho.titulo}
                      loading="lazy"
                      decoding="async"
                      onLoad={() => markPhotoLoaded(photo)}
                    />

                    <div className={styles.imageOverlay}>
                      <h3 id={titleId} className={styles.overlayTitle}>
                        {trabalho.titulo}
                      </h3>
                      <p className={styles.overlayLegend}>
                        {trabalho.descricao}
                      </p>
                    </div>

                    {/* Hint mobile: aparece só em touch e desaparece quando o card abre */}
                    <div className={styles.tapHint} aria-hidden="true">
                      Toque para ver
                    </div>

                    {/* Touch: botão de alternância nativo que cobre o cartão
                        (toque, Enter e Espaço). O clique borbulha para o
                        onClick do cartão, que faz a alternância. */}
                    {isTouch && (
                      <button
                        type="button"
                        className={styles.cardToggle}
                        aria-pressed={isOpen}
                        aria-labelledby={titleId}
                      />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ))
      ) : (
        <div className={styles.jobs}>
          <div className={styles.job}>
            <Text variant="centerMobile">
              <span>Em breve teremos trabalhos nesta especialidade.</span>
            </Text>
          </div>
        </div>
      )}

      <Quote variant="default">“{data.quote}”</Quote>
    </section>
  );
};

export default Portfolio;
