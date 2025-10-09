// src/widgets/space/ui/space.jsx
import styles from "./space.module.css";

import Subtitle from "@shared/ui/subtitle/subtitle.jsx";
import Title from "@shared/ui/title/title.jsx";
import Text from "@shared/ui/text/text.jsx";
import Quote from "@shared/ui/quote/quote.jsx";
import StatCard from "@shared/ui/statCard/statCard.jsx";

import FacilityCard from "@widgets/space/parts/facilityCard/facilityCard.jsx";

// Slots de media
import {
  Images as RawImages,
  Videos as RawVideos,
} from "@content/gallery/media.js";

// 🔧 Adapter de chaves para manter o uso atual (Gabinete, Unhas, etc.)
const Images = {
  Gabinete: RawImages.treatmentRoom,
  Unhas: RawImages.nailsArea,
  Relax: RawImages.relaxLounge,
  Avancada: RawImages.advancedRoom,
  Styling: RawImages.stylingArea,
  Lavagem: RawImages.washStation,
};
const Videos = {
  Momentos: RawVideos.moments,
};

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

      {/* ÁREAS DE RELAX */}
      <div className={styles.relax}>
        <FacilityCard
          variant="variant2"
          title="ESTÉTICA"
          subtitle="Sala de Estética"
          description="Estética e Bem Estar"
          subtitle1="Estética"
          description1="Privacidade e serenidade."
          imageSrc={Images.Gabinete}
        />
        <FacilityCard
          variant="variant2"
          title="Unhas"
          subtitle="Mesa de Unhas"
          description="Arte e Precisão"
          subtitle1="Estação de Unhas"
          description1="Detalhes que fazem a diferença."
          imageSrc={Images.Unhas}
        />
        <FacilityCard
          variant="variant2"
          title="Relax"
          subtitle="Zona de Espera"
          description="Momentos de Pausa"
          subtitle1="Área de Relaxamento"
          description1="Conforto enquanto aguarda."
          imageSrc={Images.Relax}
        />
        <FacilityCard
          variant="variant2"
          title="ESTÉTICA"
          subtitle="Sala de Estética Avançada"
          description="Tratamentos Avançados"
          subtitle1="Estética Avançada"
          description1="Tecnologia de Precisão"
          imageSrc={Images.Avancada}
        />
      </div>

      {/* STYLING E LAVAGEM */}
      <div className={styles.styling}>
        <FacilityCard
          variant="variant1"
          title="STYLING"
          subtitle="Zona de Styling"
          description="Transformação"
          subtitle1="Cadeiras Styling"
          description1="Conforto durante a sua transformação."
          imageSrc={Images.Styling}
        />
        <FacilityCard
          variant="variant1"
          title="LAVAGEM"
          subtitle="Zona de Lavagem"
          description="Ritual de Cuidado Capilar"
          subtitle1="Lavagem Relaxante"
          description1="Cadeiras ergonómicas para uma experiência única de cuidado capilar."
          imageSrc={Images.Lavagem}
        />
      </div>

      {/* VÍDEO */}
      <div className={styles.video}>
        <FacilityCard
          variant="variant1"
          title="EM AÇÃO"
          subtitle1="Bastidores da Beleza"
          description1="Instantes autênticos que revelam a dedicação, o cuidado e a paixão por trás de cada transformação."
          videoSrc={Videos.Momentos}
        />
      </div>

      {/* FILOSOFIA */}
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
