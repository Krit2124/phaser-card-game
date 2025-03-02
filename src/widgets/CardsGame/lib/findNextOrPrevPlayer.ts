export function findNextPlayerIndex(
  playersAmount: number,
  currentPlayerIndex: number
) {
  return currentPlayerIndex < playersAmount - 1 ? currentPlayerIndex + 1 : 0;
}

export function findPrevPlayerIndex(
  playersAmount: number,
  currentPlayerIndex: number
) {
  return currentPlayerIndex > 0 ? currentPlayerIndex - 1 : playersAmount - 1;
}
