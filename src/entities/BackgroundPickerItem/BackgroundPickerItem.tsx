import { SceneBackground } from "@/shared/types";
import { ElementContainer } from "@/shared/ui";

import s from "./BackgroundPickerItem.module.css";

interface BackgroundPickerItemProps {
  selectedBackgroundId: number;
  thisBackground: SceneBackground;
  selectBackground: (id: number) => void;
}

const BackgroundPickerItem = ({
  selectedBackgroundId,
  thisBackground,
  selectBackground,
}: BackgroundPickerItemProps) => {
  const isSelected = selectedBackgroundId === thisBackground.id;

  return (
    <label>
      <ElementContainer
        className={`${s.container} ${isSelected ? s.selectedContainer : ""}`}
      >
        <input
          type="radio"
          name={thisBackground.name}
          value={thisBackground.id}
          checked={isSelected}
          onChange={() => selectBackground(thisBackground.id)}
          className={s.radioButton}
        />
        <img src={thisBackground.image} alt={thisBackground.name} className={s.bgImage}/>
        <h3>{thisBackground.name}</h3>
      </ElementContainer>
    </label>
  );
};

export default BackgroundPickerItem;
