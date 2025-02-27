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
      .image(x, y, "card_back")
      .setSize(cardsSizes.width, cardsSizes.height)
      .setDisplaySize(cardsSizes.width, cardsSizes.height);

    this.availableCardsBackground = scene.add
      .circle(x, y, 50, 0x353535)
      .setStrokeStyle(5, 0xffffff);

    this.availableCardsText = this.scene.add
      .text(x, y, String(this.availableCards), {
        fontSize: "64px",
        fontFamily: "Roboto",
        fontStyle: "bold",
      })
      .setOrigin(0.5);

    this.shuffleCards();
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
