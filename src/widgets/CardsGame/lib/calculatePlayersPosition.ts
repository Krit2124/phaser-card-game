import { cardsSizes } from "../constants/cardsSizes";

export function calculatePlayersPositions(playersAmount: number, sceneWidth: number, sceneHeight: number) {
  const normalAngle = 0;
  const reversedAngle = Math.PI;

  const sceneCenterX = sceneWidth / 2;

  if (playersAmount === 2) {
    return [
      { x: sceneCenterX, y: sceneHeight, angle: normalAngle },
      { x: sceneCenterX, y: 0, angle: reversedAngle },
    ];
  } else if (playersAmount === 3) {
    return [
      { x: sceneCenterX, y: sceneHeight, angle: normalAngle },
      { x: cardsSizes.width * 2, y: 0, angle: reversedAngle },
      { x: sceneWidth - cardsSizes.width * 2, y: 0, angle: reversedAngle },
    ];
  } else {
    return [
      { x: cardsSizes.width * 2, y: sceneHeight, angle: normalAngle },
      { x: cardsSizes.width * 2, y: 0, angle: reversedAngle },
      { x: sceneWidth - cardsSizes.width * 2, y: 0, angle: reversedAngle },
      { x: sceneWidth - cardsSizes.width * 2, y: sceneHeight, angle: normalAngle },
    ];
  }
}