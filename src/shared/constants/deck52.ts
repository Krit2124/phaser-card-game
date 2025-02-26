import { SUIT_CLUBS, SUIT_DIAMONDS, SUIT_HEARTS, SUIT_SPADES } from "./suits";

// Колода со всеми картами
// 11 — валет, 12 — дама, 13 — король, 14 — туз
export const deck52 = [
  ...[2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14].flatMap((rank, index) => [
    {
      id: index * 4 + 1,
      rank,
      suit: SUIT_HEARTS,
      image: `/img/deck/${rank}_of_hearts.png`,
    },
    {
      id: index * 4 + 2,
      rank,
      suit: SUIT_DIAMONDS,
      image: `/img/deck/${rank}_of_diamonds.png`,
    },
    {
      id: index * 4 + 3,
      rank,
      suit: SUIT_CLUBS,
      image: `/img/deck/${rank}_of_clubs.png`,
    },
    {
      id: index * 4 + 4,
      rank,
      suit: SUIT_SPADES,
      image: `/img/deck/${rank}_of_spades.png`,
    },
  ]),
];
