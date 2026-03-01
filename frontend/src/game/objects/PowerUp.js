import Phaser from 'phaser';

export class PowerUp extends Phaser.GameObjects.Sprite {
  constructor(scene, x, y, type) {
    super(scene, x, y, type);
    
    this.type = type;
    this.isCollected = false;
    
    // Add floating animation
    scene.tweens.add({
      targets: this,
      y: y - 10,
      duration: 1000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
    
    // Add glow effect
    this.setBlendMode(Phaser.BlendModes.ADD);
    
    scene.add.existing(this);
  }

  collect() {
    if (this.isCollected) return;
    
    this.isCollected = true;
    
    // Collection animation
    this.scene.tweens.add({
      targets: this,
      scale: 1.5,
      alpha: 0,
      duration: 300,
      onComplete: () => {
        this.destroy();
      }
    });
    
    return this.type;
  }
}