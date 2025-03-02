import { Card } from "@/shared/types";
import { cardsSizes } from "../../constants/cardsSizes";

// Уменьшенные размеры карт на столе, чтобы им хватило места
const cardsOnTableSizes = {
  width: cardsSizes.width * 0.75,
  height: cardsSizes.height * 0.75,
};

interface InteractiveTableOptions {
  scene: Phaser.Scene;
  marginFromSceneBorders: number;
}

export default class InteractiveTable extends Phaser.GameObjects.Container {
  private tableBorders!: Phaser.GameObjects.Rectangle;
  private cardsPositions = this.calculateCardsPositions();

  // Карты, которые кинули защищающемуся игроку
  public attackCardsOnTable: Phaser.GameObjects.Image[] = [];
  public attackCardsDataOnTable: Card[] = [];

  // Карты, которыми защищающийся отбивается
  public defenseCardsOnTable: Phaser.GameObjects.Image[] = [];
  public defenseCardsDataOnTable: Card[] = [];

  // Флаг, блокирующий возможность добавлять карты на стол
  public isGameOver = false;

  constructor({ scene, marginFromSceneBorders }: InteractiveTableOptions) {
    const { width: sceneWidth, height: sceneHeight } = scene.scale;

    super(scene, sceneWidth / 2, sceneHeight / 2);

    this.width = sceneWidth;
    this.height = sceneHeight - marginFromSceneBorders * 2;

    this.tableBorders = scene.add.rectangle(0, 0, this.width, this.height);
    this.add(this.tableBorders);

    this.setName("interactiveTable");
    scene.add.existing(this);
  }

  public canAttackCardBeAdded(newCard: Card): boolean {
    return (
      // Сразу false, если для карт нет места или игра закончилась
      this.attackCardsOnTable.length < 6 &&
      !this.isGameOver &&
      // Если это первая карта, то она может быть любой
      (this.attackCardsOnTable.length === 0 ||
        // Для последующий нужно, чтобы карта того же ранга была разыграна на столе
        this.attackCardsDataOnTable.some(
          (card) => card.rank === newCard.rank
        ) ||
        this.defenseCardsDataOnTable.some((card) => card.rank === newCard.rank))
    );
  }

  /**
   * Добавление атакующей карты. Если возвращается false, значит карта не была добавлена.
   */
  public addAttackCard(newCard: Card): boolean {
    if (!this.canAttackCardBeAdded(newCard)) return false;

    this.attackCardsDataOnTable.push(newCard);

    const cardPosition = this.cardsPositions[this.attackCardsOnTable.length];

    const tableCard = this.scene.add
      .image(cardPosition.x, cardPosition.y, newCard.image)
      .setDisplaySize(cardsOnTableSizes.width, cardsOnTableSizes.height);
    this.attackCardsOnTable.push(tableCard);
    this.add(tableCard);

    return true;
  }

  public canCardBeatCard(attackingCard: Card, defendingCard: Card): boolean {
    return defendingCard.rank < attackingCard.rank;
  }

  /**
   * Добавление защищающей карты. Если возвращается false, значит карта не была добавлена.
   */
  public addDefenseCard(defenseCard: Card, x: number, y: number): boolean {
    if (this.isGameOver) return false;

    // Ищем карту, на которую навёлся игрок
    const cardToBeatImage = this.attackCardsOnTable.find((card) =>
      card.getBounds().contains(x, y)
    );
    if (!cardToBeatImage) return false;

    const cardToBeatIndex = this.attackCardsOnTable.indexOf(cardToBeatImage);
    const cardToBeatData = this.attackCardsDataOnTable[cardToBeatIndex];

    if (!this.canCardBeatCard(cardToBeatData, defenseCard)) return false;

    const defenseCardImagePosition = cardToBeatImage.getCenter();
    const defenseCardImage = this.scene.add
      .image(
        defenseCardImagePosition.x + 30,
        defenseCardImagePosition.y + 30,
        defenseCard.image
      )
      .setDisplaySize(cardsOnTableSizes.width, cardsOnTableSizes.height)
      .setDepth(1);
    this.add(defenseCardImage);

    this.defenseCardsOnTable.push(defenseCardImage);
    this.defenseCardsDataOnTable.push(defenseCard);

    return true;
  }

  /**
   * Удаление всех разыгранных за ход карт. Возврат количества удалённых карт
   */
  public removeAllCards() {
    const amountOfCardsToRemove =
      this.attackCardsOnTable.length + this.defenseCardsOnTable.length;

    this.attackCardsOnTable.forEach((card) => card.destroy());
    this.attackCardsOnTable = [];
    this.attackCardsDataOnTable = [];

    this.defenseCardsOnTable.forEach((card) => card.destroy());
    this.defenseCardsOnTable = [];
    this.defenseCardsDataOnTable = [];

    return amountOfCardsToRemove;
  }

  // Получение сетки 3x2 для карт
  public calculateCardsPositions() {
    // Расстояние между картами
    const offsetX = cardsOnTableSizes.width + 50;
    const offsetY = cardsOnTableSizes.height + 50;

    // Начальная позиция для первой карты
    const startX = -offsetX;
    const startY = -offsetY / 2;

    return [
      { x: startX, y: startY },
      { x: 0, y: startY },
      { x: offsetX, y: startY },
      { x: startX, y: offsetY / 2 },
      { x: 0, y: offsetY / 2 },
      { x: offsetX, y: offsetY / 2 },
    ];
  }
}
