import Phaser from "phaser";
import { deck28 } from "@/shared/constants";
import { Card, SceneBackground } from "@/shared/types";
import UnplayedDeck from "./elements/UnplayedDeck";
import InteractiveTable from "./elements/InteractiveTable";
import { cardsSizes } from "../constants/cardsSizes";
import PlayerHand from "./elements/PlayerHand";
import { ATTACKER, DEFENDER, SUPPORT } from "../constants/playerRoles";

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
  private defendingPlayerId: number = 1;

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

    this.unplayedDeck = new UnplayedDeck(this, 200, height / 2);

    this.interactiveTable = new InteractiveTable(
      this,
      width,
      height,
      marginFromSceneBorders
    );

    const playersPositions = this.calculatePlayersPositions(width, height);

    // Временный массив для игроков, так как push в this.players вызывает ошибку
    const tempPlayers = [];
    for (let i = 0; i < this.playersAmount; i++) {
      const playerHand = new PlayerHand(
        this,
        playersPositions[i].x,
        playersPositions[i].y,
        playersPositions[i].angle,
        i
      );
      playerHand.on("cardPlayed", this.handleCardPlayed, this);
      tempPlayers.push(playerHand);
    }
    this.players = tempPlayers;

    for (let i = 0; i < this.playersAmount; i++) {
      const CardsForPlayer = this.unplayedDeck.getCards(4);
      for (const card of CardsForPlayer) {
        this.players[i].addCard(card);
      }
    }

    this.startTurn();
  }

  update() {}

  private startTurn() {
    // Распределение ролей игроков
    const attackerId =
      this.defendingPlayerId > 0
        ? this.defendingPlayerId - 1
        : this.playersAmount - 1;

    this.players.forEach((player, index) => {
      if (index === this.defendingPlayerId) {
        this.players[this.defendingPlayerId].setRole(DEFENDER);
      } else if (index === attackerId) {
        player.setRole(ATTACKER);
      } else {
        player.setRole(SUPPORT);
      }
    });
  }

  private endTurn() {
    this.interactiveTable.removeAllCards();
    // FIXME: добавить логику выдачи карт
    this.startTurn();
  }

  private handleCardPlayed(card: Card, playerId: number, playerRole: string, x: number, y: number) {
    let isAdded = false;

    if (playerRole === ATTACKER || (playerRole === SUPPORT && this.interactiveTable.attackCardsDataOnTable.length > 0)) {
      isAdded = this.interactiveTable.addAttackCard(card);
    } else if (playerRole === DEFENDER) {
      isAdded = this.interactiveTable.addDefenseCard(card, x, y);
    }
    
    if (isAdded) {
      this.players[playerId].removeCard(card.id);
    } else {
      this.players[playerId].returnCardToHand(card.id);
    }
  }

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
