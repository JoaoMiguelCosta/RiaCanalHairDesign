import {
  FaInstagram,
  FaFacebook,
  FaArrowDown,
  FaArrowLeft,
  FaArrowRight,
  FaLocationDot,
  FaClock,
  FaRegComment,
} from "react-icons/fa6"; // Ícones que estão disponíveis em FA6

import { FaPhoneAlt } from "react-icons/fa";
import { IoLogoWhatsapp, IoMenu } from "react-icons/io5";
import { IoMdClose } from "react-icons/io";

const icons = {
  instagram: FaInstagram,
  facebook: FaFacebook,
  whatsapp: IoLogoWhatsapp,
  menu: IoMenu,
  close: IoMdClose,
  arrowDown: FaArrowDown,
  arrowLeft: FaArrowLeft,
  arrowRight: FaArrowRight,
  phone: FaPhoneAlt,
  location: FaLocationDot,
  clock: FaClock,
  comment: FaRegComment,
};

const Icon = ({ name, className, ...props }) => {
  const IconComponent = icons[name];

  if (!IconComponent) {
    console.warn(`Icon "${name}" not found.`);
    return null;
  }

  return <IconComponent className={className} {...props} />;
};

export default Icon;
