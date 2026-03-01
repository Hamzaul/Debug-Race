const mongoose = require('mongoose');

const raceResultSchema = new mongoose.Schema({
  race: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Race',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  rank: {
    type: Number,
    required: true
  },
  stats: {
    totalQuestions: Number,
    correctAnswers: Number,
    accuracy: Number,
    averageResponseTime: Number,
    bestStreak: Number,
    powerUpsUsed: Number
  },
  wrongAnswers: [{
    question: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Question'
    },
    userAnswer: String,
    correctAnswer: String,
    explanation: String
  }],
  topicPerformance: {
    type: Map,
    of: {
      correct: Number,
      total: Number
    }
  },
  xpEarned: Number,
  suggestedLevel: Number
}, { timestamps: true });

module.exports = mongoose.model('RaceResult', raceResultSchema);