import Phaser from "phaser";

import { deck28 } from "@/shared/constants";

interface CardsGameSceneConfig {
  players: number;
}

export class CardsGameScene extends Phaser.Scene {
  private players: number;
  
  constructor(config: CardsGameSceneConfig) {
    super("CardsGameScene");
    this.players = config.players;
  }

  preload() {
    deck28.forEach((card) => {
      this.load.image(`${card.rank}_${card.suit}`, card.image);
    })
  }

  create() {
    this.add.text(100, 50, `Количество игроков: ${this.players}`, {
      fontSize: "32px",
      color: "#fff",
    });

    const card = this.add.sprite(200, 200, "6_hearts");
    card.setScale(0.5);
  }

  update() {
    
  }
}
