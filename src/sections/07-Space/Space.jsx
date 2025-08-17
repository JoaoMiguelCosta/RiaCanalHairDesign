import styles from "./Space.module.css"; // ajusta o caminho para o teu ficheiro CSS
import Subtitle from "../../components/Subtitle/Subtitle";
import Title from "../../components/Title/Title";
import Text from "../../components/Text/Text";
import FacilityCard from "./FacilityCard/FacilityCard";
import FotoVanessa from "../../assets/TeamandServices/FotoVanessa.jpg";
import Momentos from "../../assets/Videos/Momentos.mp4";
import Quote from "../../components/Quote/Quote.jsx";
import StatCard from "../../components/StatCard/StatCard.jsx";

const Space = () => {
  return (
    <div id="Space" className={styles.space}>
      <Subtitle variant="highlight">NOSSO AMBIENTE</Subtitle>
      <Title
        className={styles.customTitle}
        line1="O Espaço"
        variant="default"
      />
      <Text className={styles.aboutText} variant="highlight">
        <span>
          Um ambiente criado para refletir a beleza em todas as formas — luz
          natural, texturas suaves e uma atmosfera pensada para o seu bem-estar.
          Aqui, cada detalhe convida à tranquilidade e ao cuidado.
        </span>
      </Text>
      <div className={styles.rececao}>
        <FacilityCard
          variant="variant1"
          title="RECEÇÃO"
          subtitle="Receção Elegante"
          description="Primeiro Contacto Acolhedor"
          subtitle1="Receção Elegante"
          description1="O primeiro momento do seu cuidado pessoal começa aqui, num ambiente pensado para o acolher."
          imageSrc={FotoVanessa}
        />
      </div>
      <div className={styles.relax}>
        <FacilityCard
          variant="variant2"
          title="ESTÉTICA"
          subtitle="Sala de Estética"
          description="Cuidados Faciais"
          subtitle1="Estética Avançada"
          description1="Privacidade e serenidade."
          imageSrc={FotoVanessa}
        />
        <FacilityCard
          variant="variant2"
          title="Unhas"
          subtitle="Mesa de Unhas"
          description="Arte e Precisão"
          subtitle1="Estação de Unhas"
          description1="Detalhes que fazem a diferença."
          imageSrc={FotoVanessa}
        />
        <FacilityCard
          variant="variant2"
          title="Relax"
          subtitle="Zona de Espera"
          description="Momentos de Pausa"
          subtitle1="Área de Relaxamento"
          description1="Conforto enquanto aguarda."
          imageSrc={FotoVanessa}
        />
      </div>
      <div className={styles.styling}>
        <FacilityCard
          variant="variant2"
          title="STYLING"
          subtitle="Zona de Styling"
          description="Transformação"
          subtitle1="Cadeiras Styling"
          description1="Conforto durante a sua transformação."
          imageSrc={FotoVanessa}
        />
        <FacilityCard
          variant="variant3"
          title="LAVAGEM"
          subtitle="Zona de Lavagem"
          description="Ritual de Cuidado Capilar"
          subtitle1="Lavagem Relaxante"
          description1="Cadeiras ergonómicas e produtos premium para uma experiência única de cuidado capilar."
          imageSrc={FotoVanessa}
        />
      </div>
      <div className={styles.video}>
        <FacilityCard
          variant="variant1"
          title="EM AÇÃO"
          subtitle1="Bastidores da Beleza"
          description1="Instantes autênticos que revelam a dedicação, o cuidado e a paixão por trás de cada transformação."
          videoSrc={Momentos}
        />
      </div>
      <div className={styles.filosofy}>
        <div className={styles.filosofy1}>
          <div className={styles.filosofy11}>
            <Title
              className={styles.customTitle1}
              line1="Filosofia do Espaço"
              variant="default"
            />
            <Text className={styles.aboutText1} variant="highlight">
              <span>
                Acreditamos que o ambiente é parte fundamental da experiência de
                beleza. Cada elemento foi cuidadosamente escolhido para criar
                harmonia entre funcionalidade e estética.
              </span>
            </Text>
            <Text className={styles.aboutText1} variant="highlight">
              <span>
                Luz natural, cores suaves e texturas que convidam ao toque criam
                um refúgio urbano onde pode desconectar do exterior e
                conectar-se consigo mesma.
              </span>
            </Text>
          </div>
          <div className={styles.filosofy12}>
            <StatCard number="6" label="Áreas Distintas" />
            <StatCard number="Premium" label="Equipamentos" />
            <StatCard number="Único" label="Design" />
          </div>
        </div>
        <Quote variante="default">
          "Mais do que um salão, criámos um santuário onde a beleza encontra o
          bem-estar, e cada visita se torna uma experiência memorável."
        </Quote>
      </div>
    </div>
  );
};

export default Space;
