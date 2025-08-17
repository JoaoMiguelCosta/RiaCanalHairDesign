import Logo from "../../assets/Logo.png"

const LogoComponent = ({ className, imgClassName }) => {
  return (
    <div className={className}>
      <img
        src={Logo}
        alt="Logo Ria Canal Hair Design"
        className={imgClassName}
      />
    </div>
  );
};

export default LogoComponent;
