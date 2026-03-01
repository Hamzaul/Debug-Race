import Phaser from 'phaser';
import { CAR_CONFIG } from '../config';

export class Car extends Phaser.GameObjects.Container {
  constructor(scene, x, y, texture, options = {}) {
    super(scene, x, y);
    
    this.isLocal = options.isLocal || false;
    this.speed = options.speed || CAR_CONFIG.minSpeed;
    this.targetSpeed = this.speed;
    this.nitro = 0;
    this.shield = false;
    this.lap = 1;
    this.currentLane = 1;
    
    // Create car sprite
    this.sprite = scene.add.image(0, 0, texture);
    this.add(this.sprite);
    
    // Create nitro flame effect (hidden by default)
    this.flame = scene.add.graphics();
    this.flame.fillStyle(0xff6600, 1);
    this.flame.fillTriangle(-10, 30, 10, 30, 0, 50);
    this.flame.setVisible(false);
    this.add(this.flame);
    
    // Create shield effect (hidden by default)
    this.shieldSprite = scene.add.image(0, 0, 'shield');
    this.shieldSprite.setVisible(false);
    this.shieldSprite.setAlpha(0.5);
    this.add(this.shieldSprite);
    
    // Add to scene
    scene.add.existing(this);
  }

  setSpeed(speed) {
    this.targetSpeed = Phaser.Math.Clamp(speed, CAR_CONFIG.minSpeed, CAR_CONFIG.maxSpeed);
  }

  activateNitro() {
    if (this.nitro <= 0) return;
    
    this.nitro = Math.max(0, this.nitro - 20);
    this.targetSpeed = Math.min(CAR_CONFIG.maxSpeed, this.speed + 50);
    
    // Show flame effect
    this.flame.setVisible(true);
    this.scene.time.delayedCall(2000, () => {
      this.flame.setVisible(false);
    });
  }

  activateShield(duration = 8000) {
    this.shield = true;
    this.shieldSprite.setVisible(true);
    
    // Pulsing animation
    this.scene.tweens.add({
      targets: this.shieldSprite,
      alpha: { from: 0.3, to: 0.7 },
      duration: 500,
      yoyo: true,
      repeat: -1
    });
    
    this.scene.time.delayedCall(duration, () => {
      this.shield = false;
      this.shieldSprite.setVisible(false);
      this.scene.tweens.killTweensOf(this.shieldSprite);
    });
  }

  update(time, delta) {
    // Smooth speed transition
    if (this.speed !== this.targetSpeed) {
      const diff = this.targetSpeed - this.speed;
      const change = Math.sign(diff) * Math.min(Math.abs(diff), CAR_CONFIG.acceleration);
      this.speed += change;
    }
    
    // Wobble effect at high speed
    if (this.speed > 100) {
      this.sprite.rotation = Math.sin(time * 0.01) * 0.02;
    } else {
      this.sprite.rotation = 0;
    }
    
    // Update flame intensity
    if (this.flame.visible) {
      this.flame.setScale(0.8 + Math.sin(time * 0.02) * 0.2);
    }
  }
}