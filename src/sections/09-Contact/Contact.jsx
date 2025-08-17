import styles from "./Contact.module.css";
import Subtitle from "../../components/Subtitle/Subtitle";
import Title from "../../components/Title/Title";
import Text from "../../components/Text/Text";
import InformationCard from "./InformationCard/InformationCard";
import MetricCard from "./MetricCard/MetricCard";
import Arrive from "./Arrive/Arrive.jsx";
import Quote from "../../components/Quote/Quote.jsx";

const Contact = () => {
  return (
    <div id="Location" className={styles.contact}>
      <Subtitle variant="default">ENTRE EM CONTACTO</Subtitle>
      <Title line1="Contactos &" line2="Localização" variant="highlight" />
      <Text className={styles.aboutText} variant="centerMobile">
        <span>Marque o seu momento de cuidado e elegância. Fale connosco.</span>
      </Text>
      <div className={styles.CardsMetricMap}>
        <div className={styles.MapArrive}>
          <Arrive />
          <div className={styles.Map}>
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d756.837798441559!2d-8.64660314662673!3d40.64418825438006!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xd2399e20ebc758b%3A0xc664252753d9c1c5!2sRia%20Canal%20-%20Hair%20Design!5e0!3m2!1spt-PT!2spt!4v1755174991101!5m2!1spt-PT!2spt"
              style={{ border: 0, width: "100%", height: "100%" }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>
        </div>
        <div className={styles.CardsMetric}>
          <div className={styles.Cards}>
            <InformationCard
              Letra="T"
              Title="Telefone"
              Description={
                <a
                  href="tel:+351234420471"
                  aria-label="Ligar +351 234 420 471"
                  rel="noreferrer"
                >
                  +351 234 420 471
                </a>
              }
            />
            <InformationCard
              Letra="W"
              Title="WhatsApp"
              Description={
                <a
                  href="https://wa.me/351916887537"
                  target="_blank"
                  rel="noreferrer"
                >
                  +351 916 887 537
                </a>
              }
            />

            <InformationCard
              Letra="I"
              Title="Instagram"
              Description={
                <a
                  href="https://www.instagram.com/ria_canal_hairdesign/"
                  target="_blank"
                  rel="noreferrer"
                >
                  @ria_canal_hairdesign
                </a>
              }
            />
            <InformationCard
              Letra="H"
              Title="Horário"
              Description="Terça a Sábado: 9h00 – 19h00"
            />
            <InformationCard
              Letra="L"
              Title="Localização"
              Description="Praceta Dr. Alberto Souto 9, 3800-147 Aveiro"
              button={
                <a
                  href="https://www.google.com/maps/dir/?api=1&destination=40.64422,-8.64587&travelmode=driving"
                  target="_blank"
                  rel="noreferrer"
                >
                  Ver Google Maps
                </a>
              }
            />
          </div>
          <div className={styles.MetricCard}>
            <MetricCard value="24h" label="Resposta WhatsApp" />
            <MetricCard value="100%" label="Satisfação" />
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

export default Contact;
