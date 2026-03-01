import Phaser from 'phaser';
import { TRACK_CONFIG } from '../config';

export class Track extends Phaser.GameObjects.Container {
  constructor(scene, x, y) {
    super(scene, x, y);
    
    this.createTrack();
    this.createLanes();
    this.createCheckpoints();
  }

  createTrack() {
    const graphics = this.scene.add.graphics();
    
    // Track surface
    graphics.fillStyle(0x333333, 1);
    graphics.fillRect(0, 0, TRACK_CONFIG.width, TRACK_CONFIG.height);
    
    // Track borders
    graphics.lineStyle(5, 0x00f0ff, 1);
    graphics.strokeRect(50, 0, TRACK_CONFIG.width - 100, TRACK_CONFIG.height);
    
    this.add(graphics);
  }

  createLanes() {
    const graphics = this.scene.add.graphics();
    const laneCount = 4;
    const laneWidth = (TRACK_CONFIG.width - 100) / laneCount;
    
    graphics.lineStyle(2, 0xffffff, 0.5);
    
    for (let i = 1; i < laneCount; i++) {
      const x = 50 + (i * laneWidth);
      
      // Dashed lines
      for (let y = 0; y < TRACK_CONFIG.height; y += 40) {
        graphics.strokeRect(x - 1, y, 2, 20);
      }
    }
    
    this.add(graphics);
  }

  createCheckpoints() {
    this.checkpoints = [];
    const checkpointSpacing = TRACK_CONFIG.height / TRACK_CONFIG.checkpoints;
    
    for (let i = 0; i < TRACK_CONFIG.checkpoints; i++) {
      const y = i * checkpointSpacing;
      const checkpoint = this.scene.add.rectangle(
        TRACK_CONFIG.width / 2,
        y,
        TRACK_CONFIG.width - 100,
        5,
        0x00f0ff,
        0.3
      );
      checkpoint.setVisible(false);
      this.checkpoints.push(checkpoint);
      this.add(checkpoint);
    }
  }

  showCheckpoint(index) {
    if (this.checkpoints[index]) {
      this.checkpoints[index].setVisible(true);
      this.scene.time.delayedCall(500, () => {
        this.checkpoints[index].setVisible(false);
      });
    }
  }
}