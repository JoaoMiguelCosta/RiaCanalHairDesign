import styles from "./AboutUs.module.css";
import Title from "../../components/Title/Title";
import Text from "../../components/Text/Text";
import Quote from "../../components/Quote/Quote";
import StatCard from "../../components/StatCard/StatCard";
import TitleCaption from "../../components/TitleCaption/TitleCaption";
import InfoCard from "./InfoCard/InfoCard";
import ProfessionalPhoto from "../../components/ProfessionalPhoto/ProfessionalPhoto";
import FotoVanesa from "../../assets/TeamandServices/FotoVanessa.jpg";

const AboutUs = () => (
  <div id="AboutUs" className={styles.aboutus}>
    <div className={styles.aboutus1}>
      <div className={styles.aboutleft}>
        <Title line1="Quem" line2="Somos" variant="default" />
        <Text className={styles.aboutText} variant="highlight">
          Somos um espaço de beleza e identidade no coração de Aveiro. No Ria
          Canal Hair Design, acreditamos que cada mulher merece sentir-se única,
          confiante e elegante.
        </Text>
        <Text className={styles.aboutText} variant="highlight">
          A nossa equipa combina experiência, paixão e atenção ao detalhe para
          criar resultados personalizados e naturais. Mais do que um salão,
          somos uma extensão da sua expressão.
        </Text>
        <Quote variant="highlight">
          A beleza começa no momento em que decides ser tu mesma.
        </Quote>
        <div className={styles.statCards}>
          <StatCard number="30+" label="Anos de Experiência" />
          <StatCard number="100%" label="Personalizado" />
        </div>
      </div>

      <div className={styles.aboutright}>
        <div className={styles.aboutright1}>
          <ProfessionalPhoto
            ContainerImg={styles.myImageContainer}
            imageClass={styles.myImage}
            src={FotoVanesa}
            alt="Entrada do Salão"
          />

          <TitleCaption
            caption='"Um ambiente pensado para a sua experiência única"'
            className={styles.customCaptionContainer}
          />
        </div>
      </div>
    </div>

    <div className={styles.aboutus2}>
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

export default AboutUs;
