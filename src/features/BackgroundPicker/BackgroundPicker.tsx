import { BackgroundPickerItem } from "@/entities/BackgroundPickerItem";

import s from "./BackgroundPicker.module.css";
import { SceneBackground } from "@/shared/types";

interface BackgroundPickerProps {
  selectedBackgroundId: number;
  setSelectedBackgroundId: (value: number) => void;
  backgrounds: SceneBackground[];
}

const BackgroundPicker = ({selectedBackgroundId, setSelectedBackgroundId, backgrounds}: BackgroundPickerProps) => {
  function handleSelectBackground(id: number) {
    setSelectedBackgroundId(id);
  }

  return (
    <form className={s.form}>
      {backgrounds.map((bg) => {
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