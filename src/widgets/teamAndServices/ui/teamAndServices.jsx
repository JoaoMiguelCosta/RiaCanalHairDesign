// src/widgets/teamAndServices/ui/teamAndServices.jsx
import { memo } from "react";
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

// ⬇️ Hook extraído
import { useGoToPortfolio } from "@widgets/teamAndServices/hook/useGoToPortfolio";

const {
  teamandservices,
  aboutText,
  HairDressers,
  HairDressersingle,
  myImageContainer,
  myImage,
  HairdresserBottom,
  button: buttonCls,
  HairdresserTitle,
  HairdresserServices,
  others,
  others1,
  others2,
  EsteticaAdvanced,
  isSabrina,
  isMary,
} = styles;

const getPhoto = (photo) => photo || Hero;

// itens de serviço em grade (mantém markup)
const ServicesList = ({ items, className }) => (
  <div className={className}>
    {items.map((label) => (
      <ServiceItem key={label} label={label} />
    ))}
  </div>
);

// bloco de pessoa (foto + títulos)
const PersonBlock = ({ name, legend, legend1, photo }) => (
  <>
    <ProfessionalPhoto
      ContainerImg={myImageContainer}
      imageClass={myImage}
      src={getPhoto(photo)}
      alt={`Foto ${name}`}
    />
    <TitleDescription title={name} legend={legend} legend1={legend1} />
  </>
);

// secção “others” reutilizável (ordem controlada para manter o mesmo layout)
const OthersSection = ({
  person,
  services,
  servicesModClass, // isSabrina | isMary
  portfolioKey, // "Estética" | "Unhas"
  inverted = false, // Mary é invertida
  onPortfolio,
}) => (
  <div className={others}>
    {inverted ? (
      <>
        <div className={others2}>
          <Button onClick={() => onPortfolio(portfolioKey)} button={buttonCls}>
            VER PORTFÓLIO
          </Button>
          <TitleServices variant="highlight">Serviços</TitleServices>
          <ServicesList
            items={services}
            className={`${EsteticaAdvanced} ${servicesModClass}`}
          />
        </div>
        <div className={others1}>
          <PersonBlock
            name={person.name}
            legend={person.legend}
            legend1={person.legend1}
            photo={person.photo}
          />
        </div>
      </>
    ) : (
      <>
        <div className={others1}>
          <PersonBlock
            name={person.name}
            legend={person.legend}
            legend1={person.legend1}
            photo={person.photo}
          />
        </div>
        <div className={others2}>
          <Button onClick={() => onPortfolio(portfolioKey)} button={buttonCls}>
            VER PORTFÓLIO
          </Button>
          <TitleServices variant="highlight">Serviços</TitleServices>
          <ServicesList
            items={services}
            className={`${EsteticaAdvanced} ${servicesModClass}`}
          />
        </div>
      </>
    )}
  </div>
);

const TeamAndServices = () => {
  const goToPortfolio = useGoToPortfolio();

  return (
    <div id="TeamAndServices" className={teamandservices}>
      <Subtitle>A NOSSA EQUIPA</Subtitle>
      <Title line1="Equipa &" line2="Serviços" variant="highlight" />
      <Text className={aboutText} variant="centerMobile">
        <span>
          Profissionais especializadas, dedicadas a realçar a sua beleza natural
          com técnicas personalizadas e cuidado individualizado.
        </span>
      </Text>

      {/* Cabeleireiras */}
      <div className={HairDressers}>
        {TeamMembers.hairdressers.map(({ name, legend, legend1, photo }, i) => (
          <div className={HairDressersingle} key={name + i}>
            <ProfessionalPhoto
              ContainerImg={myImageContainer}
              imageClass={myImage}
              src={getPhoto(photo)}
              alt={`Foto ${name}`}
            />
            <TitleDescription title={name} legend={legend} legend1={legend1} />
          </div>
        ))}
      </div>

      {/* Botão -> Cabeleireiro */}
      <div className={HairdresserBottom}>
        <Button
          onClick={() => goToPortfolio("Cabeleireiro")}
          button={buttonCls}
        >
          VER PORTFÓLIO
        </Button>
      </div>

      {/* Serviços Cabeleireiro */}
      <div className={HairdresserTitle}>
        <TitleServices>Serviços</TitleServices>
        <ServicesList
          items={servicesData.hair}
          className={HairdresserServices}
        />
      </div>

      {/* Sabrina -> Estética */}
      <OthersSection
        person={TeamMembers.sabrina}
        services={servicesData.estetica}
        servicesModClass={isSabrina}
        portfolioKey="Estética"
        onPortfolio={goToPortfolio}
      />

      {/* Mary -> Unhas (invertida) */}
      <OthersSection
        person={TeamMembers.mary}
        services={servicesData.mary}
        servicesModClass={isMary}
        portfolioKey="Unhas"
        inverted
        onPortfolio={goToPortfolio}
      />

      <Quote variante="default">
        “Cada profissional da nossa equipa é escolhida pela sua paixão, técnica
        e dedicação em criar experiências únicas para cada cliente.”
      </Quote>
    </div>
  );
};

export default memo(TeamAndServices);
