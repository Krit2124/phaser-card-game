import { Card } from "@/shared/types";
import { cardsSizes } from "../../constants/cardsSizes";

// Уменьшенные размеры карт на столе, чтобы им хватило места
const cardsOnTableSizes = {
  width: cardsSizes.width * 0.75,
  height: cardsSizes.height * 0.75,
};

export default class InteractiveTable extends Phaser.GameObjects.Container {
  private tableBorders!: Phaser.GameObjects.Rectangle;
  private cardsPositions = this.calculateCardsPositions();

  // Карты, которые кинули защищающемуся игроку
  public attackCardsOnTable: Phaser.GameObjects.Image[] = [];
  public attackCardsDataOnTable: Card[] = [];

  // Карты, которыми защищающийся отбивается
  public defenseCardsOnTable: Phaser.GameObjects.Image[] = [];
  public defenseCardsDataOnTable: Card[] = [];

  constructor(
    scene: Phaser.Scene,
    sceneWidth: number,
    sceneHeight: number,
    marginFromSceneBorders: number
  ) {
    super(scene, sceneWidth / 2, sceneHeight / 2);

    this.width = sceneWidth;
    this.height = sceneHeight - marginFromSceneBorders * 2;

    this.tableBorders = scene.add
      .rectangle(0, 0, this.width, this.height)
      .setStrokeStyle(5, 0xff0000);
    this.add(this.tableBorders);

    this.setName("interactiveTable");
    scene.add.existing(this);
  }

  public addAttackCard(card: Card): boolean {
    if (this.attackCardsOnTable.length >= 6) {
      return false;
    }

    const cardPosition = this.cardsPositions[this.attackCardsOnTable.length];
    const tableCard = this.scene.add
      .image(cardPosition.x, cardPosition.y, card.image)
      .setDisplaySize(cardsOnTableSizes.width, cardsOnTableSizes.height);

    this.attackCardsOnTable.push(tableCard);
    this.attackCardsDataOnTable.push(card);
    this.add(tableCard);
    return true;
  }

  public addDefenseCard(defenseCard: Card, x: number, y: number): boolean {
    // Ищем карту, на которую навёлся игрок
    const cardToBeatImage = this.attackCardsOnTable.find((card) =>
      card.getBounds().contains(x, y)
    );

    if (!cardToBeatImage) {
      return false;
    }

    // Проверяем, можно ли отбиться этой картой и добавляем, если да
    const cardToBeatIndex = this.attackCardsOnTable.indexOf(cardToBeatImage);
    const cardToBeatData = this.attackCardsDataOnTable[cardToBeatIndex];
    if (this.canBeatCard(cardToBeatData, defenseCard)) {
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
    } else {
      return false;
    }

    return true;
  }

  public canBeatCard(attackingCard: Card, defendingCard: Card): boolean {
    return defendingCard.rank < attackingCard.rank;
  }

  public removeAllCards() {
    this.attackCardsOnTable.forEach((card) => card.destroy());
    this.attackCardsOnTable = [];
    this.attackCardsDataOnTable = [];
  }

  // Получение сетки 3x2 для карт
  public calculateCardsPositions() {
    // Расстояние между картами
    const offsetX = cardsOnTableSizes.width + 50;
    const offsetY = cardsOnTableSizes.height + 50;

    // Начальная позиция
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
