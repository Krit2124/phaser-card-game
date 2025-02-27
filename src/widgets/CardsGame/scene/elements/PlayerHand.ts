import { Card } from "@/shared/types";
import { cardsSizes } from "../../constants/cardsSizes";
import { SUPPORT } from "../../constants/playerRoles";

export default class PlayerHand extends Phaser.GameObjects.Container {
  private playerId: number;
  public role: string = SUPPORT;
  private cardOffsetX: number = 35; // Смещение по X между картами
  private cardOffsetY: number = 4; // Смещение по Y между картами
  private cardRotation: number = 0.08; // Угол поворота карт (в радианах)

  public cards: Card[] = [];
  private cardsImages: Phaser.GameObjects.Image[] = [];
  private initialCardPositions: { x: number; y: number }[] = [];

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    angle: number,
    playerId: number
  ) {
    super(scene, x, y);

    this.playerId = playerId;

    scene.add.existing(this);
    this.rotation = angle;
  }

  public setRole(role: string) {
    this.role = role;
  }

  public addCard(card: Card) {
    this.cards = [...this.cards, card];

    const cardImage = this.scene.add
      .image(0, 0, card.image)
      .setDisplaySize(cardsSizes.width, cardsSizes.height)
      .setInteractive({ cursor: "pointer" });
    this.add(cardImage);
    this.cardsImages.push(cardImage);

    this.initialCardPositions.push({ x: this.x, y: this.y });

    this.scene.input.setDraggable(cardImage);
    this.setupCardDragEvents(cardImage, this.cardsImages.length - 1);

    this.updateCardsPositions();

    this.scene.add.existing(this);
  }

  public removeCard(id: number) {
    const index = this.cards.findIndex((card) => card.id === id);

    this.cards.splice(index, 1);
    this.cardsImages[index].destroy();
    this.cardsImages.splice(index, 1);

    this.updateCardsPositions();
  }

  private setupCardDragEvents(
    cardImage: Phaser.GameObjects.Image,
    index: number
  ) {
    cardImage.on(
      "drag",
      (pointer: Phaser.Input.Pointer, dragX: number, dragY: number) => {
        cardImage.x = dragX;
        cardImage.y = dragY;
      }
    );

    // Завершение перетаскивания
    cardImage.on("dragend", (pointer: Phaser.Input.Pointer) => {
      const table = this.scene.children.getByName(
        "interactiveTable"
      ) as Phaser.GameObjects.Zone;

      if (table && table.getBounds().contains(pointer.x, pointer.y)) {
        // Карта перетащена на стол
        // Вызываем событие из основной сцены на размещение карты на столе
        this.emit(
          "cardPlayed",
          this.cards[index],
          this.playerId,
          this.role,
          pointer.x,
          pointer.y
        );
      } else {
        // Возвращаем карту на место
        this.returnCardToHand(this.cards[index].id);
      }
    });
  }

  public returnCardToHand(cardId: number) {
    const index = this.cards.findIndex((card) => card.id === cardId);
    const cardImage = this.cardsImages[index];
    const initialPosition = this.initialCardPositions[index];

    this.scene.tweens.add({
      targets: cardImage,
      x: initialPosition.x,
      y: initialPosition.y,
      duration: 200,
      ease: "Power2",
    });
  }

  private updateCardsPositions() {
    const totalCards = this.cards.length;

    const startX = -((totalCards - 1) * this.cardOffsetX) / 2;
    const startY = -((totalCards - 1) * this.cardOffsetY) / 2;

    this.cardsImages.forEach((card, index) => {
      const x = startX + index * this.cardOffsetX;
      const y = startY + index * this.cardOffsetY;

      const rotation =
        -((totalCards - 1) / 2) * this.cardRotation + index * this.cardRotation;

      card.setPosition(x, y);
      card.setRotation(rotation);

      this.initialCardPositions[index] = { x, y };
    });
  }
}
