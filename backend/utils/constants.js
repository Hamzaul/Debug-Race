module.exports = {
  LEVELS: {
    1: { name: 'Rookie Grid', laps: 2, difficulty: 1 },
    2: { name: 'Code Circuit', laps: 3, difficulty: 2 },
    3: { name: 'Logic Grand Prix', laps: 4, difficulty: 3 },
    4: { name: 'Algorithm Arena', laps: 5, difficulty: 4 },
    5: { name: 'Championship Circuit', laps: 6, difficulty: 5 }
  },
  
  LANGUAGES: ['C', 'Python', 'Java', 'JavaScript'],
  
  POWERUPS: {
    NITRO: { streak: 3, effect: 'speed_boost', duration: 5000 },
    SHIELD: { streak: 5, effect: 'protection', duration: 8000 },
    SLOW: { streak: 7, effect: 'slow_opponent', duration: 3000 }
  },
  
  SPEED: {
    MIN: 20,
    MAX: 150,
    DEFAULT: 50,
    CORRECT_BOOST: 15,
    WRONG_PENALTY: 20,
    NITRO_BOOST: 50
  },
  
  SOCKET_EVENTS: {
    CREATE_ROOM: 'createRoom',
    JOIN_ROOM: 'joinRoom',
    LEAVE_ROOM: 'leaveRoom',
    PLAYER_READY: 'playerReady',
    START_RACE: 'startRace',
    ANSWER_SUBMITTED: 'answerSubmitted',
    SPEED_UPDATE: 'speedUpdate',
    POSITION_UPDATE: 'positionUpdate',
    LAP_COMPLETE: 'lapComplete',
    POWERUP_USED: 'powerupUsed',
    RACE_FINISHED: 'raceFinished',
    ROOM_UPDATE: 'roomUpdate',
    NEW_QUESTION: 'newQuestion',
    COUNTDOWN: 'countdown',
    ERROR: 'error'
  }
};