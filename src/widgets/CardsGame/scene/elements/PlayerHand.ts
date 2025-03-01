import { Card } from "@/shared/types";
import { cardsSizes } from "../../constants/cardsSizes";
import { SUPPORT } from "../../constants/playerRoles";

interface PlayerHandOptions {
  scene: Phaser.Scene;
  x: number;
  y: number;
  angle: number;
  playerId: number;
}

export default class PlayerHand extends Phaser.GameObjects.Container {
  public playerId: number;

  public role: string = SUPPORT;
  private roleIcon!: Phaser.GameObjects.Image;
  private roleIconBackground!: Phaser.GameObjects.Arc;

  public cards: Card[] = [];
  private cardsImages: Phaser.GameObjects.Image[] = [];
  private initialCardPositions: { x: number; y: number }[] = [];

  public isPassed: boolean = false;
  private passButton: Phaser.GameObjects.Text;
  public playedCardsOnTurn: number = 0;

  public isWinner: boolean = false;
  private winnerIcon!: Phaser.GameObjects.Image;
  private winnerIconBackground!: Phaser.GameObjects.Arc;

  constructor({ scene, x, y, angle, playerId }: PlayerHandOptions) {
    super(scene, x, y);

    this.playerId = playerId;

    const upperElementsOffsetX = 70
    const upperElementsOffsetY = -cardsSizes.height / 2 - 30

    this.passButton = this.scene.add
      .text(-upperElementsOffsetX, upperElementsOffsetY, "Пропустить ход", {
        fontFamily: "Roboto",
        fontSize: "24px",
        color: "#ffffff",
        backgroundColor: "#000000",
        padding: { x: 10, y: 5 },
      })
      .setOrigin(0.5)
      .setInteractive({ cursor: "pointer" })
      .setVisible(false)
      .setRotation(angle);
    this.passButton.on("pointerdown", () =>
      this.setIsPassed(true, false, true)
    );
    this.add(this.passButton);

    this.roleIconBackground = scene.add
      .circle(upperElementsOffsetX, upperElementsOffsetY, 25, 0x000000)
      .setStrokeStyle(3, 0xffffff);
    this.add(this.roleIconBackground);

    this.roleIcon = this.scene.add
      .image(upperElementsOffsetX, upperElementsOffsetY, this.role)
      .setScale(0.2)
      .setRotation(angle);
    this.add(this.roleIcon);

    this.winnerIconBackground = scene.add
      .circle(0, -150, 100, 0x000000)
      .setStrokeStyle(6, 0xffffff)
      .setVisible(false);
    this.add(this.winnerIconBackground);

    this.winnerIcon = this.scene.add
      .image(0, -150, "crown")
      .setScale(0.8)
      .setRotation(angle)
      .setVisible(false);
    this.add(this.winnerIcon);

    scene.add.existing(this);
    this.rotation = angle;
  }

  public setRole(role: string) {
    this.role = role;
    this.roleIcon.setTexture(role);
  }

  public setIsPassed(
    isPassed: boolean,
    isPassButtonVisible: boolean,
    shouldCheckForEndOfTurn: boolean = false
  ) {
    this.isPassed = isPassed;
    this.passButton.setVisible(isPassButtonVisible);
    if (shouldCheckForEndOfTurn) {
      this.emit("checkEndOfTurn");
    }
  }

  public setWinner(isWinner: boolean = true) {
    this.isWinner = isWinner;
    this.winnerIconBackground.setVisible(isWinner);
    this.winnerIcon.setVisible(isWinner);

    this.bringToTop(this.winnerIconBackground);
    this.bringToTop(this.winnerIcon);
  }

  public addCards(newCards: Card[]) {
    for (const card of newCards) {
      this.cards = [...this.cards, card];

      const cardImage = this.scene.add
        .image(0, 0, card.image)
        .setDisplaySize(cardsSizes.width, cardsSizes.height)
        .setInteractive({ cursor: "pointer" });
      this.add(cardImage);
      this.cardsImages.push(cardImage);

      this.initialCardPositions.push({ x: this.x, y: this.y });

      this.scene.input.setDraggable(cardImage);
      this.setupCardDragEvents(cardImage, card.id);
    }

    this.updateCardsPositions();
  }

  public removeCard(id: number) {
    const index = this.cards.findIndex((card) => card.id === id);

    this.cards.splice(index, 1);
    this.cardsImages[index].destroy();
    this.cardsImages.splice(index, 1);
    this.initialCardPositions.splice(index, 1);

    this.updateCardsPositions();
  }

  private setupCardDragEvents(cardImage: Phaser.GameObjects.Image, id: number) {
    cardImage.on(
      "drag",
      (_pointer: Phaser.Input.Pointer, dragX: number, dragY: number) => {
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
        this.emit(
          "cardPlayed",
          this.cards.find((card) => card.id === id),
          this.playerId,
          this.role,
          pointer.x,
          pointer.y
        );
      } else {
        this.returnCardToHand(id);
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
    const cardOffsetX = 35; // Смещение по X между картами
    const cardOffsetY = 4; // Смещение по Y между картами
    const cardRotation = 0.08; // Угол поворота карт (в радианах)

    const totalCards = this.cards.length;

    const startX = -((totalCards - 1) * cardOffsetX) / 2;
    const startY = -((totalCards - 1) * cardOffsetY) / 2;

    this.cardsImages.forEach((card, index) => {
      const x = startX + index * cardOffsetX;
      const y = startY + index * cardOffsetY;

      const rotation =
        -((totalCards - 1) / 2) * cardRotation + index * cardRotation;

      card.setPosition(x, y);
      card.setRotation(rotation);

      this.initialCardPositions[index] = { x, y };
    });
  }
}
