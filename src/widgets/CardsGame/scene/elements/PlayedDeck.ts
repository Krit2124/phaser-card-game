import { cardsSizes } from "../../constants/cardsSizes";

export default class PlayedDeck extends Phaser.GameObjects.Container {
  public cardsCount: number = 0;
  private cardsGroup!: Phaser.GameObjects.Group;

  private playedCardsAmountText!: Phaser.GameObjects.Text;
  private playedCardsAmountBackground!: Phaser.GameObjects.Arc;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y);

    this.cardsGroup = this.scene.add.group();

    this.playedCardsAmountBackground = scene.add
      .circle(0, 0, 50, 0x000000)
      .setStrokeStyle(5, 0x770000)
      .setVisible(false);
    this.add(this.playedCardsAmountBackground);

    this.playedCardsAmountText = this.scene.add
      .text(0, 0, String(this.cardsCount), {
        fontSize: "64px",
        fontFamily: "Roboto",
        fontStyle: "bold",
      })
      .setOrigin(0.5)
      .setVisible(false);
    this.add(this.playedCardsAmountText);

    this.scene.add.existing(this);
  }

  public addCards(amount: number) {
    for (let i = 0; i < amount; i++) {
      const offsetX = Phaser.Math.Between(-20, 20);
      const offsetY = Phaser.Math.Between(-15, 15);
      const rotation = Phaser.Math.Between(-10, 10) * (Math.PI / 180);

      const cardImage = this.scene.add
        .image(offsetX, offsetY, "card_back")
        .setDisplaySize(cardsSizes.width, cardsSizes.height)
        .setRotation(rotation);

      this.add(cardImage);
      this.cardsGroup.add(cardImage);
    }

    this.updateCardsAmount(amount);
  }

  public updateCardsAmount(amount: number) {
    this.cardsCount += amount;

    this.playedCardsAmountBackground.setVisible(true);
    this.playedCardsAmountText.setVisible(true);
    this.playedCardsAmountText.setText(String(this.cardsCount));

    this.bringToTop(this.playedCardsAmountBackground);
    this.bringToTop(this.playedCardsAmountText);
  }
}
