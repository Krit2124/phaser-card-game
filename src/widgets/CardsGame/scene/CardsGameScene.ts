import Phaser from "phaser";

import { deck28 } from "@/shared/constants";
import { SceneBackground } from "@/shared/types";

interface CardsGameSceneConfig {
  players: number;
  background: SceneBackground;
}

export class CardsGameScene extends Phaser.Scene {
  private players: number;
  private background: SceneBackground;

  constructor(config: CardsGameSceneConfig) {
    super("CardsGameScene");
    this.players = config.players;
    this.background = config.background;
  }

  preload() {
    deck28.forEach((card) => {
      this.load.image(`${card.rank}_${card.suit}`, card.image);
    });

    this.load.image("background", this.background.image);
  }

  create() {
    const { width, height } = this.scale;

    this.add.tileSprite(0, 0, width, height, "background").setOrigin(0, 0);

    this.add.text(100, 50, `Количество игроков: ${this.players}`, {
      fontSize: "32px",
      color: "#fff",
    });

    const card = this.add.sprite(200, 200, "6_hearts");
    card.setScale(0.5);
  }

  update() {}
}
