import { useEffect, useRef } from "react";
import Phaser from "phaser";

import s from "./CardsGame.module.css";
import { CardsGameScene } from "./scene/CardsGameScene";

interface CardsGameProps {
  players: number;
}

const CardsGame = ({players}: CardsGameProps) => {
  const gameRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const game = new Phaser.Game({
      type: Phaser.AUTO,
      parent: gameRef.current!,
      width: window.innerWidth,
      height: window.innerHeight,
      scene: [new CardsGameScene({ players }),],
    });
    return () => {
      game.destroy(true);
    };
  }, []);

  return <div ref={gameRef} className={s.game} />;
};

export default CardsGame;
