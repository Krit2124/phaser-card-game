import { GameCardToChoose } from "@/entities/GameCardToChoose";

import s from "./GameSelectionPage.module.css";
import { ElementContainer } from "@/shared/ui";

const GameSelectionPage = () => {
  return (
    <div className={s.container}>
      <ElementContainer>
        <h1>Выберите игру</h1>
      </ElementContainer>
      <div className={s.gamesContainer}>
        <GameCardToChoose title="Карты" image="/img/cards.jpg" />
        <GameCardToChoose title="В разработке" image="/img/question.jpg" isDisabled />
      </div>
    </div>
  );
};

export default GameSelectionPage;
