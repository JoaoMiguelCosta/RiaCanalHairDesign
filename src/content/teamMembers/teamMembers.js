import fernanda from "@media/team/hairdressers/fernanda.jpg";
import vanessa from "@media/team/hairdressers/vanessa.jpg";
import sabrina from "@media/team/aesthetics/sabrina.jpg";
import cristina from "@media/team/hairdressers/cristina.jpg";
import mary from "@media/team/nails/mary.jpg";

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
