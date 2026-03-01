import Phaser from 'phaser';
import { Car } from '../objects/Car';
import { CAR_CONFIG, TRACK_CONFIG } from '../config';

export class RaceScene extends Phaser.Scene {
  constructor() {
    super({ key: 'RaceScene' });
    this.cars = {};
    this.localCar = null;
    this.trackPosition = 0;
  }

  init() {
    this.socket = this.registry.get('socket');
    this.dispatch = this.registry.get('dispatch');
    this.raceId = this.registry.get('raceId');
    this.userId = this.registry.get('userId');
  }

  create() {
    // Create track background
    this.createTrack();
    
    // Create finish line
    this.createFinishLine();
    
    // Create local car
    this.createLocalCar();
    
    // Setup UI elements
    this.createUI();
    
    // Setup input
    this.setupInput();
    
    // Setup socket listeners
    this.setupSocketListeners();
    
    // Start game loop
    this.time.addEvent({
      delay: 50,
      callback: this.sendPositionUpdate,
      callbackScope: this,
      loop: true
    });
  }

  createTrack() {
    // Scrolling track background
    this.track = this.add.tileSprite(400, 300, 800, 600, 'track');
    
    // Add track borders
    this.add.rectangle(50, 300, 10, 600, 0x00f0ff);
    this.add.rectangle(750, 300, 10, 600, 0x00f0ff);
    
    // Create lanes
    for (let i = 1; i <= 3; i++) {
      const x = 50 + (175 * i);
      this.add.rectangle(x, 300, 2, 600, 0xffffff, 0.3);
    }
  }

  createFinishLine() {
    this.finishLine = this.add.container(400, 50);
    
    // Checkered pattern
    const graphics = this.add.graphics();
    for (let i = 0; i < 14; i++) {
      for (let j = 0; j < 2; j++) {
        const color = (i + j) % 2 === 0 ? 0xffffff : 0x000000;
        graphics.fillStyle(color, 1);
        graphics.fillRect(-350 + (i * 50), -10 + (j * 10), 50, 10);
      }
    }
    this.finishLine.add(graphics);
    this.finishLine.setVisible(false);
  }

  createLocalCar() {
    const laneX = this.getLanePosition(1);
    this.localCar = new Car(this, laneX, 500, 'car1', {
      isLocal: true,
      speed: 50
    });
    
    this.cars[this.socket?.id] = this.localCar;
    this.add.existing(this.localCar);
  }

  createUI() {
    // Lap counter
    this.lapText = this.add.text(16, 16, 'Lap 1', {
      fontFamily: 'Orbitron',
      fontSize: '24px',
      color: '#00f0ff'
    });
    
    // Position indicator
    this.positionText = this.add.text(16, 50, 'Position: 1st', {
      fontFamily: 'Orbitron',
      fontSize: '18px',
      color: '#ffffff'
    });
    
    // Speed display
    this.speedText = this.add.text(700, 16, '50 km/h', {
      fontFamily: 'Orbitron',
      fontSize: '20px',
      color: '#00ff88'
    }).setOrigin(1, 0);
  }

  setupInput() {
    // Lane switching with arrow keys
    this.cursors = this.input.keyboard.createCursorKeys();
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    
    this.input.keyboard.on('keydown-LEFT', () => {
      this.switchLane(-1);
    });
    
    this.input.keyboard.on('keydown-RIGHT', () => {
      this.switchLane(1);
    });
    
    this.input.keyboard.on('keydown-SPACE', () => {
      this.useNitro();
    });
  }

  setupSocketListeners() {
    if (!this.socket) return;

    this.socket.on('positionUpdate', (data) => {
      this.updateOpponentCar(data);
    });

    this.socket.on('speedUpdate', (data) => {
      if (data.playerId !== this.socket.id) {
        this.updateCarSpeed(data.playerId, data.speed);
      }
    });
  }

  getLanePosition(lane) {
    // 4 lanes: 0, 1, 2, 3
    const laneWidth = 175;
    return 137 + (lane * laneWidth);
  }

