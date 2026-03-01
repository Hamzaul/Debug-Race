const mongoose = require('mongoose');

const raceSchema = new mongoose.Schema({
  team: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team',
    required: true
  },
  players: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    username: String,
    socketId: String,
    position: { type: Number, default: 0 },
    speed: { type: Number, default: 50 },
    lap: { type: Number, default: 1 },
    nitro: { type: Number, default: 0 },
    shield: { type: Boolean, default: false },
    streak: { type: Number, default: 0 },
    questionsAnswered: { type: Number, default: 0 },
    correctAnswers: { type: Number, default: 0 },
    totalResponseTime: { type: Number, default: 0 },
    finished: { type: Boolean, default: false },
    finishTime: Number,
    rank: Number
  }],
  settings: {
    language: String,
    level: Number,
    totalLaps: Number
  },
  questions: [{
    question: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Question'
    },
    lap: Number,
    type: String
  }],
  currentQuestionIndex: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['starting', 'racing', 'finished'],
    default: 'starting'
  },
  startTime: Date,
  endTime: Date,
  winner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, { timestamps: true });

module.exports = mongoose.model('Race', raceSchema);