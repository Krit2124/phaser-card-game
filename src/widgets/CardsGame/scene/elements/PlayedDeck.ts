import { cardsSizes } from "../../constants/cardsSizes";

export default class PlayedDeck extends Phaser.GameObjects.Container {
  private cardImages: Phaser.GameObjects.Image[] = [];
  public cardsCount: number = 0;

  private playedCardsText!: Phaser.GameObjects.Text;
  private playedCardsBackground!: Phaser.GameObjects.Arc;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y);

    this.playedCardsBackground = scene.add
      .circle(0, 0, 50, 0x000000)
      .setStrokeStyle(5, 0xffffff)
      .setVisible(false);
    this.add(this.playedCardsBackground);

    this.playedCardsText = this.scene.add
      .text(0, 0, String(this.cardsCount), {
        fontSize: "64px",
        fontFamily: "Roboto",
        fontStyle: "bold",
      })
      .setOrigin(0.5)
      .setVisible(false);
    this.add(this.playedCardsText);

    this.scene.add.existing(this);
  }

  public addCards(amount: number) {
    for (let i = 0; i < amount; i++) {
      const offsetX = Phaser.Math.Between(-10, 10);
      const offsetY = Phaser.Math.Between(-10, 10);
      const rotation = Phaser.Math.Between(-5, 5) * (Math.PI / 180);

      const cardImage = this.scene.add
        .image(offsetX, offsetY, "card_back")
        .setDisplaySize(cardsSizes.width, cardsSizes.height)
        .setRotation(rotation);

      this.add(cardImage);
      this.cardImages.push(cardImage);
      this.cardsCount++;
    }

    this.playedCardsBackground.setVisible(true);
    this.playedCardsText.setVisible(true);
    this.playedCardsText.setText(String(this.cardsCount));

    this.bringToTop(this.playedCardsBackground);
    this.bringToTop(this.playedCardsText);
  }

  public clear() {
    this.cardImages.forEach((card) => card.destroy());
    this.cardImages = [];
    this.cardsCount = 0;
  }
}
