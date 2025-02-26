import { BackgroundPickerItem } from "@/entities/BackgroundPickerItem";
import { backgroundsForCardsGame } from "@/shared/constants";

import s from "./BackgroundPicker.module.css";

interface BackgroundPickerProps {
  selectedBackgroundId: number;
  setSelectedBackgroundId: (value: number) => void;
}

const BackgroundPicker = ({selectedBackgroundId, setSelectedBackgroundId}: BackgroundPickerProps) => {
  function handleSelectBackground(id: number) {
    setSelectedBackgroundId(id);
  }

  return (
    <form className={s.form}>
      {backgroundsForCardsGame.map((bg) => {
        return <BackgroundPickerItem 
          key={bg.id}
          selectedBackgroundId={selectedBackgroundId}
          thisBackground={bg}
          selectBackground={handleSelectBackground}
        />
      })}
    </form>
  );
};

export default BackgroundPicker;