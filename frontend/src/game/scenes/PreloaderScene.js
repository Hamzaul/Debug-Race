import Phaser from 'phaser';

export class PreloaderScene extends Phaser.Scene {
  constructor() {
    super({ key: 'PreloaderScene' });
  }

  preload() {
    // Create loading bar
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    const progressBar = this.add.graphics();
    const progressBox = this.add.graphics();
    progressBox.fillStyle(0x222222, 0.8);
    progressBox.fillRect(width / 2 - 160, height / 2 - 25, 320, 50);

    const loadingText = this.add.text(width / 2, height / 2 - 50, 'Loading...', {
      font: '20px Orbitron',
      fill: '#00f0ff'
    }).setOrigin(0.5);

    // Update progress bar
    this.load.on('progress', (value) => {
      progressBar.clear();
      progressBar.fillStyle(0x00f0ff, 1);
      progressBar.fillRect(width / 2 - 150, height / 2 - 15, 300 * value, 30);
    });

    this.load.on('complete', () => {
      progressBar.destroy();
      progressBox.destroy();
      loadingText.destroy();
    });

    // Load game assets
    this.createCarTextures();
    this.createTrackTexture();
    this.createPowerupTextures();
  }

  createCarTextures() {
    const colors = [0x00f0ff, 0xff00f5, 0x00ff88, 0xffff00];
    
    colors.forEach((color, index) => {
      const graphics = this.make.graphics({ x: 0, y: 0 });
      
      // Car body
      graphics.fillStyle(color, 1);
      graphics.fillRoundedRect(5, 0, 30, 50, 5);
      
      // Windshield
      graphics.fillStyle(0x333333, 1);
      graphics.fillRoundedRect(10, 5, 20, 15, 3);
      
      // Wheels
      graphics.fillStyle(0x111111, 1);
      graphics.fillRect(0, 5, 8, 12);
      graphics.fillRect(32, 5, 8, 12);
      graphics.fillRect(0, 35, 8, 12);
      graphics.fillRect(32, 35, 8, 12);

      graphics.generateTexture(`car${index + 1}`, 40, 50);
      graphics.destroy();
    });
  }

  createTrackTexture() {
    const graphics = this.make.graphics({ x: 0, y: 0 });
    
    // Track background
    graphics.fillStyle(0x333333, 1);
    graphics.fillRect(0, 0, 800, 600);
    
    // Lane markings
    graphics.lineStyle(3, 0xffffff, 0.5);
    for (let i = 1; i < 4; i++) {
      for (let y = 0; y < 600; y += 40) {
        graphics.strokeRect(200 * i - 2, y, 4, 20);
      }
    }
    
    // Track borders
    graphics.lineStyle(5, 0x00f0ff, 1);
    graphics.strokeRect(50, 0, 700, 600);

    graphics.generateTexture('track', 800, 600);
    graphics.destroy();
  }

  createPowerupTextures() {
    // Nitro
    let graphics = this.make.graphics({ x: 0, y: 0 });
    graphics.fillStyle(0xbf00ff, 1);
    graphics.fillCircle(15, 15, 15);
    graphics.fillStyle(0xffffff, 1);
    graphics.fillTriangle(10, 20, 20, 5, 20, 20);
    graphics.generateTexture('nitro', 30, 30);
    graphics.destroy();

    // Shield
    graphics = this.make.graphics({ x: 0, y: 0 });
    graphics.fillStyle(0x00f0ff, 0.5);
    graphics.fillCircle(20, 20, 20);
    graphics.lineStyle(3, 0x00f0ff, 1);
    graphics.strokeCircle(20, 20, 18);
    graphics.generateTexture('shield', 40, 40);
    graphics.destroy();
  }

  create() {
    this.scene.start('RaceScene');
  }
}