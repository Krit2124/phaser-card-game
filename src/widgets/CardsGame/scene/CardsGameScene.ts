import Phaser from "phaser";

import { deck28 } from "@/shared/constants";
import { SceneBackground } from "@/shared/types";
import UnplayedDeck from "./elements/UnplayedDeck";
import InteractiveTable from "./elements/InteractiveTable";
import { cardsSizes } from "../constants/cardsSizes";
import PlayerHand from "./elements/PlayerHand";

interface CardsGameSceneConfig {
  playersAmount: number;
  background: SceneBackground;
}

export class CardsGameScene extends Phaser.Scene {
  private playersAmount: number;
  private background: SceneBackground;

  private unplayedDeck!: UnplayedDeck;
  private interactiveTable!: InteractiveTable;
  private players!: PlayerHand[];

  constructor(config: CardsGameSceneConfig) {
    super("CardsGameScene");
    this.playersAmount = config.playersAmount;
    this.background = config.background;
  }

  preload() {
    deck28.forEach((card) => {
      this.load.image(card.image, card.image);
    });
    this.load.image("card_back", "/img/deck/card_back.png");

    this.load.image("background", this.background.image);
  }

  create() {
    const { width, height } = this.scale;
    // Для отступов по краям берём половину карточки и ещё немного
    const marginFromSceneBorders = cardsSizes.height * 0.75;

    this.add.tileSprite(0, 0, width, height, "background").setOrigin(0, 0);

    this.unplayedDeck = new UnplayedDeck(
      this,
      marginFromSceneBorders + 200,
      height / 2
    );
    this.interactiveTable = new InteractiveTable(
      this,
      width,
      height,
      marginFromSceneBorders
    );

    const playersPositions = this.calculatePlayersPositions(width, height);

    const tempPlayers = [];
    for (let i = 0; i < this.playersAmount; i++) {
      tempPlayers.push(
        new PlayerHand(
          this,
          playersPositions[i].x,
          playersPositions[i].y,
          playersPositions[i].angle
        )
      );
    }
    this.players = tempPlayers;

    for (let i = 0; i < this.playersAmount; i++) {
      const CardsForPlayer = this.unplayedDeck.getCards(4);
      for (const card of CardsForPlayer) {
        this.players[i].addCard(card);
      }
    }
  }

  update() {}

  private calculatePlayersPositions(width: number, height: number) {
    const normalAngle = 0;
    const reversedAngle = Math.PI;

    if (this.playersAmount === 2) {
      return [
        { x: width / 2, y: height, angle: normalAngle },
        { x: width / 2, y: 0, angle: reversedAngle },
      ];
    } else if (this.playersAmount === 3) {
      return [
        { x: width / 2, y: height, angle: normalAngle },
        { x: width / 2 - cardsSizes.width * 2, y: 0, angle: reversedAngle },
        { x: width / 2 + cardsSizes.width * 2, y: 0, angle: reversedAngle },
      ];
    } else {
      return [
        { x: width / 2 - cardsSizes.width * 2, y: height, angle: normalAngle },
        { x: width / 2 - cardsSizes.width * 2, y: 0, angle: reversedAngle },
        { x: width / 2 + cardsSizes.width * 2, y: 0, angle: reversedAngle },
        { x: width / 2 + cardsSizes.width * 2, y: height, angle: normalAngle },
      ];
    }
  }
}
