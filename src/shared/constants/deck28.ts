import { Card } from "../types";
import { deck52 } from "./deck52";

// Колода с шестёрок до тузов без восьмёрок и девяток
export const deck28: Card[] = deck52.filter((card) => {
  if (card.rank < 6 || card.rank === 8 || card.rank === 9) {
    return;
  }
  return card;
})