// src/widgets/.../informationCard.jsx
import { memo } from "react";
import styles from "./informationCard.module.css";

const {
  card,
  Icone,
  TitleDescription,
  TitleRow,
  Title: TitleCls,
  ButtonWrapper,
  Description: DescriptionCls,
} = styles;

const InformationCard = ({ Letra, Title, Description, button }) => {
  return (
    <div className={card}>
      <div className={Icone}>{Letra}</div>

      <div className={TitleDescription}>
        <div className={TitleRow}>
          <div className={TitleCls}>{Title}</div>
          {button && <div className={ButtonWrapper}>{button}</div>}
        </div>

        <div className={DescriptionCls}>{Description}</div>
      </div>
    </div>
  );
};

export default memo(InformationCard);
