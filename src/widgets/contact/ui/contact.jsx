// src/widgets/contact/ui/contact.jsx
import { memo } from "react";
import styles from "./contact.module.css";

import Subtitle from "@shared/ui/subtitle/subtitle.jsx";
import Title from "@shared/ui/title/title.jsx";
import Text from "@shared/ui/text/text.jsx";
import Quote from "@shared/ui/quote/quote.jsx";

import InformationCard from "@widgets/contact/parts/informationCard/informationCard.jsx";
import MetricCard from "@widgets/contact/parts/metricCard/metricCard.jsx";
import Arrive from "@widgets/contact/parts/arrive/arrive.jsx";
import MapEmbed from "@widgets/contact/parts/mapEmbed/mapEmbed.jsx";
import data from "@content/contact/contact.json";

// Desestrutura classes para cortar repetição de `styles.`
const {
  contact: contactCls,
  aboutText,
  CardsMetricMap: cardsMetricMap,
  MapArrive: mapArrive,
  Map: mapCls,
  CardsMetric: cardsMetric,
  Cards: cards,
  MetricCard: metricCardWrap,
} = styles;

// Props reutilizáveis para links externos
const EXT_PROPS = { target: "_blank", rel: "noreferrer" };

// Conteúdo de cada cartão a partir de contact.json (fonte única dos contactos)
const renderDescription = ({ type, phone, aria, url, label, text }) => {
  if (type === "phone") {
    return (
      <a href={`tel:${phone}`} aria-label={aria}>
        {label}
      </a>
    );
  }
  if (url) {
    return (
      <a href={url} {...EXT_PROPS}>
        {label}
      </a>
    );
  }
  return text;
};

// Ordem preservada (a do JSON)
const CONTACT_CARDS = data.cards.map((card) => ({
  Letra: card.letter,
  Title: card.title,
  Description: renderDescription(card),
  button: card.button && (
    <a href={card.button.url} {...EXT_PROPS}>
      {card.button.label}
    </a>
  ),
}));

const Contact = () => {
  return (
    <section
      id="Location"
      className={contactCls}
      aria-labelledby="Location-title"
    >
      <Subtitle variant="default">ENTRE EM CONTACTO</Subtitle>
      <Title
        id="Location-title"
        line1="Contactos &"
        line2="Localização"
        variant="highlight"
      />
      <Text className={aboutText} variant="centerMobile">
        <span>{data.intro}</span>
      </Text>

      <div className={cardsMetricMap}>
        <div className={mapArrive}>
          <Arrive />
          <div className={mapCls}>
            {/* Google Maps só depois de «Mostrar mapa» (ver MapEmbed) */}
            <MapEmbed src={data.mapEmbedSrc} {...data.map} />
          </div>
        </div>

        <div className={cardsMetric}>
          <div className={cards}>
            {CONTACT_CARDS.map((props) => (
              <InformationCard key={props.Title} {...props} />
            ))}
          </div>

          <div className={metricCardWrap}>
            {data.metrics.map(({ value, label }) => (
              <MetricCard key={label} value={value} label={label} />
            ))}
          </div>
        </div>
      </div>

      <Quote variant="default">
        "Estamos aqui para transformar o seu momento de cuidado numa experiência
        única e memorável. Entre em contacto e descubra a diferença."
      </Quote>
    </section>
  );
};

export default memo(Contact);
