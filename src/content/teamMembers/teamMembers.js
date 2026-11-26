import fernanda from "@media/team/hairdressers/fernanda.webp";
import vanessa from "@media/team/hairdressers/vanessa.webp";
import sabrina from "@media/team/aesthetics/sabrina.webp";
import cristina from "@media/team/hairdressers/cristina.webp";
import mary from "@media/team/nails/mary.webp";

const TeamMembers = {
  hairdressers: [
    {
      name: "Vanessa Ribeiro",
      legend: "Cabeleireira",
      legend1: "Especializada",
      photo: vanessa, // VanessaPhoto
    },
    {
      name: "Cristina Maria",
      legend: "Cabeleireira",
      legend1: "Especializada",
      photo: cristina, // CristinaPhoto
    },
    {
      name: "Fernanda Gonzalez",
      legend: "Cabeleireira",
      legend1: "Especializada",
      photo: fernanda, // FernandaPhoto
    },
  ],

  sabrina: {
    name: "Sabrina Mara",
    legend: "Estética Avançada & Depilação",
    legend1: null,
    photo: sabrina, // SabrinaPhoto
  },

  elisa: {
    name: "Elisa",
    legend: "Estética & Depilação",
    legend1: null,
    photo: null, // ElisaPhoto
  },

  mary: {
    name: "Mary",
    legend: "Unhas",
    legend1: null,
    photo: mary, // MaryPhoto
  },
};

export default TeamMembers;
