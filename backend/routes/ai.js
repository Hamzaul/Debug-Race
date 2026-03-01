const express = require('express');
const router = express.Router();
const {
  generateAIQuestion,
  getCachedQuestions,
  getQuestionStats,
  testGeneration
} = require('../controllers/aiController');

// Test route
router.get('/test', (req, res) => {
  res.json({ 
    message: 'AI route working!',
    timestamp: new Date() 
  });
});

// Generate new question
router.post('/generate-question', generateAIQuestion);

// Get cached questions
router.get('/questions', getCachedQuestions);

// Get statistics
router.get('/stats', getQuestionStats);

// Test generation
router.post('/test-generation', testGeneration);

module.exports = router;