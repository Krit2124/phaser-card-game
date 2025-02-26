import { GameCardToChoose } from "@/entities/GameCardToChoose";
import { ElementContainer } from "@/shared/ui";
import { useNavigate } from "react-router-dom";

import s from "./GameSelectionPage.module.css";

const GameSelectionPage = () => {
  const navigate = useNavigate();

  return (
    <section className={s.container}>
      <ElementContainer>
        <h1>Выберите игру</h1>
      </ElementContainer>
      <div className={s.gamesContainer}>
        <GameCardToChoose
          title="Карты"
          image="/img/cards.jpg"
          onButtonClick={() => navigate("cards")}
        />
        <GameCardToChoose
          title="В разработке"
          image="/img/question.jpg"
          isDisabled
        />
      </div>
    </section>
  );
};

export default GameSelectionPage;
