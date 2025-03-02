import Phaser from "phaser";
import { deck28 } from "@/shared/constants";
import { Card, SceneBackground } from "@/shared/types";
import UnplayedDeck from "./elements/UnplayedDeck";
import InteractiveTable from "./elements/InteractiveTable";
import { cardsSizes } from "../constants/cardsSizes";
import PlayerHand from "./elements/PlayerHand";
import { ATTACKER, DEFENDER, SUPPORT } from "../constants/playerRoles";
import PlayedDeck from "./elements/PlayedDeck";
import RestartButton from "./ui/RestartButton";
import {
  findNextPlayerIndex,
  findPrevPlayerIndex,
} from "../lib/findNextOrPrevPlayer";
import { calculatePlayersPositions } from "../lib/calculatePlayersPosition";

interface CardsGameSceneConfig {
  playersAmount: number;
  background: SceneBackground;
}

export class CardsGameScene extends Phaser.Scene {
  private playersAmount: number;
  private background: SceneBackground;
  private backgroundTileSprite!: Phaser.GameObjects.TileSprite;

  private unplayedDeck!: UnplayedDeck;
  private interactiveTable!: InteractiveTable;
  private players: PlayerHand[] = [];
  private playedDeck!: PlayedDeck;
  private restartButton!: RestartButton;

  private defendingPlayerId: number = 1;
  private maxCardsForThisTurn: number = 4;

  // Максимальное количество карт на руке при нормальных условиях
  private normalCardsAmountOnHand: number = 4;

  // Массив с рангами карт, которые уже дали какому-либо игроку дополнительный ход
  private cardRanksUsedForExtraTurn: number[] = [];
  private playerWithExtraTurnByCardRanks: {
    playerId: number;
    rank: number;
  } = { playerId: -1, rank: -1 };

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

    this.backgroundTileSprite = this.add.tileSprite(0, 0, width, height, "background")
    .setOrigin(0, 0)
    .setDepth(-1);

    this.unplayedDeck = new UnplayedDeck(this, 200, height / 2);

    this.playedDeck = new PlayedDeck(this, width - 200, height / 2);

    // Отступы для интерактивного стола
    const marginFromSceneBorders = cardsSizes.height * 0.75;
    this.interactiveTable = new InteractiveTable({
      scene: this,
      marginFromSceneBorders,
    });

    const playersPositions = calculatePlayersPositions(
      this.playersAmount,
      width,
      height
    );

    // Временный массив для игроков, так как push в this.players вызывает ошибки при перезагрузке игры
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

    // Раздача карт игрокам
    for (let i = 0; i < this.playersAmount; i++) {
      const CardsForPlayer = this.unplayedDeck.getCards(
        this.normalCardsAmountOnHand
      );
      this.players[i].addCards(CardsForPlayer);
    }

    this.restartButton = new RestartButton({
      scene: this,
      restartFunction: () => this.scene.restart(),
    });

    this.startTurn();

