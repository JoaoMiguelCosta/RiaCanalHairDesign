// src/content/media/works/index.js (ou onde já estavas a colocar isto)

// Serviços disponíveis
export const services = ["Cabeleireiro", "Estética", "Unhas"];

/* =========================
   IMPORTS (batem com o screenshot)
   ========================= */

// AESTHETICS
import eyebrowDesign from "@media/works/aesthetics/eyebrowDesign.jpg";
import eyelashExtensions from "@media/works/aesthetics/eyelashExtensions.jpg";
import Eyeliner from "@media/works/aesthetics/Eyeliner.jpg";
import laserRemoval from "@media/works/aesthetics/laserRemoval.jpg";
import lashes from "@media/works/aesthetics/lashes.jpg";
import lipMicropigmentation from "@media/works/aesthetics/lipMicropigmentation.jpg";
import microblading from "@media/works/aesthetics/microblading.jpg";
import microneedling from "@media/works/aesthetics/microneedling.jpg";
import nanoStrokesBrows from "@media/works/aesthetics/nanoStrokesBrows.jpg";

// HAIRDRESSERS
import Balayage from "@media/works/hairdressers/Balayage.png";
import bridalHairstyle from "@media/works/hairdressers/bridalHairstyle.png";
import hairColorJpg from "@media/works/hairdressers/hairColor.jpg";
import hairColorPng from "@media/works/hairdressers/hairColor.png";
import haircut from "@media/works/hairdressers/haircut.jpg";
import hairStraightening from "@media/works/hairdressers/hairStraightening.jpg";
import hairstyling from "@media/works/hairdressers/hairstyling.jpg";
import PenteadoNoiva from "@media/works/hairdressers/PenteadoNoiva.jpg";

// NAILS
import gelNails1 from "@media/works/nails/gelNails1.jpg";
import gelNails2 from "@media/works/nails/gelNails2.jpg";
import gelNails3 from "@media/works/nails/gelNails3.jpg";
import gelPolish from "@media/works/nails/gelPolish.jpg";
import nailArt1 from "@media/works/nails/nailArt1.avif";
import pinkNails from "@media/works/nails/pinkNails.jpg";
import redManicure from "@media/works/nails/redManicure.avif";

/* =========================
   DATA
   ========================= */

// Trabalhos Cabeleireiro
export const worksHair = [
  {
    titulo: "Coloração Vibrante",
    descricao:
      "Tons intensos e luminosos que destacam a personalidade e o estilo.",
    foto: hairColorJpg,
  },
  {
    titulo: "Alisamento e Brilho",
    descricao: "Transformação para um cabelo liso, sedoso e radiante.",
    foto: hairStraightening,
  },
  {
    titulo: "Corte Moderno",
    descricao:
      "Estilo versátil e atual que valoriza o movimento natural do cabelo.",
    foto: haircut,
  },
  {
    titulo: "Penteado",
    descricao:
      "Elegância e charme em um estilo versátil para ocasiões especiais.",
    foto: hairstyling,
  },
  {
    titulo: "Penteado de Noiva",
    descricao:
      "Beleza única e sofisticada para o dia mais especial da sua vida.",
    foto: PenteadoNoiva,
  },
  {
    titulo: "Coloração Cobre",
    descricao:
      "Reflexos quentes e sofisticados que trazem brilho e modernidade.",
    foto: hairColorPng, // usámos a versão .png existente
  },
  {
    titulo: "Penteado de Festa",
    descricao: "Textura e fixação pensadas para durar a noite toda.",
    foto: bridalHairstyle,
  },
  {
    titulo: "Balayage",
    descricao: "Luzes degradê que iluminam de forma natural e sofisticada.",
    foto: Balayage,
  },
];

