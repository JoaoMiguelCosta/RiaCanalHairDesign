import styles from "./space.module.css";

import Subtitle from "@shared/ui/subtitle/subtitle.jsx";
import Title from "@shared/ui/title/title.jsx";
import Text from "@shared/ui/text/text.jsx";
import Quote from "@shared/ui/quote/quote.jsx";
import StatCard from "@shared/ui/statCard/statCard.jsx";

import FacilityCard from "@widgets/space/parts/facilityCard/facilityCard.jsx";

// Media indexada pelas keys usadas em space.json (imageKey / videoKey)
import {
  Images,
  Videos,
  VideoBlurs,
  VideoPosters,
} from "@content/gallery/media.js";

import data from "@content/space/space.json";

// 🔎 Alt curto e descritivo (A11y)
const ALT_BY_KEY = {
  treatmentRoom: "Sala de Estética",
  nailsArea: "Mesa de Unhas",
  relaxLounge: "Zona de Espera",
  advancedRoom: "Sala de Estética Avançada",
  stylingArea: "Zona de Styling",
  washStation: "Zona de Lavagem",
};

// Cartão de imagem (grelhas Relax e Styling)
const ImageCardSlot = ({ card }) => (
  <div
    className={`${styles.fcVars} ${
      card.imageKey || card.videoKey ? styles.tallerMobile : ""
    }`}
  >
    <FacilityCard
      {...card}
      imageSrc={Images[card.imageKey]}
      imageAlt={
        ALT_BY_KEY[card.imageKey] || card.subtitle || card.title || "Área do salão"
      }
      imgLoading="lazy"
      imgDecoding="async"
      showHint={false}
    />
  </div>
);

const Space = () => {
  const {
    subtitle,
    title1,
    intro,
    relaxCards = [],
    stylingCards = [],
    videoCard,
    philosophy,
  } = data ?? {};

  return (
    <section id="Space" className={styles.space} aria-labelledby="Space-title">
      <Subtitle variant="highlight">{subtitle}</Subtitle>
      <Title
        id="Space-title"
        className={styles.customTitle}
        line1={title1}
        variant="default"
      />
      <Text className={styles.aboutText} variant="highlight">
        <span>{intro}</span>
      </Text>

      {/* ===== ÁREAS DE RELAX ===== */}
      <div className={styles.relax}>
        {relaxCards.map((c, idx) => (
          <ImageCardSlot key={`${c.title}-${c.subtitle}-${idx}`} card={c} />
        ))}
      </div>

      {/* ===== STYLING E LAVAGEM ===== */}
      <div className={styles.styling}>
        {stylingCards.map((c, idx) => (
          <ImageCardSlot key={`${c.title}-${c.subtitle}-${idx}`} card={c} />
        ))}
      </div>

      {/* ===== VÍDEO ===== */}
      <div className={styles.video}>
        {videoCard && (
          <div className={`${styles.fcVars} ${styles.tallerMobile}`}>
            <FacilityCard
              {...videoCard}
              videoSrc={Videos[videoCard.videoKey]}
              videoBlurSrc={VideoBlurs[videoCard.videoKey]}
              poster={VideoPosters[videoCard.videoKey]}
              showHint={false}
            />
          </div>
        )}
      </div>

      {/* ===== FILOSOFIA ===== */}
      {philosophy && (
        <div className={styles.filosofy}>
          <div className={styles.filosofy1}>
            <div className={styles.filosofy11}>
              {/* Subsecção de "O Espaço" */}
              <Title
                as="h3"
                className={styles.customTitle1}
                line1={philosophy.title}
                variant="default"
              />
              {philosophy.paragraphs?.map((p, i) => (
                <Text key={i} className={styles.aboutText1} variant="highlight">
                  <span>{p}</span>
                </Text>
              ))}
            </div>
            <div className={styles.filosofy12}>
              {philosophy.stats?.map(({ number, label }) => (
                <StatCard key={label} number={number} label={label} />
              ))}
            </div>
          </div>
          <Quote variant="default">"{philosophy.quote}"</Quote>
        </div>
      )}
    </section>
  );
};

export default Space;
