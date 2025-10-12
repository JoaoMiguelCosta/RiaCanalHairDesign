// src/widgets/portfolio/ui/portfolio.jsx
import styles from "./portfolio.module.css";

import Subtitle from "../../../shared/ui/subtitle/subtitle.jsx";
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
              onClick={() => selectServiceAndScroll(label)}
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
                    loading="lazy"
                    decoding="async"
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

      <Quote variante="default">“{data.quote}”</Quote>
    </div>
  );
};

export default Portfolio;
