// src/widgets/instagram/ui/instagram.jsx
import styles from "./instagram.module.css";

import Subtitle from "@shared/ui/subtitle/subtitle.jsx";
import Title from "@shared/ui/title/title.jsx";
import Text from "@shared/ui/text/text.jsx";
import Button from "@shared/ui/button/button.jsx";
import StatCard from "@shared/ui/statCard/statCard.jsx";
import Quote from "@shared/ui/quote/quote.jsx";

import data from "@content/instagram/instagram.json";
import { useInstagramOpen } from "@widgets/instagram/hook/useInstagram";

const Instagram = () => {
  const { url, handle, stats = [], hashtags = [], quote } = data ?? {};
  const handleInstagramClick = useInstagramOpen(url);

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
          {handle}
        </Button>

        <div className={styles.detalhes}>
          {stats.map(({ number, label }) => (
            <StatCard
              key={`${label}-${number}`}
              number={number}
              label={label}
              orange
            />
          ))}
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
        {hashtags.map((tag) => (
          <span key={tag}>{tag}</span>
        ))}
      </div>

      <Quote variante="default">"{quote}"</Quote>
    </div>
  );
};

export default Instagram;
