import {
  FaInstagram,
  FaFacebook,
  FaArrowLeft,
  FaArrowRight,
  FaChevronDown, // ⬅️ usar chevron para o dropdown
  FaLocationDot,
  FaClock,
  FaRegComment,
  FaPause,
  FaPlay,
  FaVolumeHigh,
  FaVolumeXmark,
} from "react-icons/fa6";
import { FaPhoneAlt } from "react-icons/fa";
import { IoLogoWhatsapp, IoMenu } from "react-icons/io5";
import { IoMdClose } from "react-icons/io";

const icons = {
  instagram: FaInstagram,
  facebook: FaFacebook,
  whatsapp: IoLogoWhatsapp,
  menu: IoMenu,
  close: IoMdClose,
  // setas / navegação
  arrowLeft: FaArrowLeft,
  arrowRight: FaArrowRight,
  chevronDown: FaChevronDown, // ⬅️ novo alias estável
  // info
  phone: FaPhoneAlt,
  location: FaLocationDot,
  clock: FaClock,
  comment: FaRegComment,
  // controlos multimédia / carrossel
  pause: FaPause,
  play: FaPlay,
  volumeOn: FaVolumeHigh,
  volumeOff: FaVolumeXmark,
};

/**
 * Ícone do catálogo acima.
 * Decorativo por defeito (aria-hidden + focusable="false"): o nome acessível
 * vem do texto ou do aria-label do botão/link que o contém. Se o ícone
 * transmitir informação por si só, passar `aria-label` (ou `title`) e deixa
 * de ser ocultado.
 */
const Icon = ({ name, className, ...props }) => {
  const IconComponent = icons[name];
  if (!IconComponent) {
    console.warn(`Icon "${name}" not found.`);
    return null;
  }
  const labelled = Boolean(props["aria-label"] || props.title);
  return (
    <IconComponent
      className={className}
      aria-hidden={labelled ? undefined : "true"}
      focusable="false"
      {...(labelled ? { role: "img" } : null)}
      {...props}
    />
  );
};

export default Icon;
