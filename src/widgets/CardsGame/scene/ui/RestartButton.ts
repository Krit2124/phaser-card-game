interface RestartButtonOptions {
  scene: Phaser.Scene;
  restartFunction: () => void;
}

export default class RestartButton extends Phaser.GameObjects.Container {
  private restartButton!: Phaser.GameObjects.Arc;
  private restartButtonIcon!: Phaser.GameObjects.Image;

  constructor({ scene, restartFunction }: RestartButtonOptions) {
    super(scene);

    const { width: sceneWidth, height: sceneHeight } = scene.scale;

    this.restartButton = scene.add
      .circle(sceneWidth / 2, sceneHeight / 2, 150, 0x000000)
      .setStrokeStyle(6, 0x770000)
      .setInteractive({ useHandCursor: true })
      .setVisible(false);
    this.restartButton.on("pointerdown", restartFunction);

    this.restartButtonIcon = scene.add
      .image(sceneWidth / 2, sceneHeight / 2, "restart")
      .setVisible(false);
  }

  public setButtonVisible(visibility: boolean = true) {
    this.restartButton.setVisible(visibility);
    this.restartButtonIcon.setVisible(visibility);
  }
}
