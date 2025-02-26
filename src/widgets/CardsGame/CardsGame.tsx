import { useEffect, useRef } from "react";
import Phaser from "phaser";
import { CardsGameScene } from "./scene/CardsGameScene";
import { backgroundsForCardsGame } from "@/shared/constants";

import s from "./CardsGame.module.css";

interface CardsGameProps {
  players: number;
  selectedBackgroundId: number;
}

const CardsGame = ({players, selectedBackgroundId}: CardsGameProps) => {
  const gameRef = useRef<HTMLDivElement>(null);
  const background = backgroundsForCardsGame[selectedBackgroundId];

  useEffect(() => {
    const game = new Phaser.Game({
      type: Phaser.AUTO,
      parent: gameRef.current!,
      width: window.innerWidth,
      height: window.innerHeight,
      scene: [new CardsGameScene({ players, background }),],
    });
    return () => {
      game.destroy(true);
    };
  }, []);

  return <div ref={gameRef} className={s.game} />;
};

export default CardsGame;
