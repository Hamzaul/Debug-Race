const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['MCQ', 'DEBUG'],
    required: true
  },
  language: {
    type: String,
    enum: ['C', 'Python', 'Java', 'JavaScript'],
    required: true
  },
  difficulty: {
    type: Number,
    min: 1,
    max: 5,
    required: true
  },
  topic: {
    type: String,
    required: true
  },
  question: {
    type: String,
    required: true
  },
  code: {
    type: String,
    default: ''
  },
  options: [{
    id: String,
    text: String
  }],
  correctAnswer: {
    type: String,
    required: true
  },
  explanation: {
    type: String,
    required: true
  },
  timeLimit: {
    type: Number,
    default: 30
  },
  isAIGenerated: {
    type: Boolean,
    default: false
  },
  usageCount: {
    type: Number,
    default: 0
  },
  successRate: {
    type: Number,
    default: 0.5
  }
}, { timestamps: true });

// Index for efficient querying
questionSchema.index({ language: 1, difficulty: 1, type: 1 });

module.exports = mongoose.model('Question', questionSchema);