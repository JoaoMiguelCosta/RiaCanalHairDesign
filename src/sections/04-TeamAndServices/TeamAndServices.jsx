import styles from "./TeamAndServices.module.css";
import Subtitle from "../../components/Subtitle/Subtitle";
import Title from "../../components/Title/Title";
import Text from "../../components/Text/Text";
import ProfessionalPhoto from "../../components/ProfessionalPhoto/ProfessionalPhoto";
import TitleDescription from "../../components/TitleDescription/TitleDescription.jsx";
import FotoVanessa from "../../assets/TeamandServices/FotoVanessa.jpg";
import Button from "../../components/Button/Button.jsx";
import TitleServices from "./TitleServices/TitleServices.jsx";
import ServiceItem from "../../components/ServiceItem/ServiceItem.jsx";
import servicesData from "../../data/ServicesData.js";
import Quote from "../../components/Quote/Quote.jsx";

const TeamAndServices = () => {
  // dispara um evento global e rola até a secção do portfólio
  const goToPortfolio = (service) => {
    // avisa o componente Portfolio qual serviço deve ativar
    window.dispatchEvent(
      new CustomEvent("activate-portfolio-service", { detail: service })
    );

    // opcional: atualiza a hash e faz scroll suave
    try {
      const id = "Works";
      const el = document.getElementById(id);
      if (el) {
        // mantém #Works na URL (sem recarregar)
        if (location.hash !== `#${id}`) {
          history.replaceState(null, "", `#${id}`);
        }
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    } catch (_) {}
  };

  const hairdressers = [
    {
      name: "Vanessa Ribeiro",
      legend: "Cabeleireira",
      legend1: "Especializada",
      photo: FotoVanessa,
    },
    {
      name: "Cristina Maria",
      legend: "Cabeleireira",
      legend1: "Especializada",
      photo: FotoVanessa,
    },
    {
      name: "Fernanda Gonzalez",
      legend: "Cabeleireira",
      legend1: "Especializada",
      photo: FotoVanessa,
    },
  ];

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

      <div className={styles.HairDressers}>
        {hairdressers.map(({ name, legend, legend1, photo }, i) => (
          <div className={styles.HairDressersingle} key={name + i}>
            <ProfessionalPhoto
              ContainerImg={styles.myImageContainer}
              imageClass={styles.myImage}
              src={photo}
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
            src={FotoVanessa}
            alt="Foto Sabrina"
          />
          <TitleDescription
            title="Sabrina Mara"
            legend="Estética Avançada & Depilação"
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

      {/* Elisa -> Estética */}
      <div className={`${styles.others} ${styles.isElisaContainer}`}>
        <div className={styles.others2}>
          <Button
            onClick={() => goToPortfolio("Estética")}
            button={styles.button}
          >
            VER PORTFÓLIO
          </Button>
          <TitleServices variant="highlight">Serviços</TitleServices>
          <div className={`${styles.EsteticaAdvanced} ${styles.isElisa}`}>
            {servicesData.elisa.map((label) => (
              <ServiceItem key={label} label={label} />
            ))}
          </div>
        </div>
        <div className={styles.others1}>
          <ProfessionalPhoto
            ContainerImg={styles.myImageContainer}
            imageClass={styles.myImage}
            src={FotoVanessa}
            alt="Foto Elisa"
          />
          <TitleDescription title="Elisa" legend="Estética & Depilação" />
        </div>
      </div>

      {/* Mary -> Unhas */}
      <div className={styles.others}>
        <div className={styles.others1}>
          <ProfessionalPhoto
            ContainerImg={styles.myImageContainer}
            imageClass={styles.myImage}
            src={FotoVanessa}
            alt="Foto Mary"
          />
          <TitleDescription title="Mary" legend="Unhas" />
        </div>
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
      </div>

      <Quote variante="default">
        “Cada profissional da nossa equipa é escolhida pela sua paixão, técnica
        e dedicação em criar experiências únicas para cada cliente.”
      </Quote>
    </div>
  );
};

export default TeamAndServices;
