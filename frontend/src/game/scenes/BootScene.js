import Phaser from 'phaser';

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  preload() {
    // Load minimal assets needed for preloader
    this.load.image('logo', '/assets/images/logo.png');
  }

  create() {
    this.scene.start('PreloaderScene');
  }
}