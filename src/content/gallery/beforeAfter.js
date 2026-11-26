// src/content/gallery/beforeAfter.js

// Balayage
import balayageBefore from "@media/beforeAndAfter/balayage/before.webp";
import balayageAfter from "@media/beforeAndAfter/balayage/after.webp";

// Alisamento
import hairStraighteningBefore from "@media/beforeAndAfter/hairStraightening/before.webp";
import hairStraighteningAfter from "@media/beforeAndAfter/hairStraightening/after.webp";

// Madeixas
import highlightsBefore from "@media/beforeAndAfter/highlights/before.webp";
import highlightsAfter from "@media/beforeAndAfter/highlights/after.webp";

// Tratamento de Hidratação
import hairHydrationBefore from "@media/beforeAndAfter/hairHydrationTreatment/before.webp";
import hairHydrationAfter from "@media/beforeAndAfter/hairHydrationTreatment/after.webp";

// Sobrancelhas (imagens existentes em 'face' .png)
import browMicropigmentationBefore from "@media/beforeAndAfter/face/before.webp";
import browMicropigmentationAfter from "@media/beforeAndAfter/face/after.webp";

// Micropigmentação Labial
import lipMicropigmentationBefore from "@media/beforeAndAfter/lipMicropigmentation/before.webp";
import lipMicropigmentationAfter from "@media/beforeAndAfter/lipMicropigmentation/after.webp";

const BeforeAfter = [
  {
    before: balayageBefore,
    after: balayageAfter,
    title: "Balayage",
    caption:
      "Técnica francesa que cria reflexos naturais e luminosos, respeitando o movimento do cabelo.",
  },
  {
    before: hairStraighteningBefore,
    after: hairStraighteningAfter,
    title: "Alisamento",
    caption: "Transformação para fios mais lisos, macios e brilhantes.",
  },
  {
    before: highlightsBefore,
    after: highlightsAfter,
    title: "Madeixas com aplicação de Extensões",
    caption: "Transformação completa com mais volume, luz e movimento.",
  },
  {
    before: hairHydrationBefore,
    after: hairHydrationAfter,
    title: "Tratamento de Hidratação",
    caption: "Cabelo revitalizado, com mais brilho, maciez e movimento.",
  },
  {
    before: browMicropigmentationBefore,
    after: browMicropigmentationAfter,
    title: "Micropigmentação de Sobrancelhas",
    caption:
      "Sobrancelhas mais definidas, simétricas e naturais, valorizando o olhar.",
  },
  {
    before: lipMicropigmentationBefore,
    after: lipMicropigmentationAfter,
    title: "Micropigmentação Labial",
    caption:
      "Lábios com cor uniforme, mais definidos e com efeito de volume natural.",
  },
];

export default BeforeAfter;
