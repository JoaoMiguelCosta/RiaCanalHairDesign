import styles from "./portfolio.module.css";

import Subtitle from "@shared/ui/subtitle/subtitle.jsx";
import Title from "@shared/ui/title/title.jsx";
import Text from "@shared/ui/text/text.jsx";
import Button from "@shared/ui/button/button.jsx";
import ProfessionalPhoto from "@shared/ui/professionalPhoto/professionalPhoto.jsx";
import Quote from "@shared/ui/quote/quote.jsx";

import Hero from "@media/hero/hero.png";
import {
  services, // ["Cabeleireiro", "Estética", "Unhas"]
  worksHair,
  worksEstetica,
  worksUnhas,
} from "@content/services/services.js";

import data from "@content/portfolio/portfolio.json";
import { usePortfolioTabs } from "@widgets/portfolio/hook/usePortfolioTabs";
import { useEffect, useMemo, useRef, useState } from "react";

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

  // === Touch toggle (igual ao Space) ===
  const isTouch = useMemo(() => {
    if (typeof window === "undefined") return false;
    const mm = window.matchMedia?.("(hover: none)");
    return (
      "ontouchstart" in window ||
      navigator.maxTouchPoints > 0 ||
      (mm && mm.matches)
    );
  }, []);
  const [openId, setOpenId] = useState(null);
  const gridRef = useRef(null);

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
    <div id="Works" className={styles.portfolio}>
      <Subtitle>{data.subtitle}</Subtitle>
      <Title line1={data.title1} line2={data.title2} variant="highlight" />

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
              button={styles.serviceBtn}
              onClick={() => {
                setOpenId(null); // fecha abertos ao mudar de tab
                selectServiceAndScroll(label);
              }}
              aria-pressed={isActive}
              aria-current={isActive ? "true" : undefined}
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
              const isOpen = isTouch && openId === id;

              return (
                <div
                  key={`${activeService}-job-${index}-${idx}`}
                  className={styles.job}
                >
                  <div
                    className={`${styles.imageHoverCard} ${
                      isOpen ? styles.open : ""
                    }`}
                    style={{ "--photo-src": `url(${trabalho.foto || Hero})` }}
                    // toggle só em touch
                    onClick={
                      isTouch
                        ? (e) => {
                            e.stopPropagation();
                            setOpenId((prev) => (prev === id ? null : id));
                          }
                        : undefined
                    }
                    role={isTouch ? "button" : undefined}
                    tabIndex={isTouch ? 0 : undefined}
                    onKeyDown={
                      isTouch
                        ? (e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault();
                              setOpenId((prev) => (prev === id ? null : id));
                            }
                          }
                        : undefined
                    }
                  >
                    <ProfessionalPhoto
                      ContainerImg={styles.myImageContainer}
                      imageClass={styles.myImage}
                      src={trabalho.foto || Hero}
                      alt={trabalho.titulo}
                      loading="lazy"
                      decoding="async"
                    />

                    <div className={styles.imageOverlay}>
                      <h3 className={styles.overlayTitle}>{trabalho.titulo}</h3>
                      <p className={styles.overlayLegend}>
                        {trabalho.descricao}
                      </p>
                    </div>

                    {/* Hint mobile: aparece só em touch e desaparece quando o card abre */}
                    <div className={styles.tapHint} aria-hidden="true">
                      Toque para ver
                    </div>
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

      <Quote variante="default">“{data.quote}”</Quote>
    </div>
  );
};

export default Portfolio;
