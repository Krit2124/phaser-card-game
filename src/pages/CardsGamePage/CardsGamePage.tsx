import s from "./CardsGamePage.module.css";
import { useState } from "react";
import { CardsGameSettings } from "@/widgets/CardsGameSettings";
import { CardsGame } from "@/widgets/CardsGame";

const CardsGamePage = () => {
  const [players, setPlayers] = useState(2);
  function setPlayersWithMinMaxCheck(value: number) {
    if (value < 2) {
      setPlayers(2);
    } else if (value > 4) {
      setPlayers(4);
    } else {
      setPlayers(value);
    }
  }

  const [isGameStarted, setIsGameStarted] = useState(false);

  return (
    <section className={s.container}>
      {isGameStarted ? (
        <CardsGame players={players} />
      ) : (
        <CardsGameSettings
          players={players}
          setPlayers={setPlayersWithMinMaxCheck}
          startGame={() => setIsGameStarted(true)}
        />
      )}
    </section>
  );
};

export default CardsGamePage;