// Trabalhos Estética
export const worksEstetica = [
  {
    titulo: "Design de Sobrancelha",
    descricao: "Harmonia do olhar com desenho preciso e natural.",
    foto: eyebrowDesign,
  },
  {
    titulo: "Micro Labial",
    descricao: "Realce natural da cor e contorno dos lábios.",
    foto: lipMicropigmentation,
  },
  {
    titulo: "Microblading",
    descricao: "Sobrancelhas definidas com efeito fio a fio realista.",
    foto: microblading,
  },
  {
    titulo: "Lifting de Pestanas",
    descricao:
      "Realça e curva as pestanas naturais para um olhar mais aberto, sem extensões.",
    foto: lashes,
  },
  {
    titulo: "Nanofios",
    descricao:
      "Técnica com agulhas ultrafinas que garante sobrancelhas mais definidas e naturais.",
    foto: nanoStrokesBrows,
  },
  {
    titulo: "Alongamento de Pestanas",
    descricao:
      "Extensões fio a fio que proporcionam um olhar intenso e elegante.",
    foto: eyelashExtensions,
  },
  {
    titulo: "Eyeliner (Delineado de Olhos)",
    descricao:
      "Delineado semipermanente que realça o olhar com praticidade diária.",
    foto: Eyeliner,
  },
  {
    titulo: "Remoção a Laser",
    descricao:
      "Tratamento eficaz para eliminar pigmentos indesejados com segurança e precisão.",
    foto: laserRemoval,
  },
  {
    titulo: "Microagulhamento",
    descricao:
      "Estimula a renovação celular e a produção de colagénio para pele mais firme.",
    foto: microneedling,
  },
];

// Trabalhos Unhas
export const worksUnhas = [
  {
    titulo: "Unhas de Gel Francesa",
    descricao:
      "Clássico intemporal que combina delicadeza, elegância e resistência.",
    foto: gelNails1,
  },
  {
    titulo: "Unhas de Gel Azul Vibrante",
    descricao: "Cor ousada e moderna com acabamento duradouro e brilhante.",
    foto: gelNails2,
  },
  {
    titulo: "Art Nail (Gel)",
    descricao: "Design criativo com detalhes que destacam a sua personalidade.",
    foto: gelNails3,
  },
  {
    titulo: "Verniz Gel Natural",
    descricao: "Elegância discreta com acabamento duradouro e brilho delicado.",
    foto: gelPolish,
  },
  {
    titulo: "Verniz Gel Rosa Suave",
    descricao: "Tom delicado que transmite feminilidade e elegância.",
    foto: pinkNails,
  },
  {
    titulo: "Manicure Verniz Gel Vermelho",
    descricao: "Clássico vibrante com brilho intenso e acabamento sofisticado.",
    foto: redManicure,
  },
  {
    titulo: "Art Nail",
    descricao: "Detalhes modernos e sofisticados — pequenas obras de arte.",
    foto: nailArt1,
  },
];

/* =========================
   Serviços (texto)
   ========================= */
const servicesData = {
  hair: [
    "Penteados",
    "Corte",
    "Corte Homem",
    "Alisamentos",
    "Brushing",
    "Extensões",
    "Ondulação",
    "Balayage",
    "Madeixas",
    "Coloração",
    "Tratamentos de Hidratação",
    "Tratamentos de Reconstrução",
  ],
  estetica: [
    "Microblading",
    "Micro Labial",
    "Remoção a Laser",
    "Depilação a Laser",
    "Limpeza de Pele",
    "Pestanas",
    "Manicure e Pedicure",
    "Microagulhamento",
    "Design de Sobrancelha",
  ],
  elisa: [
    "Manicure e Pedicure",
    "Massagem Relaxante",
    "Microagulhamento",
    "Tratamentos de Corpo",
    "Maquilhagem",
    "Massagem Modeladora",
  ],
  mary: [
    "Unhas de Gel / Art Nail",
    "Acrílico",
    "Verniz Gel",
    "Manicure e Pedicure",
  ],
};

export default servicesData;
