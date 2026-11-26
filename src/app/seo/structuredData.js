// src/app/seo/structuredData.js
// Dados estruturados (Schema.org, JSON-LD) da Home, gerados no build.
// Só contém informação visível no site (secção Contacto e footer, em
// src/content/contact/contact.json, src/content/footer/*.json); o teste
// structuredData.test.js falha se esses conteúdos mudarem e isto não.
// Sem avaliações, preços, coordenadas nem identificadores empresariais.
import { OG_IMAGE, SITE_NAME, SITE_URL } from "./routeMeta.js";

export const BUSINESS = {
  telephone: "+351234420471",
  address: {
    streetAddress: "Praceta Dr. Alberto Souto 9",
    postalCode: "3800-147",
    addressLocality: "Aveiro",
    addressCountry: "PT",
  },
  // "Terça a Sábado: 9h00 – 19h00"
  openingHours: {
    dayOfWeek: ["Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
    opens: "09:00",
    closes: "19:00",
  },
  sameAs: [
    "https://www.instagram.com/ria_canal_hairdesign/",
    "https://www.facebook.com/RiaCanalHairDesignAvr/",
  ],
};

export function getStructuredData() {
  return {
    "@context": "https://schema.org",
    "@type": "HairSalon",
    name: SITE_NAME,
    url: `${SITE_URL}/`,
    image: OG_IMAGE.url,
    telephone: BUSINESS.telephone,
    address: { "@type": "PostalAddress", ...BUSINESS.address },
    openingHoursSpecification: [
      { "@type": "OpeningHoursSpecification", ...BUSINESS.openingHours },
    ],
    sameAs: BUSINESS.sameAs,
  };
}

/** JSON seguro dentro de <script>: "<" escapado impede fechar a tag. */
export const serializeJsonLd = (data) =>
  JSON.stringify(data).replace(/</g, "\\u003c");
