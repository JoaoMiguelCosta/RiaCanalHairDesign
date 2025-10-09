// src/widgets/instagram/ui/instagram.jsx
import styles from "./instagram.module.css";

import Subtitle from "@shared/ui/subtitle/subtitle.jsx";
import Title from "@shared/ui/title/title.jsx";
import Text from "@shared/ui/text/text.jsx";
import Button from "@shared/ui/button/button.jsx";
import StatCard from "@shared/ui/statCard/statCard.jsx";
import Quote from "@shared/ui/quote/quote.jsx";

const Instagram = () => {
  const handleInstagramClick = () => {
    window.open("https://www.instagram.com/ria_canal_hairdesign/", "_blank");
  };

  return (
    <div id="Instagram" className={styles.instagram}>
      <Subtitle variant="default">REDES SOCIAIS</Subtitle>
      <Title
        className={styles.customTitle}
        line2="No Instagram"
        variant="highlight"
      />
      <Text className={styles.aboutText} variant="centerMobile">
        <span>
          Siga-nos para ver o nosso dia a dia, bastidores, transformações e
          inspiração real.
        </span>
      </Text>

      <div className={styles.buttoninsta}>
        <Button button={styles.instagramButton} onClick={handleInstagramClick}>
          @ria_canal_hairdesign
        </Button>

        <div className={styles.detalhes}>
          <StatCard number="150+" label="POSTS" orange />
          <StatCard number="500+" label="SEGUIDORES" orange />
          <StatCard number="Weekly" label="UPDATES" orange />
        </div>

        <div className={styles.seguir}>
          <Button
            button={styles.instagramFollowButton}
            onClick={handleInstagramClick}
          >
            SEGUIR NO INSTAGRAM
          </Button>
        </div>
      </div>

      <div className={styles.hashtags}>
        <span>#RiaCanalHairDesign</span>
        <span>#AveiroHair</span>
        <span>#HairTransformation</span>
        <span>#HairArt</span>
        <span>#Balayage</span>
        <span>#BeautyAveiro</span>
      </div>

      <Quote variante="default">
        "Cada post é uma janela para o nosso mundo de beleza, criatividade e a
        paixão que colocamos em cada transformação."
      </Quote>
    </div>
  );
};

export default Instagram;
