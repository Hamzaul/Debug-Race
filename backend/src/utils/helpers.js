const { SPEED, POWERUPS } = require("./constants");

// Calculate new speed based on answer
const calculateSpeed = (currentSpeed, isCorrect, hasNitro = false) => {
  let newSpeed = currentSpeed;
  
  if (isCorrect) {
    newSpeed += SPEED.CORRECT_BOOST;
    if (hasNitro) {
      newSpeed += SPEED.NITRO_BOOST;
    }
  } else {
    newSpeed -= SPEED.WRONG_PENALTY;
  }
  
  // Clamp speed to min/max
  return Math.max(SPEED.MIN, Math.min(SPEED.MAX, newSpeed));
};

// Calculate position based on speed and time
const calculatePosition = (currentPosition, speed, deltaTime) => {
  return currentPosition + (speed * deltaTime / 1000);
};

// Check for powerup unlock
const checkPowerupUnlock = (streak) => {
  if (streak >= 7) return 'SLOW';
  if (streak >= 5) return 'SHIELD';
  if (streak >= 3) return 'NITRO';
  return null;
};

// Calculate XP earned
const calculateXP = (rank, correctAnswers, totalQuestions, level) => {
  const baseXP = 100;
  const rankBonus = [100, 75, 50, 25][rank - 1] || 10;
  const accuracyBonus = Math.floor((correctAnswers / totalQuestions) * 100);
  const levelMultiplier = level;
  
  return Math.floor((baseXP + rankBonus + accuracyBonus) * levelMultiplier);
};

// Calculate suggested level
const calculateSuggestedLevel = (accuracy, currentLevel) => {
  if (accuracy >= 0.85 && currentLevel < 5) {
    return currentLevel + 1;
  } else if (accuracy < 0.4 && currentLevel > 1) {
    return currentLevel - 1;
  }
  return currentLevel;
};

module.exports = {
  calculateSpeed,
  calculatePosition,
  checkPowerupUnlock,
  calculateXP,
  calculateSuggestedLevel
};