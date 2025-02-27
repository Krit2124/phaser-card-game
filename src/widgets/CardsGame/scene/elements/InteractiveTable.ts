export default class InteractiveTable extends Phaser.GameObjects.Container {
  private tableBorders!: Phaser.GameObjects.Rectangle;

  constructor(
    scene: Phaser.Scene,
    sceneWidth: number,
    sceneHeight: number,
    marginFromSceneBorders: number
  ) {
    super(scene, sceneWidth / 2, sceneHeight / 2);

    this.width = sceneWidth - marginFromSceneBorders * 2;
    this.height = sceneHeight - marginFromSceneBorders * 2;

    this.tableBorders = scene.add
      .rectangle(sceneWidth / 2, sceneHeight / 2, this.width, this.height)
      .setStrokeStyle(5, 0xff0000);
  }
}
