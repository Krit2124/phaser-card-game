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
  private maxCardsForThisTurn: number = 4;

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

    this.interactiveTable = new InteractiveTable({
      scene: this,
      sceneWidth: width,
      sceneHeight: height,
      marginFromSceneBorders,
    });

    const playersPositions = this.calculatePlayersPositions(width, height);

    // Временный массив для игроков, так как push в this.players вызывает ошибку
    const tempPlayers = [];
    for (let i = 0; i < this.playersAmount; i++) {
      const playerHand = new PlayerHand({
        scene: this,
        x: playersPositions[i].x,
        y: playersPositions[i].y,
        angle: playersPositions[i].angle,
        playerId: i,
      });
      playerHand.on("cardPlayed", this.handleCardPlayed, this);
      playerHand.on("checkEndOfTurn", this.checkEndOfTurn, this);
      tempPlayers.push(playerHand);
    }
    this.players = tempPlayers;

    for (let i = 0; i < this.playersAmount; i++) {
      const CardsForPlayer = this.unplayedDeck.getCards(4);
      this.players[i].addCards(CardsForPlayer);
    }

    this.startTurn();
  }

  update() {}

  private startTurn() {
    // Проверяем, есть ли у кого-нибудь из игроков 3 карты одного ранга
    const playerWithThreeCardsOfSameRank = this.players.find((player) => {
      const ranks = player.cards.map((card) => card.rank);
      const amountOfEachRank = new Map<number, number>();
      ranks.forEach((rank) => {
        amountOfEachRank.set(rank, (amountOfEachRank.get(rank) || 0) + 1);
      });
      return Array.from(amountOfEachRank.values()).some((value) => {
        return value >= 3;
      });
    });

    // Определение атакующего игрока
    let attackerId: number;
    if (playerWithThreeCardsOfSameRank) {
      // Игрок с 3 картами одного ранга атакует, что переопределяет и защищающегося
      attackerId = playerWithThreeCardsOfSameRank.playerId;
      this.defendingPlayerId =
        attackerId < this.playersAmount - 1 ? attackerId + 1 : 0;
    } else {
      // По обычным правилам: игрок перед атакующим
      attackerId =
        this.defendingPlayerId > 0
          ? this.defendingPlayerId - 1
          : this.playersAmount - 1;
    }

    // Распределение ролей остальных игроков
    this.players.forEach((player, index) => {
      if (index === this.defendingPlayerId) {
        this.players[this.defendingPlayerId].setRole(DEFENDER);
      } else if (index === attackerId) {
        player.setRole(ATTACKER);
      } else {
        player.setRole(SUPPORT);
      }
      player.playedCardsOnTurn = 0;
      player.setIsPassed(false, false);
    });

    // Максимум может разыграться столько карт, сколько есть у защищающегося
    this.maxCardsForThisTurn =
      this.players[this.defendingPlayerId].cards.length;
  }

  private checkEndOfTurn() {
    const isAllPlayersPassed = this.players.every((player) => player.isPassed);

    if (isAllPlayersPassed) {
      this.endTurn();
    }
  }

  private endTurn() {
    // Раздача карт
    const attackers = this.players.filter(
      (player) => player.role === ATTACKER || player.role === SUPPORT
    );
    const defender = this.players[this.defendingPlayerId];
    const penaltyCards =
      this.interactiveTable.attackCardsDataOnTable.length -
      this.interactiveTable.defenseCardsDataOnTable.length;

    // Если есть штрафные карты, то сначала выдаём карты защищающемуся
    if (penaltyCards > 0) {
      const cardsToGive = 4 - defender.cards.length + penaltyCards;
      const newCards = this.unplayedDeck.getCards(cardsToGive);
      defender.addCards(newCards);
    }
    // Выдаём карты атакующим
    for (const player of attackers) {
      const cardsToGive = 4 - player.cards.length;
      const newCards = this.unplayedDeck.getCards(cardsToGive);
      player.addCards(newCards);
    }
    // Выдаём карты защищающемуся, если штрафных карт не было
    if (penaltyCards === 0) {
      const cardsToGive = 4 - defender.cards.length;
      const newCards = this.unplayedDeck.getCards(cardsToGive);
      defender.addCards(newCards);
    }

    this.interactiveTable.removeAllCards();

    const switchRolesStep = penaltyCards > 0 ? 2 : 1;
    for (let i = 0; i < switchRolesStep; i++) {
      this.defendingPlayerId =
        this.defendingPlayerId < this.playersAmount - 1
          ? this.defendingPlayerId + 1
          : 0;
    }

    this.startTurn();
  }

  private handleCardPlayed(
    card: Card,
    playerId: number,
    playerRole: string,
    x: number,
    y: number
  ) {
    let isAdded = false;
    const player = this.players[playerId];

    // Добавление карты на стол в зависимости от роли игрока
    if (
      playerRole === ATTACKER ||
      (playerRole === SUPPORT &&
        this.interactiveTable.attackCardsDataOnTable.length > 0)
    ) {
      if (
        this.maxCardsForThisTurn >
          this.interactiveTable.attackCardsDataOnTable.length &&
        player.playedCardsOnTurn < 3
      ) {
        isAdded = this.interactiveTable.addAttackCard(card);
      }
    } else if (playerRole === DEFENDER) {
      isAdded = this.interactiveTable.addDefenseCard(card, x, y);
    }

    // Если карту добавили на стол, то удаляем её из руки игрока, иначе возвращаем в руку
    if (isAdded) {
      player.playedCardsOnTurn += 1;
      player.removeCard(card.id);

      // Возвращаем всем игрокам возможность пропустить ход
      this.players.forEach((player) => {
        player.setIsPassed(false, true);
      });
    } else {
      player.returnCardToHand(card.id);
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
