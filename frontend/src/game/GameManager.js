import Phaser from 'phaser';
import { gameConfig } from './config';

export class GameManager {
  constructor() {
    this.game = null;
    this.socket = null;
    this.dispatch = null;
  }

  initialize(container, socket, dispatch, raceData) {
    if (this.game) {
      this.destroy();
    }

    const config = {
      ...gameConfig,
      parent: container,
      callbacks: {
        preBoot: (game) => {
          game.registry.set('socket', socket);
          game.registry.set('dispatch', dispatch);
          game.registry.set('raceId', raceData.raceId);
          game.registry.set('userId', raceData.userId);
          game.registry.set('teamCode', raceData.teamCode);
          game.registry.set('totalLaps', raceData.totalLaps);
        }
      }
    };

    this.game = new Phaser.Game(config);
    this.socket = socket;
    this.dispatch = dispatch;

    return this.game;
  }

  updateSpeed(speed) {
    if (this.game?.scene?.scenes[0]) {
      const raceScene = this.game.scene.scenes.find(s => s.scene.key === 'RaceScene');
      if (raceScene?.localCar) {
        raceScene.localCar.setSpeed(speed);
      }
    }
  }

  activatePowerUp(type) {
    if (this.game?.scene?.scenes[0]) {
      const raceScene = this.game.scene.scenes.find(s => s.scene.key === 'RaceScene');
      if (raceScene?.localCar) {
        switch (type) {
          case 'NITRO':
            raceScene.localCar.activateNitro();
            break;
          case 'SHIELD':
            raceScene.localCar.activateShield();
            break;
        }
      }
    }
  }

  destroy() {
    if (this.game) {
      this.game.destroy(true);
      this.game = null;
    }
  }
}

export const gameManager = new GameManager();