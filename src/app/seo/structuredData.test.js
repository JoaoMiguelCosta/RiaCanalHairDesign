// JSON-LD: cada valor tem de corresponder a conteúdo visível no site.
import { describe, expect, test } from "vitest";
import contact from "@content/contact/contact.json";
import footerContact from "@content/footer/contact.json";
import footerSocials from "@content/footer/footerSocials.json";
import { BUSINESS, getStructuredData, serializeJsonLd } from "./structuredData.js";
import { SITE_NAME } from "./routeMeta.js";

const card = (type) => contact.cards.find((c) => c.type === type);
const footer = (icon) => footerContact.contacts.find((c) => c.icon === icon);

describe("dados estruturados (HairSalon)", () => {
  test("telefone igual ao da secção Contacto e do footer", () => {
    expect(BUSINESS.telephone).toBe(card("phone").phone);
    expect(footer("phone").href).toBe(`tel:${BUSINESS.telephone}`);
  });

  test("morada igual à apresentada no site", () => {
    const { streetAddress, postalCode, addressLocality } = BUSINESS.address;
    const visible = `${streetAddress}, ${postalCode} ${addressLocality}`;
    expect(card("location").text).toBe(visible);
    expect(footer("location").content).toBe(visible);
  });

  test("horário igual ao apresentado (terça a sábado, 9h00–19h00)", () => {
    expect(card("text").text).toBe("Terça a Sábado: 9h00 – 19h00");
    expect(BUSINESS.openingHours).toEqual({
      dayOfWeek: ["Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
      opens: "09:00",
      closes: "19:00",
    });
  });

  test("sameAs: só os perfis sociais ligados no footer", () => {
    const linked = footerSocials.map(({ href }) => {
      const url = new URL(href);
      return `${url.origin}${url.pathname}`;
    });
    expect(BUSINESS.sameAs).toEqual(linked);
  });

  test("sem campos não verificáveis", () => {
    const data = getStructuredData();
    expect(data["@type"]).toBe("HairSalon");
    expect(data.name).toBe(SITE_NAME);
    for (const field of ["aggregateRating", "review", "priceRange", "geo", "vatID", "taxID", "email"]) {
      expect(data).not.toHaveProperty(field);
    }
  });

  test("serialização segura dentro de <script>", () => {
    expect(serializeJsonLd({ a: "</script><b>" })).toBe('{"a":"\\u003c/script>\\u003cb>"}');
    expect(JSON.parse(serializeJsonLd(getStructuredData()))).toEqual(getStructuredData());
  });
});
