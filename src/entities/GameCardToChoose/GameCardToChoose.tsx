import { DefaultTextButton, ElementContainer } from "@/shared/ui";

import s from './GameCardToChoose.module.css'

interface GameCardToChooseProps {
  title: string;
  image: string;
  isDisabled?: boolean;
}

const GameCardToChoose = ({title, image, isDisabled = false}: GameCardToChooseProps) => {
  return (
    <ElementContainer className={s.container}>
      <img src={image} alt={title} className={s.image}/>
      <h3>{title}</h3>
      <DefaultTextButton text="Выбрать" disabled={isDisabled} />
    </ElementContainer>
  );
};

export default GameCardToChoose;