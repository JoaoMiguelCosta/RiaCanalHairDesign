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

import data from "@content/space/space.json";

// 🔧 Adapter: mapeia keys do content -> assets reais
const IMAGE_BY_KEY = {
  treatmentRoom: RawImages.treatmentRoom,
  nailsArea: RawImages.nailsArea,
  relaxLounge: RawImages.relaxLounge,
  advancedRoom: RawImages.advancedRoom,
  stylingArea: RawImages.stylingArea,
  washStation: RawImages.washStation,
};

const VIDEO_BY_KEY = {
  moments: RawVideos.moments,
};

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
    <div id="Space" className={styles.space}>
      <Subtitle variant="highlight">{subtitle}</Subtitle>
      <Title className={styles.customTitle} line1={title1} variant="default" />
      <Text className={styles.aboutText} variant="highlight">
        <span>{intro}</span>
      </Text>

      {/* ÁREAS DE RELAX */}
      <div className={styles.relax}>
        {relaxCards.map((c, idx) => (
          <FacilityCard
            key={`${c.title}-${c.subtitle}-${idx}`}
            {...c}
            imageSrc={IMAGE_BY_KEY[c.imageKey]}
          />
        ))}
      </div>

      {/* STYLING E LAVAGEM */}
      <div className={styles.styling}>
        {stylingCards.map((c, idx) => (
          <FacilityCard
            key={`${c.title}-${c.subtitle}-${idx}`}
            {...c}
            imageSrc={IMAGE_BY_KEY[c.imageKey]}
          />
        ))}
      </div>

      {/* VÍDEO */}
      <div className={styles.video}>
        {videoCard && (
          <FacilityCard
            {...videoCard}
            videoSrc={VIDEO_BY_KEY[videoCard.videoKey]}
          />
        )}
      </div>

      {/* FILOSOFIA */}
      {philosophy && (
        <div className={styles.filosofy}>
          <div className={styles.filosofy1}>
            <div className={styles.filosofy11}>
              <Title
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
          <Quote variante="default">"{philosophy.quote}"</Quote>
        </div>
      )}
    </div>
  );
};

export default Space;
