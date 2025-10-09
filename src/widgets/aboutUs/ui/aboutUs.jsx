import styles from "./aboutUs.module.css";

import { useMemo } from "react";
import Title from "@shared/ui/title/title.jsx";
import Text from "@shared/ui/text/text.jsx";
import Quote from "@shared/ui/quote/quote.jsx";
import StatCard from "@shared/ui/statCard/statCard.jsx";
import TitleCaption from "@shared/ui/titleCaption/titleCaption.jsx";
import ProfessionalPhoto from "@shared/ui/professionalPhoto/professionalPhoto.jsx";

import InfoCard from "@widgets/aboutUs/parts/infoCard/infoCard.jsx";

// conteúdo editorial
import { title, copy, quote, caption, stats, pillars } from "@content/aboutUs";

// imagens (equivalentes às antigas Entrada.jpg / Entrada2.jpg)
import Entrada from "@media/entrance/entranceExterior.jpg";
import entrada2 from "@media/entrance/entranceInterior.jpg";

// lógica
import useRotatingImage from "@widgets/aboutUs/hooks/useRotatingImage.js";

const AboutUs = () => {
  // memo para evitar recriar o array a cada render
  const images = useMemo(() => [Entrada, entrada2], []);

  const currentImage = useRotatingImage(images, 3000);

  return (
    <div id="AboutUs" className={styles.aboutus}>
      <div className={styles.aboutus1}>
        <div className={styles.aboutleft}>
          <Title
            line1={title.line1}
            line2={title.line2}
            variant={title.variant}
          />

          {copy.map((paragraph, i) => (
            <Text key={i} className={styles.aboutText} variant="highlight">
              {paragraph}
            </Text>
          ))}

          <Quote variant="highlight">{quote}</Quote>

          <div className={styles.statCards}>
            {stats.map((s) => (
              <StatCard key={s.label} number={s.number} label={s.label} />
            ))}
          </div>
        </div>

        <div className={styles.aboutright}>
          <div className={styles.aboutright1}>
            <ProfessionalPhoto
              ContainerImg={styles.myImageContainer}
              imageClass={styles.myImage}
              src={currentImage}
              alt="Entrada do Salão"
            />
            <TitleCaption
              caption={caption}
              className={styles.customCaptionContainer}
            />
          </div>
        </div>
      </div>

      <div className={styles.aboutus2}>
        {pillars.map((p) => (
          <InfoCard key={p.title} title={p.title}>
            {p.body}
          </InfoCard>
        ))}
      </div>
    </div>
  );
};

export default AboutUs;
