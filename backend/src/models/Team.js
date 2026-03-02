const mongoose = require('mongoose');

const teamSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 30
  },
  code: {
    type: String,
    required: true,
    unique: true,
    length: 6
  },
  leader: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  members: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    username: String,
    avatar: String,
    isReady: {
      type: Boolean,
      default: false
    },
    socketId: String
  }],
  settings: {
    language: {
      type: String,
      enum: ['C', 'Python', 'Java', 'JavaScript'],
      default: 'Python'
    },
    level: {
      type: Number,
      min: 1,
      max: 5,
      default: 1
    },
    maxPlayers: {
      type: Number,
      default: 4
    }
  },
  status: {
    type: String,
    enum: ['waiting', 'ready', 'racing', 'finished'],
    default: 'waiting'
  },
  currentRace: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Race'
  }
}, { timestamps: true });

// Generate 6-digit code
teamSchema.statics.generateCode = function() {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Get laps based on level
teamSchema.methods.getLaps = function() {
  const lapMapping = {
    1: 2, // Rookie Grid
    2: 3, // Code Circuit
    3: 4, // Logic Grand Prix
    4: 5, // Algorithm Arena
    5: 6  // Championship Circuit
  };
  return lapMapping[this.settings.level] || 2;
};

module.exports = mongoose.model('Team', teamSchema);