import { Card } from "@/shared/types";
import { cardsSizes } from "../../constants/cardsSizes";

export default class PlayerHand extends Phaser.GameObjects.Container {
  public cards: Card[] = [];
  private cardOffsetX: number = 30; // Смещение по X между картами
  private cardOffsetY: number = 4; // Смещение по Y между картами
  private cardRotation: number = 0.08; // Угол поворота карт (в радианах)

  private cardsImages: Phaser.GameObjects.Image[] = [];

  constructor(scene: Phaser.Scene, x: number, y: number, angle: number) {
    super(scene, x, y);
    scene.add.existing(this);
    this.rotation = angle;
  }

  public addCard(card: Card) {
    this.cards.push(card);

    const cardImage = this.scene.add
      .image(0, 0, card.image)
      .setSize(cardsSizes.width, cardsSizes.height)
      .setDisplaySize(cardsSizes.width, cardsSizes.height);
    this.add(cardImage);
    this.cardsImages.push(cardImage);

    this.updateFan();
  }

  private updateFan() {
    const totalCards = this.cards.length;

    const startX = -((totalCards - 1) * this.cardOffsetX) / 2;
    const startY = -((totalCards - 1) * this.cardOffsetY) / 2;

    this.cardsImages.forEach((card, index) => {
      // Позиция карты
      const x = startX + index * this.cardOffsetX;
      const y = startY + index * this.cardOffsetY;

      // Угол поворота карты
      const rotation =
        -((totalCards - 1) / 2) * this.cardRotation + index * this.cardRotation;

      // Применяем позицию и поворот
      card.setPosition(x, y);
      card.setRotation(rotation);
    });
  }
}
