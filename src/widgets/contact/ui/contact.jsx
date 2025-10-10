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

// Constrói a descrição em JSX de acordo com o tipo vindo de content
function renderDescription(card) {
  switch (card.type) {
    case "phone":
      return (
        <a href={`tel:${card.phone}`} aria-label={card.aria} rel="noreferrer">
          {card.label ?? card.phone}
        </a>
      );
    case "whatsapp":
      return (
        <a href={card.url} {...EXT_PROPS}>
          {card.label ?? card.phone}
        </a>
      );
    case "link":
      return (
        <a href={card.url} {...EXT_PROPS}>
          {card.label}
        </a>
      );
    case "location":
      return card.text;
    case "text":
    default:
      return card.text;
  }
}

const Contact = () => {
  const contactCards = Array.isArray(data.cards) ? data.cards : [];
  const metrics = Array.isArray(data.metrics) ? data.metrics : [];

  return (
    <div id="Location" className={contactCls}>
      <Subtitle variant="default">ENTRE EM CONTACTO</Subtitle>
      <Title line1="Contactos &" line2="Localização" variant="highlight" />
      <Text className={aboutText} variant="centerMobile">
        <span>{data.intro}</span>
      </Text>

      <div className={cardsMetricMap}>
        <div className={mapArrive}>
          <Arrive />
          <div className={mapCls}>
            <iframe
              src={data.mapEmbedSrc}
              style={{ border: 0, width: "100%", height: "100%" }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>

        <div className={cardsMetric}>
          <div className={cards}>
            {contactCards.map((c) => (
              <InformationCard
                key={c.title}
                Letra={c.letter}
                Title={c.title}
                Description={renderDescription(c)}
                button={
                  c.button ? (
                    <a href={c.button.url} {...EXT_PROPS}>
                      {c.button.label}
                    </a>
                  ) : undefined
                }
              />
            ))}
          </div>

          <div className={metricCardWrap}>
            {metrics.map(({ value, label }) => (
              <MetricCard key={label} value={value} label={label} />
            ))}
          </div>
        </div>
      </div>

      {/* Mantém a prop original "variante" para não alterar nada do teu componente Quote */}
      <Quote variante="default">
        "Estamos aqui para transformar o seu momento de cuidado numa experiência
        única e memorável. Entre em contacto e descubra a diferença."
      </Quote>
    </div>
  );
};

export default memo(Contact);
