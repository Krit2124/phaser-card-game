import { deck28 } from "@/shared/constants";
import { cardsSizes } from "../../constants/cardsSizes";

export default class UnplayedDeck extends Phaser.GameObjects.Container {
  public availableCards = 28;
  private localDeck = deck28;

  private deckImage: Phaser.GameObjects.Image;
  private availableCardsText!: Phaser.GameObjects.Text;
  private availableCardsBackground!: Phaser.GameObjects.Arc;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y);

    this.deckImage = this.scene.add
      .image(0, 0, "card_back")
      .setDisplaySize(cardsSizes.width, cardsSizes.height);
    this.add(this.deckImage);

    this.availableCardsBackground = scene.add
      .circle(0, 0, 50, 0x353535)
      .setStrokeStyle(5, 0xffffff);
    this.add(this.availableCardsBackground);

    this.availableCardsText = this.scene.add
      .text(0, 0, String(this.availableCards), {
        fontSize: "64px",
        fontFamily: "Roboto",
        fontStyle: "bold",
      })
      .setOrigin(0.5);
    this.add(this.availableCardsText);

    this.shuffleCards();

    this.scene.add.existing(this);
  }

  public shuffleCards() {
    this.localDeck = this.localDeck.sort(() => Math.random() - 0.5);
  }

  public getCards(amount: number) {
    this.availableCards -= amount;
    this.availableCardsText.setText(String(this.availableCards));
    return this.localDeck.splice(0, amount);
  }
}
