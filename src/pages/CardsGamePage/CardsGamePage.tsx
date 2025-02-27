import s from "./CardsGamePage.module.css";
import { useState } from "react";
import { CardsGameSettings } from "@/widgets/CardsGameSettings";
import { CardsGame } from "@/widgets/CardsGame";

const CardsGamePage = () => {
  const [selectedBackgroundId, setSelectedBackgroundId] = useState(0)
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
        <CardsGame playersAmount={players} selectedBackgroundId={selectedBackgroundId} />
      ) : (
        <CardsGameSettings
          players={players}
          setPlayers={setPlayersWithMinMaxCheck}
          startGame={() => setIsGameStarted(true)}
          selectedBackgroundId={selectedBackgroundId}
          setSelectedBackgroundId={setSelectedBackgroundId}
        />
      )}
    </section>
  );
};

export default CardsGamePage;
