// src/widgets/portfolio/ui/portfolio.jsx
import { useState, useMemo, useEffect } from "react";
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

/**
 * Agrupa em linhas (máx 3) evitando deixar 1 card isolado na última linha.
 * Ex.: 7 -> 3 + 2 + 2 ; 10 -> 3 + 3 + 2 + 2 ; 8 -> 3 + 3 + 2 ; 9 -> 3 + 3 + 3
 */
const groupWorks = (arr, size = 3) => {
  if (!Array.isArray(arr) || arr.length === 0) return [];
  const chunks = [];
  for (let i = 0; i < arr.length; i += size)
    chunks.push(arr.slice(i, i + size));
  if (chunks.length > 1 && chunks[chunks.length - 1].length === 1) {
    const last = chunks.pop();
    const prev = chunks.pop();
    const balanced = [
      prev.slice(0, prev.length - 1),
      [prev[prev.length - 1], ...last],
    ];
    chunks.push(...balanced);
  }
  return chunks;
};

const Portfolio = () => {
  // 1) estado inicial: Cabeleireiro (ou query ?service= se existir e for válida)
  const getInitialService = () => {
    try {
      const params = new URLSearchParams(window.location.search);
      const s = params.get("service");
      if (s && services.includes(s)) return s;
    } catch {}
    return "Cabeleireiro";
  };

  const [activeService, setActiveService] = useState(getInitialService);

  // 2) mapa de trabalhos por serviço
  const worksByService = useMemo(
    () => ({
      Cabeleireiro: worksHair,
      Estética: worksEstetica,
      Unhas: worksUnhas || [],
    }),
    []
  );

  // 4) ouve o evento vindo do TeamAndServices e ativa a tab correta + scroll
  useEffect(() => {
    const handler = (e) => {
      const service = e.detail;
      if (!services.includes(service)) return;
      setActiveService(service);
      const el = document.getElementById("Works");
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    };
    window.addEventListener("activate-portfolio-service", handler);
    return () =>
      window.removeEventListener("activate-portfolio-service", handler);
  }, []);

  // 5) se já entras com #Works na URL, faz scroll (caso de refresh)
  useEffect(() => {
    if (window.location.hash === "#Works") {
      setTimeout(() => {
        document.getElementById("Works")?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 0);
    }
  }, []);

  const works = worksByService[activeService] ?? [];
  const linhas = groupWorks(works, 3);

  return (
    <div id="Works" className={styles.portfolio}>
      <Subtitle>OS NOSSOS TRABALHOS</Subtitle>
      <Title
        line1="Portfólio por"
        line2="Especialidade de Beleza"
        variant="highlight"
      />

      <Text className={styles.aboutText} variant="centerMobile">
        <span>
          Profissionais especializadas, dedicadas a realçar a sua beleza natural
          com técnicas personalizadas e cuidado individualizado.
        </span>
      </Text>

      {/* Botões como tabs */}
      <div className={styles.Buttons}>
        {services.map((label) => (
          <Button
            key={label}
            button={styles.serviceBtn}
            onClick={() => {
              setActiveService(label);
              document
                .getElementById("Works")
                ?.scrollIntoView({ behavior: "smooth", block: "start" });
            }}
            aria-pressed={activeService === label}
            aria-current={activeService === label ? "true" : undefined}
            data-active={activeService === label ? "true" : "false"}
          >
            {label}
          </Button>
        ))}
      </div>

      {/* Grelha de trabalhos */}
      {linhas.length > 0 ? (
        linhas.map((grupo, index) => (
          <div key={`${activeService}-row-${index}`} className={styles.jobs}>
            {grupo.map((trabalho, idx) => (
              <div
                key={`${activeService}-job-${index}-${idx}`}
                className={styles.job}
              >
                <div
                  className={styles.imageHoverCard}
                  style={{ "--photo-src": `url(${trabalho.foto || Hero})` }}
                >
                  <ProfessionalPhoto
                    ContainerImg={styles.myImageContainer}
                    imageClass={styles.myImage}
                    src={trabalho.foto || Hero}
                    alt={trabalho.titulo}
                  />
                  <div className={styles.imageOverlay}>
                    <h3 className={styles.overlayTitle}>{trabalho.titulo}</h3>
                    <p className={styles.overlayLegend}>{trabalho.descricao}</p>
                  </div>
                </div>
              </div>
            ))}
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

      <Quote variante="default">
        “Cada trabalho é uma obra de arte única, criada especialmente para
        realçar a beleza natural de cada cliente.”
      </Quote>
    </div>
  );
};

export default Portfolio;