  switchLane(direction) {
    if (!this.localCar) return;
    
    const currentLane = this.localCar.currentLane || 1;
    const newLane = Phaser.Math.Clamp(currentLane + direction, 0, 3);
    
    if (newLane !== currentLane) {
      this.localCar.currentLane = newLane;
      this.tweens.add({
        targets: this.localCar,
        x: this.getLanePosition(newLane),
        duration: 200,
        ease: 'Power2'
      });
    }
  }

  useNitro() {
    if (!this.localCar || this.localCar.nitro <= 0) return;
    
    this.localCar.activateNitro();
    
    // Visual effect
    this.cameras.main.shake(100, 0.01);
    
    // Emit to server
    this.socket?.emit('powerupUsed', {
      teamCode: this.registry.get('teamCode'),
      powerupType: 'NITRO'
    });
  }

  updateCarSpeed(playerId, speed) {
    const car = this.cars[playerId];
    if (car) {
      car.setSpeed(speed);
    }
  }

  updateOpponentCar(data) {
    const { playerId, position, lap, speed } = data;
    
    if (playerId === this.socket?.id) return;
    
    if (!this.cars[playerId]) {
      // Create opponent car
      const laneIndex = Object.keys(this.cars).length;
      const car = new Car(this, this.getLanePosition(laneIndex), 500, `car${laneIndex + 1}`, {
        isLocal: false,
        speed
      });
      this.cars[playerId] = car;
      this.add.existing(car);
    }
    
    const car = this.cars[playerId];
    car.setSpeed(speed);
    
    // Update visual position based on relative position
    const relativePos = position - this.trackPosition;
    car.y = 500 - (relativePos * 0.1);
  }

  sendPositionUpdate() {
    if (!this.localCar || !this.socket) return;
    
    this.socket.emit('positionUpdate', {
      teamCode: this.registry.get('teamCode'),
      position: this.trackPosition,
      lap: this.localCar.lap,
      speed: this.localCar.speed
    });
  }

  update(time, delta) {
    if (!this.localCar) return;
    
    // Update track scroll based on speed
    const scrollSpeed = this.localCar.speed * 0.05;
    this.track.tilePositionY -= scrollSpeed;
    
    // Update track position
    this.trackPosition += scrollSpeed;
    
    // Check lap completion
    this.checkLapCompletion();
    
    // Update UI
    this.speedText.setText(`${Math.floor(this.localCar.speed)} km/h`);
    this.lapText.setText(`Lap ${this.localCar.lap}`);
    
    // Update car animations
    Object.values(this.cars).forEach(car => car.update(time, delta));
  }

  checkLapCompletion() {
    const lapLength = TRACK_CONFIG.trackLength;
    const currentLap = Math.floor(this.trackPosition / lapLength) + 1;
    
    if (currentLap > this.localCar.lap) {
      this.localCar.lap = currentLap;
      
      // Show finish line briefly
      this.finishLine.setVisible(true);
      this.time.delayedCall(1000, () => {
        this.finishLine.setVisible(false);
      });
      
      // Emit lap completion
      this.socket?.emit('lapComplete', {
        teamCode: this.registry.get('teamCode'),
        lap: currentLap
      });
      
      // Update dispatch
      this.dispatch?.({
        type: 'UPDATE_PLAYER_STATS',
        payload: { lap: currentLap }
      });
      
      // Check race completion
      const totalLaps = this.registry.get('totalLaps') || 3;
      if (currentLap > totalLaps) {
        this.finishRace();
      }
    }
  }

  finishRace() {
    // Stop the car
    this.localCar.setSpeed(0);
    
    // Emit finish event
    this.socket?.emit('raceFinished', {
      teamCode: this.registry.get('teamCode'),
      finishTime: Date.now()
    });
    
    // Show finish message
    const text = this.add.text(400, 300, '🏁 FINISHED!', {
      fontFamily: 'Orbitron',
      fontSize: '48px',
      color: '#00f0ff'
    }).setOrigin(0.5);
    
    this.tweens.add({
      targets: text,
      scale: 1.2,
      duration: 500,
      yoyo: true,
      repeat: -1
    });
  }
}