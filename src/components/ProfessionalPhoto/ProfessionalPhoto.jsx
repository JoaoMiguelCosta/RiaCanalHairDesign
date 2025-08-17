const ProfessionalPhoto = ({ ContainerImg, imageClass, src, alt }) => {
  return (
    <div className={ContainerImg}>
      {src && <img src={src} alt={alt} className={imageClass} />}
    </div>
  );
};

export default ProfessionalPhoto;
