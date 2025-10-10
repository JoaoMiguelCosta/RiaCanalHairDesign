// src/widgets/aboutUs/ui/aboutUs.jsx
import { memo } from "react";
import styles from "./aboutUs.module.css";

import Title from "@shared/ui/title/title.jsx";
import Text from "@shared/ui/text/text.jsx";
import Quote from "@shared/ui/quote/quote.jsx";
import StatCard from "@shared/ui/statCard/statCard.jsx";
import TitleCaption from "@shared/ui/titleCaption/titleCaption.jsx";
import ProfessionalPhoto from "@shared/ui/professionalPhoto/professionalPhoto.jsx";
import InfoCard from "@widgets/aboutUs/parts/infoCard/infoCard.jsx";
import { useRotatingImage } from "@widgets/aboutUs/hook/useRotatingImage";

import entranceExterior from "@media/entrance/entranceExterior.jpg";
import entranceInterior from "@media/entrance/entranceInterior.jpg";

const {
  aboutSection,
  topSection,
  leftColumn,
  bodyText,
  statsRow,
  rightColumn,
  rightInner,
  imageContainer,
  image,
  captionContainer,
  valuesSection,
} = styles;

const IMAGES = [entranceExterior, entranceInterior];

const AboutUs = () => {
  const { currentImage } = useRotatingImage(IMAGES, {
    intervalMs: 3000,
    startIndex: 0,
  });

  return (
    <div id="AboutUs" className={aboutSection}>
      <div className={topSection}>
        <div className={leftColumn}>
          <Title line1="Quem" line2="Somos" variant="default" />

          <Text className={bodyText} variant="highlight">
            Somos um espaço de beleza e identidade no coração de Aveiro. No Ria
            Canal Hair Design, acreditamos que cada mulher merece sentir-se
            única, confiante e elegante.
          </Text>

          <Text className={bodyText} variant="highlight">
            A nossa equipa combina experiência, paixão e atenção ao detalhe para
            criar resultados personalizados e naturais. Mais do que um salão,
            somos uma extensão da sua expressão.
          </Text>

          <Quote variant="highlight">
            A beleza começa no momento em que decides ser tu mesma.
          </Quote>

          <div className={statsRow}>
            <StatCard number="30+" label="Anos de Experiência" />
            <StatCard number="100%" label="Personalizado" />
          </div>
        </div>

        <div className={rightColumn}>
          <div className={rightInner}>
            <ProfessionalPhoto
              ContainerImg={imageContainer}
              imageClass={image}
              src={currentImage}
              alt="Entrada do Salão"
            />

            <TitleCaption
              caption='"Um ambiente pensado para a sua experiência única"'
              className={captionContainer}
            />
          </div>
        </div>
      </div>

      <div className={valuesSection}>
        <InfoCard title="Missão">
          Realçar a beleza natural de cada cliente através de técnicas
          personalizadas e cuidado individualizado.
        </InfoCard>
        <InfoCard title="Visão">
          Ser reconhecidos como referência em hair design em Aveiro, criando
          experiências memoráveis.
        </InfoCard>
        <InfoCard title="Valores">
          Autenticidade, excelência, personalização e respeito pela
          individualidade de cada mulher.
        </InfoCard>
      </div>
    </div>
  );
};

export default memo(AboutUs);
