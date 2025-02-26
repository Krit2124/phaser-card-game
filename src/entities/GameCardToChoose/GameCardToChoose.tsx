import { DefaultTextButton, ElementContainer } from "@/shared/ui";

import s from "./GameCardToChoose.module.css";

interface GameCardToChooseProps {
  title: string;
  image: string;
  isDisabled?: boolean;
  onButtonClick?: () => void;
}

const GameCardToChoose = ({
  title,
  image,
  isDisabled = false,
  onButtonClick,
}: GameCardToChooseProps) => {
  return (
    <ElementContainer className={s.container}>
      <img src={image} alt={title} className={s.image} />
      <h3>{title}</h3>
      <DefaultTextButton
        text="Выбрать"
        disabled={isDisabled}
        onClick={onButtonClick}
      />
    </ElementContainer>
  );
};

export default GameCardToChoose;
