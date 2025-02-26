import { ElementContainer, DefaultInput, DefaultTextButton } from "@/shared/ui";
import s from "./CardsGameSettings.module.css";
import { BackgroundPicker } from "@/features/BackgroundPicker";

interface CardsGameSettingsProps {
  players: number;
  setPlayers: (value: number) => void;
  selectedBackgroundId: number;
  setSelectedBackgroundId: (value: number) => void;
  startGame: () => void;
}

const CardsGameSettings = ({
  players,
  setPlayers,
  selectedBackgroundId,
  setSelectedBackgroundId,
  startGame,
}: CardsGameSettingsProps) => {
  return (
    <div className={s.container}>
      <ElementContainer className={s.playersAmountContainer}>
        <h2>Количество игроков:</h2>
        <DefaultInput
          type="number"
          min={2}
          max={4}
          value={players}
          onChange={(e) => setPlayers(Number(e.target.value))}
          className={s.playersAmountInput}
        />
      </ElementContainer>

      <ElementContainer className={s.backgroundsContainer}>
        <h2>Фон:</h2>
        <BackgroundPicker
          selectedBackgroundId={selectedBackgroundId}
          setSelectedBackgroundId={setSelectedBackgroundId}
        />
      </ElementContainer>

      <DefaultTextButton text="Начать игру" onClick={startGame} />
    </div>
  );
};

export default CardsGameSettings;
