// src/widgets/instagram/ui/instagram.jsx
import styles from "./instagram.module.css";

import Subtitle from "@shared/ui/subtitle/subtitle.jsx";
import Title from "@shared/ui/title/title.jsx";
import Text from "@shared/ui/text/text.jsx";
import Button from "@shared/ui/button/button.jsx";
import StatCard from "@shared/ui/statCard/statCard.jsx";
import Quote from "@shared/ui/quote/quote.jsx";

import data from "@content/instagram/instagram.json";

const Instagram = () => {
  const { url, handle, stats = [], hashtags = [], quote } = data ?? {};

  return (
    <section
      id="Instagram"
      className={styles.instagram}
      aria-labelledby="Instagram-title"
    >
      <Subtitle variant="default">REDES SOCIAIS</Subtitle>
      <Title
        id="Instagram-title"
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
        {/* Navegação externa: <a> nativo (o Button renderiza <a> com href e
            reforça rel="noopener noreferrer" em target=_blank) */}
        <Button
          className={styles.instagramButton}
          href={url}
          target="_blank"
          aria-label="Abrir Instagram: perfil @ria_canal_hairdesign"
        >
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
          {/* Navegação externa: link nativo; o nome acessível é o texto visível */}
          <Button
            className={styles.instagramFollowButton}
            href={url}
            target="_blank"
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

      <Quote variant="default">"{quote}"</Quote>
    </section>
  );
};

export default Instagram;