    window.addEventListener("resize", () => {
      this.resizeCanvasAndReplaceElements();
    });
  }

  private findPlayerWithThreeCardsOfSameRank() {
    // Поиск игроков с тремя картами одного ранга
    // Если есть несколько игроков с тремя картами одного ранга, выбираем того, у кого ранг этих карт выше
    this.playerWithExtraTurnByCardRanks = this.players.reduce(
      (result, player) => {
        const rankCounts = player.cards.reduce((counts, card) => {
          counts[card.rank] = (counts[card.rank] || 0) + 1;
          return counts;
        }, {} as Record<number, number>);

        const maxRank = Object.entries(rankCounts)
          .filter(([, count]) => count >= 3)
          .map(([rank]) => Number(rank))
          .sort((a, b) => b - a)[0];

        if (maxRank && !this.cardRanksUsedForExtraTurn.includes(maxRank)) {
          if (!result || maxRank > result.rank) {
            return { playerId: player.playerId, rank: maxRank };
          }
        }
        return result;
      },
      { playerId: -1, rank: -1 }
    );
  }

  private setPlayersRolesForTurnByDefenderId() {
    // Определение атакующего игрока
    let attackerId: number;
    if (this.playerWithExtraTurnByCardRanks.playerId !== -1) {
      // Игрок с 3 картами одного ранга атакует вне очереди, что переопределяет и защищающегося
      attackerId = this.playerWithExtraTurnByCardRanks.playerId;
      this.defendingPlayerId = findNextPlayerIndex(
        this.playersAmount,
        attackerId
      );

      this.cardRanksUsedForExtraTurn.push(
        this.playerWithExtraTurnByCardRanks.rank
      );
    } else {
      // По обычным правилам: игрок перед защищающимся атакует
      attackerId = findPrevPlayerIndex(
        this.playersAmount,
        this.defendingPlayerId
      );
    }

    // Распределение ролей остальных игроков и сброс значений
    // количества разыгранных карт на руке и статуса пропуска хода
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
  }

  private startTurn() {
    this.findPlayerWithThreeCardsOfSameRank();

    this.setPlayersRolesForTurnByDefenderId();

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

  private distributeCardsToPlayersAndSetDefenderForNextTurn() {
    const defender = this.players[this.defendingPlayerId];
    const penaltyCards =
      this.interactiveTable.attackCardsDataOnTable.length -
      this.interactiveTable.defenseCardsDataOnTable.length;

    // Если есть штрафные карты, то сначала выдаём карты защищающемуся
    if (penaltyCards > 0) {
      const cardsToGive =
        Math.max(this.normalCardsAmountOnHand - defender.cards.length, 0) +
        penaltyCards;
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
    let currentIndex = findNextPlayerIndex(
      this.playersAmount,
      this.defendingPlayerId
    );
    while (attackersOrder.length < this.playersAmount - 1) {
      const player = this.players[currentIndex];
      if (player.role === SUPPORT) {
        attackersOrder.push(player);
      }

      currentIndex = findNextPlayerIndex(this.playersAmount, currentIndex);
    }

    // Выдаём карты атакующему и подкидывающим
    for (const player of attackersOrder) {
      const cardsToGive = this.normalCardsAmountOnHand - player.cards.length;
      if (cardsToGive > 0) {
        const newCards = this.unplayedDeck.getCards(cardsToGive);
        player.addCards(newCards);
      }
    }

    // Выдаём карты защищающемуся, если штрафных карт не было
    if (penaltyCards === 0) {
      const cardsToGive = this.normalCardsAmountOnHand - defender.cards.length;
      const newCards = this.unplayedDeck.getCards(cardsToGive);
      defender.addCards(newCards);
    }

    const removedCardsAmount = this.interactiveTable.removeAllCards();

    this.playedDeck.addCards(removedCardsAmount);

    // Пропуск хода защищающегося игрока, если он отбил не все карты
    const switchRolesStep = penaltyCards > 0 ? 2 : 1;
    for (let i = 0; i < switchRolesStep; i++) {
      this.defendingPlayerId = findNextPlayerIndex(
        this.playersAmount,
        this.defendingPlayerId
      );
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

  private endTurn() {
    // Убираем возможность окончить ход у всех игроков
    // именно здесь, чтобы в конце игры не оставались кнопки "Пропустить ход"
    this.players.forEach((player) => {
      player.setIsPassed(false, false);
    });

    this.distributeCardsToPlayersAndSetDefenderForNextTurn();

    const isThereWinners = this.checkWinners();

    if (isThereWinners) {
      this.endGame();
    } else {
      this.startTurn();
    }
  }

  private endGame() {
    // Блокируем возможность класть карты дальше
    this.interactiveTable.isGameOver = true;

    this.restartButton.setButtonVisible(true);
  }

  private handleCardPlayed(
    card: Card,
    playerId: number,
    playerRole: string,
    x: number,
    y: number
  ) {
    let isCardAddedToTable = false;
    const player = this.players[playerId];

    // Добавление карты на стол в зависимости от роли игрока
    if (
      playerRole === ATTACKER ||
      // Для подкидывающего проверяем, что атакующий уже положил карту
      (playerRole === SUPPORT &&
        this.interactiveTable.attackCardsDataOnTable.length > 0)
    ) {
      // Проверяем, что игрок ещё не вышел за количество карт,
      // которые можно положить за этот ход в общем и для него конкретно
      if (
        this.maxCardsForThisTurn >
          this.interactiveTable.attackCardsDataOnTable.length &&
        player.playedCardsOnTurn < 3
      ) {
        isCardAddedToTable = this.interactiveTable.addAttackCard(card);
      }
    } else if (playerRole === DEFENDER) {
      isCardAddedToTable = this.interactiveTable.addDefenseCard(card, x, y);
    }

    // Если карту добавили на стол, то удаляем её из руки игрока, иначе возвращаем в руку
    if (isCardAddedToTable) {
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

  private resizeCanvasAndReplaceElements() {
    const width = window.innerWidth;
    const height = window.innerHeight;

    this.scale.resize(width, height);
    this.cameras.main.setSize(width, height);

    this.backgroundTileSprite.setSize(width, height);

    const newPlayersPositions = calculatePlayersPositions(
      this.playersAmount,
      width,
      height
    );

    this.players.forEach((player, index) => {
      player.setPosition(
        newPlayersPositions[index].x,
        newPlayersPositions[index].y
      );
    });

    this.playedDeck.setPosition(width - 200, height / 2);
    this.unplayedDeck.setPosition(200, height / 2);

    this.restartButton.setPosition(width / 2, height / 2);
  }

  destroy() {
    window.removeEventListener("resize", this.resizeCanvasAndReplaceElements);
  }
}
