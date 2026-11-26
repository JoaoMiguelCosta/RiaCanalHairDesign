// src/content/gallery/media.js

// IMAGENS (src/content/media/space) — versões WebP otimizadas; os originais .jpg mantêm-se no repositório.
// treatmentRoom continua em JPG: a versão WebP não reduzia o tamanho o suficiente.
import stylingArea from "@media/space/stylingArea.webp";
import nailsArea from "@media/space/nailsArea.webp";
import relaxLounge from "@media/space/relaxLounge.webp";
import washStation from "@media/space/washStation.webp";
import treatmentRoom from "@media/space/treatmentRoom.jpg";
import advancedRoom from "@media/space/advancedEquipment.webp";

// VÍDEOS (src/content/media/videos) — versão web (H.264 540p, sem faixa de áudio),
// versão de baixa resolução para a camada desfocada e poster
import moments from "@media/videos/ria-canal-video-web.mp4";
import momentsBlur from "@media/videos/ria-canal-video-blur.mp4";
import momentsPoster from "@media/videos/ria-canal-video-poster.webp";

// Export no mesmo formato (objetos)
export const Images = {
  treatmentRoom,
  nailsArea,
  relaxLounge,
  advancedRoom,
  stylingArea,
  washStation,
};

export const Videos = {
  moments,
};

export const VideoBlurs = {
  moments: momentsBlur,
};

export const VideoPosters = {
  moments: momentsPoster,
};
