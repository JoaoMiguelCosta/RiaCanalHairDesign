import { useState, useMemo, useEffect } from "react";
import styles from "./Portfolio.module.css";
import Subtitle from "../../components/Subtitle/Subtitle";
import Title from "../../components/Title/Title";
import Text from "../../components/Text/Text";
import Button from "../../components/Button/Button";
import ProfessionalPhoto from "../../components/ProfessionalPhoto/ProfessionalPhoto";
import FotoVanesa from "../../assets/TeamandServices/FotoVanessa.jpg";
import Quote from "../../components/Quote/Quote";
import {
  services, // ["Cabeleireiro", "Estética", "Unhas"]
  worksHair,
  worksEstetica,
  worksUnhas,
} from "../../data/ServicesData";

// util: agrupa em linhas de 3 cards
const chunk = (arr, size) =>
  arr.reduce(
    (acc, _, i) => (i % size === 0 ? [...acc, arr.slice(i, i + size)] : acc),
    []
  );

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

  // 3) 🔥 REMOVIDO — não atualizamos mais a query/hash automaticamente

  // 4) ouve o evento vindo do TeamAndServices e ativa a tab correta + scroll
  useEffect(() => {
    const handler = (e) => {
      const service = e.detail;
      if (!services.includes(service)) return;

      setActiveService(service); // ativa a aba recebida

      // scroll suave até a grelha
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
  const linhas = chunk(works, 3);

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
                <div className={styles.imageHoverCard}>
                  <ProfessionalPhoto
                    ContainerImg={styles.myImageContainer}
                    imageClass={styles.myImage}
                    src={FotoVanesa}
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
