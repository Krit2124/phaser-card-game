import { deck28 } from "@/shared/constants";
import { cardsSizes } from "../../constants/cardsSizes";
import { Card } from "@/shared/types";

export default class UnplayedDeck extends Phaser.GameObjects.Container {
  // Глубокая копия массива с картами
  public localDeck = JSON.parse(JSON.stringify(deck28));

  private deckImage: Phaser.GameObjects.Image;
  private availableCardsAmountText!: Phaser.GameObjects.Text;
  private availableCardsAmountBackground!: Phaser.GameObjects.Arc;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y);

    this.deckImage = this.scene.add
      .image(0, 0, "card_back")
      .setDisplaySize(cardsSizes.width, cardsSizes.height);
    this.add(this.deckImage);

    this.availableCardsAmountBackground = scene.add
      .circle(0, 0, 50, 0x000000)
      .setStrokeStyle(5, 0x770000);
    this.add(this.availableCardsAmountBackground);

    this.availableCardsAmountText = this.scene.add
      .text(0, 0, String(this.localDeck.length), {
        fontSize: "64px",
        fontFamily: "Roboto",
        fontStyle: "bold",
      })
      .setOrigin(0.5);
    this.add(this.availableCardsAmountText);

    this.shuffleCards();

    this.scene.add.existing(this);
  }

  public shuffleCards() {
    this.localDeck = this.localDeck.sort(() => Math.random() - 0.5);
  }

  public getCards(amount: number) {
    const cardsToGive: Card[] = [];

    for (let i = 0; i < amount && this.localDeck.length > 0; i++) {
      const newCard = this.localDeck.shift();
      cardsToGive.push(newCard);
    }
    this.availableCardsAmountText.setText(String(this.localDeck.length));

    return cardsToGive;
  }
}
