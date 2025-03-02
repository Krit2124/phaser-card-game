import Phaser from "phaser";
import { deck28 } from "@/shared/constants";
import { Card, SceneBackground } from "@/shared/types";
import UnplayedDeck from "./elements/UnplayedDeck";
import InteractiveTable from "./elements/InteractiveTable";
import { cardsSizes } from "../constants/cardsSizes";
import PlayerHand from "./elements/PlayerHand";
import { ATTACKER, DEFENDER, SUPPORT } from "../constants/playerRoles";
import PlayedDeck from "./elements/PlayedDeck";
import RestartButton from "./elements/RestartButton";

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
  private playedDeck!: PlayedDeck;
  private restartButton!: RestartButton;

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

    this.load.image("support", "/img/icons/support.svg");
    this.load.image("defender", "/img/icons/defender.svg");
    this.load.image("attacker", "/img/icons/attacker.svg");

    this.load.image("crown", "/img/icons/crown.svg");
    this.load.image("restart", "/img/icons/restart.svg");

    this.load.image("background", this.background.image);
  }

  create() {
    const { width, height } = this.scale;
    // Для отступов по краям берём половину карточки и ещё немного
    const marginFromSceneBorders = cardsSizes.height * 0.75;

    this.add.tileSprite(0, 0, width, height, "background").setOrigin(0, 0);

    this.unplayedDeck = new UnplayedDeck(this, 200, height / 2);

    this.playedDeck = new PlayedDeck(this, width - 200, height / 2);

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
      playerHand.on("checkEndOfTurn", this.checkEndOfTurnByPass, this);
      tempPlayers.push(playerHand);
    }
    this.players = tempPlayers;

    for (let i = 0; i < this.playersAmount; i++) {
      const CardsForPlayer = this.unplayedDeck.getCards(4);
      this.players[i].addCards(CardsForPlayer);
    }

    this.restartButton = new RestartButton({
      scene: this,
      restartFunction: () => this.restartGame(),
    });

    this.startTurn()
  }

  private startTurn() {
    // Поиск игрока с тремя картами одного ранга
    // Если их несколько, то выбираем того, у кого эти карты наибольшего ранга
    let playerWithThreeCardsOfSameRank: {
      playerId: number;
      rank: number;
    } = { playerId: -1, rank: -1 };

    this.players.forEach((player) => {
      const ranks = player.cards.map((card) => card.rank);

      // Количество карт каждого ранга
      const rankCounts = new Map<number, number>();
      ranks.forEach((rank) => {
        rankCounts.set(rank, (rankCounts.get(rank) || 0) + 1);
      });

      // Максимальный ранг, у которого есть хотя бы три карты
      let maxRankForPlayer = -1;
      rankCounts.forEach((count, rank) => {
        if (count >= 3 && rank > maxRankForPlayer) {
          maxRankForPlayer = rank;
        }
      });

      // Если у игрока есть три карты одного ранга,
      // сравниваем с текущим максимальным
      if (maxRankForPlayer !== -1) {
        if (
          !playerWithThreeCardsOfSameRank ||
          maxRankForPlayer > playerWithThreeCardsOfSameRank.rank
        ) {
          playerWithThreeCardsOfSameRank = {
            playerId: player.playerId,
            rank: maxRankForPlayer,
          };
        }
      }
    });

    // Определение атакующего игрока
    let attackerId: number;
    if (playerWithThreeCardsOfSameRank.playerId !== -1) {
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

  private checkEndOfTurnByPass() {
    const isAllPlayersPassed = this.players.every((player) => player.isPassed);

    if (isAllPlayersPassed) {
      this.endTurn();
    }
  }

  private checkEndOfTurnByDefenderAmountOfCards() {
    const isDefenderOutOfCards =
      this.players[this.defendingPlayerId].cards.length === 0;

    if (isDefenderOutOfCards) {
      this.endTurn();
    }
  }

  private endTurn() {
    // Убираем возможность окончить ход у всех игроков
    // * Именно здесь, чтобы в конце игры не оставались кнопки "Пропустить ход"
    this.players.forEach((player) => {
      player.setIsPassed(false, false);
    });

    const defender = this.players[this.defendingPlayerId];
    const penaltyCards =
      this.interactiveTable.attackCardsDataOnTable.length -
      this.interactiveTable.defenseCardsDataOnTable.length;

    // Если есть штрафные карты, то сначала выдаём карты защищающемуся
    if (penaltyCards > 0) {
      const cardsToGive = Math.max(4 - defender.cards.length, 0) + penaltyCards;
      const newCards = this.unplayedDeck.getCards(cardsToGive);
      defender.addCards(newCards);
    }

    // Определяем порядок раздачи карт атакующему и подкидывающим игрокам
    const attackersOrder: PlayerHand[] = [];

    // Находим атакующего игрока
    const attacker = this.players.find((player) => player.role === ATTACKER);
    if (attacker) {
      attackersOrder.push(attacker);
    }

    // Находим подкидывающих игроков справа от защищающегося
    let currentIndex = this.defendingPlayerId + 1;
    while (attackersOrder.length < this.playersAmount - 1) {
      // Переходим на начало списка, если вышли за его пределы
      if (currentIndex >= this.playersAmount) {
        currentIndex = 0;
      }

      const player = this.players[currentIndex];
      if (player.role === SUPPORT) {
        attackersOrder.push(player);
      }

      currentIndex++;
    }
    // Выдаём карты атакующему и подкидывающим
    for (const player of attackersOrder) {
      const cardsToGive = 4 - player.cards.length;
      if (cardsToGive > 0) {
        const newCards = this.unplayedDeck.getCards(cardsToGive);
        player.addCards(newCards);
      }
    }

    // Выдаём карты защищающемуся, если штрафных карт не было
    if (penaltyCards === 0) {
      const cardsToGive = 4 - defender.cards.length;
      const newCards = this.unplayedDeck.getCards(cardsToGive);
      defender.addCards(newCards);
    }

    const removedCardsAmount = this.interactiveTable.removeAllCards();

    this.playedDeck.addCards(removedCardsAmount);

    const switchRolesStep = penaltyCards > 0 ? 2 : 1;
    for (let i = 0; i < switchRolesStep; i++) {
      this.defendingPlayerId =
        this.defendingPlayerId < this.playersAmount - 1
          ? this.defendingPlayerId + 1
          : 0;
    }

    const isThereWinners = this.checkWinners();

    if (isThereWinners) {
      this.endGame();
    } else {
      this.startTurn();
    }
  }

  private checkWinners(): boolean {
    let isThereWinners = false;
    this.players.forEach((player) => {
      if (player.cards.length === 0) {
        player.setWinner(true);
        isThereWinners = true;
      }
    });
    return isThereWinners;
  }

  private endGame() {
    // Блокируем возможность класть карты дальше
    this.interactiveTable.isGameOver = true;

    this.restartButton.setButtonVisible(true);
  }

  private restartGame() {
    this.scene.restart();
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

      if (playerRole === DEFENDER) {
        this.checkEndOfTurnByDefenderAmountOfCards();
      }
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
