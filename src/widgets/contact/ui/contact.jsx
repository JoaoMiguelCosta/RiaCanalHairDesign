// src/widgets/contact/ui/contact.jsx
import { memo } from "react";
import styles from "./contact.module.css";

import Subtitle from "@shared/ui/subtitle/subtitle.jsx";
import Title from "@shared/ui/title/title.jsx";
import Text from "@shared/ui/text/text.jsx";
import Quote from "@shared/ui/quote/quote.jsx";

import InformationCard from "@widgets/contact/parts/informationCard/informationCard.jsx"
import MetricCard from "@widgets/contact/parts/metricCard/metricCard.jsx";
import Arrive from "@widgets/contact/parts/arrive/arrive.jsx";

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

// Fonte única da verdade para os cartões de contacto (ordem preservada)
const CONTACT_CARDS = [
  {
    Letra: "T",
    Title: "Telefone",
    Description: (
      <a
        href="tel:+351234420471"
        aria-label="Ligar +351 234 420 471"
        rel="noreferrer"
      >
        +351 234 420 471
      </a>
    ),
  },
  {
    Letra: "W",
    Title: "WhatsApp",
    Description: (
      <a href="https://wa.me/351916887537" {...EXT_PROPS}>
        +351 916 887 537
      </a>
    ),
  },
  {
    Letra: "I",
    Title: "Instagram",
    Description: (
      <a href="https://www.instagram.com/ria_canal_hairdesign/" {...EXT_PROPS}>
        @ria_canal_hairdesign
      </a>
    ),
  },
  {
    Letra: "H",
    Title: "Horário",
    Description: "Terça a Sábado: 9h00 – 19h00",
  },
  {
    Letra: "L",
    Title: "Localização",
    Description: "Praceta Dr. Alberto Souto 9, 3800-147 Aveiro",
    button: (
      <a
        href="https://www.google.com/maps/dir/?api=1&destination=40.64422,-8.64587&travelmode=driving"
        {...EXT_PROPS}
      >
        Ver Google Maps
      </a>
    ),
  },
];

// Métricas em array para evitar duplicação
const METRICS = [
  { value: "24h", label: "Resposta WhatsApp" },
  { value: "100%", label: "Satisfação" },
];

const Contact = () => {
  return (
    <div id="Location" className={contactCls}>
      <Subtitle variant="default">ENTRE EM CONTACTO</Subtitle>
      <Title line1="Contactos &" line2="Localização" variant="highlight" />
      <Text className={aboutText} variant="centerMobile">
        <span>Marque o seu momento de cuidado e elegância. Fale connosco.</span>
      </Text>

      <div className={cardsMetricMap}>
        <div className={mapArrive}>
          <Arrive />
          <div className={mapCls}>
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d756.837798441559!2d-8.64660314662673!3d40.64418825438006!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xd2399e20ebc758b%3A0xc664252753d9c1c5!2sRia%20Canal%20-%20Hair%20Design!5e0!3m2!1spt-PT!2spt!4v1755174991101!5m2!1spt-PT!2spt"
              style={{ border: 0, width: "100%", height: "100%" }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>

        <div className={cardsMetric}>
          <div className={cards}>
            {CONTACT_CARDS.map((props) => (
              <InformationCard key={props.Title} {...props} />
            ))}
          </div>

          <div className={metricCardWrap}>
            {METRICS.map(({ value, label }) => (
              <MetricCard key={label} value={value} label={label} />
            ))}
          </div>
        </div>
      </div>

      <Quote variante="default">
        "Estamos aqui para transformar o seu momento de cuidado numa experiência
        única e memorável. Entre em contacto e descubra a diferença."
      </Quote>
    </div>
  );
};

export default memo(Contact);
