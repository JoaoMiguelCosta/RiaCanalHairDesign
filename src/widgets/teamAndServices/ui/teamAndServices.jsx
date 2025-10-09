// src/widgets/teamAndServices/ui/teamAndServices.jsx
import styles from "./teamAndServices.module.css";

import Subtitle from "@shared/ui/subtitle/subtitle.jsx";
import Title from "@shared/ui/title/title.jsx";
import Text from "@shared/ui/text/text.jsx";
import ProfessionalPhoto from "@shared/ui/professionalPhoto/professionalPhoto.jsx";
import TitleDescription from "@shared/ui/titleDescription/titleDescription.jsx";
import Button from "@shared/ui/button/button.jsx";
import TitleServices from "@widgets/teamAndServices/parts/titleServices/titleServices.jsx";
import ServiceItem from "@shared/ui/serviceItem/serviceItem.jsx";
import servicesData from "@content/services/services.js";
import Quote from "@shared/ui/quote/quote.jsx";

// ⬇️ Importa sempre como TeamMembers
import TeamMembers from "@content/teamMembers/teamMembers.js";
import Hero from "@media/hero/hero.png";

const TeamAndServices = () => {
  const getPhoto = (photo) => photo || Hero;

  // dispara um evento global e rola até a secção do portfólio
  const goToPortfolio = (service) => {
    window.dispatchEvent(
      new CustomEvent("activate-portfolio-service", { detail: service })
    );
    try {
      const id = "Works";
      const el = document.getElementById(id);
      if (el) {
        if (location.hash !== `#${id}`)
          history.replaceState(null, "", `#${id}`);
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    } catch {}
  };

  return (
    <div id="TeamAndServices" className={styles.teamandservices}>
      <Subtitle>A NOSSA EQUIPA</Subtitle>
      <Title line1="Equipa &" line2="Serviços" variant="highlight" />
      <Text className={styles.aboutText} variant="centerMobile">
        <span>
          Profissionais especializadas, dedicadas a realçar a sua beleza natural
          com técnicas personalizadas e cuidado individualizado.
        </span>
      </Text>

      {/* Cabeleireiras */}
      <div className={styles.HairDressers}>
        {TeamMembers.hairdressers.map(({ name, legend, legend1, photo }, i) => (
          <div className={styles.HairDressersingle} key={name + i}>
            <ProfessionalPhoto
              ContainerImg={styles.myImageContainer}
              imageClass={styles.myImage}
              src={getPhoto(photo)}
              alt={`Foto ${name}`}
            />
            <TitleDescription title={name} legend={legend} legend1={legend1} />
          </div>
        ))}
      </div>

      {/* Botão -> Cabeleireiro */}
      <div className={styles.HairdresserBottom}>
        <Button
          onClick={() => goToPortfolio("Cabeleireiro")}
          button={styles.button}
        >
          VER PORTFÓLIO
        </Button>
      </div>

      {/* Serviços Cabeleireiro */}
      <div className={styles.HairdresserTitle}>
        <TitleServices>Serviços</TitleServices>
        <div className={styles.HairdresserServices}>
          {servicesData.hair.map((label) => (
            <ServiceItem key={label} label={label} />
          ))}
        </div>
      </div>

      {/* Sabrina -> Estética */}
      <div className={styles.others}>
        <div className={styles.others1}>
          <ProfessionalPhoto
            ContainerImg={styles.myImageContainer}
            imageClass={styles.myImage}
            src={getPhoto(TeamMembers.sabrina.photo)}
            alt={`Foto ${TeamMembers.sabrina.name}`}
          />
          <TitleDescription
            title={TeamMembers.sabrina.name}
            legend={TeamMembers.sabrina.legend}
          />
        </div>
        <div className={styles.others2}>
          <Button
            onClick={() => goToPortfolio("Estética")}
            button={styles.button}
          >
            VER PORTFÓLIO
          </Button>
          <TitleServices variant="highlight">Serviços</TitleServices>
          <div className={`${styles.EsteticaAdvanced} ${styles.isSabrina}`}>
            {servicesData.estetica.map((label) => (
              <ServiceItem key={label} label={label} />
            ))}
          </div>
        </div>
      </div>

      {/* Mary -> Unhas (invertida) */}
      <div className={styles.others}>
        <div className={styles.others2}>
          <Button onClick={() => goToPortfolio("Unhas")} button={styles.button}>
            VER PORTFÓLIO
          </Button>
          <TitleServices variant="highlight">Serviços</TitleServices>
          <div className={`${styles.EsteticaAdvanced} ${styles.isMary}`}>
            {servicesData.mary.map((label) => (
              <ServiceItem key={label} label={label} />
            ))}
          </div>
        </div>
        <div className={styles.others1}>
          <ProfessionalPhoto
            ContainerImg={styles.myImageContainer}
            imageClass={styles.myImage}
            src={getPhoto(TeamMembers.mary.photo)}
            alt={`Foto ${TeamMembers.mary.name}`}
          />
          <TitleDescription
            title={TeamMembers.mary.name}
            legend={TeamMembers.mary.legend}
          />
        </div>
      </div>

      <Quote variante="default">
        “Cada profissional da nossa equipa é escolhida pela sua paixão, técnica
        e dedicação em criar experiências únicas para cada cliente.”
      </Quote>
    </div>
  );
};

export default TeamAndServices;
