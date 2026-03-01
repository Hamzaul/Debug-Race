import Phaser from 'phaser';
import { BootScene } from './scenes/BootScene';
import { PreloaderScene } from './scenes/PreloaderScene';
import { RaceScene } from './scenes/RaceScene';

export const gameConfig = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#1a1a2e',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false
    }
  },
  scene: [BootScene, PreloaderScene, RaceScene]
};

export const TRACK_CONFIG = {
  width: 800,
  height: 600,
  laneWidth: 80,
  trackLength: 2000,
  checkpoints: 4
};

export const CAR_CONFIG = {
  width: 40,
  height: 60,
  minSpeed: 20,
  maxSpeed: 150,
  acceleration: 5,
  deceleration: 3
};