const express = require('express');
const router = express.Router();

// In-memory race storage
const races = new Map();

// Test route
router.get('/test', (req, res) => {
  res.json({ 
    message: 'Race route working!', 
    activeRaces: races.size,
    timestamp: new Date() 
  });
});

// Start race
router.post('/start', (req, res) => {
  try {
    const { teamCode } = req.body || {};
    
    const raceId = `race_${Date.now()}`;
    
    const race = {
      _id: raceId,
      teamCode: teamCode,
      players: [],
      settings: {
        language: 'Python',
        level: 1,
        totalLaps: 2
      },
      questions: [],
      status: 'racing',
      startTime: new Date()
    };
    
    races.set(raceId, race);
    
    console.log('✅ Race started:', raceId);
    
    res.json({ race, questions: [] });
  } catch (error) {
    console.error('❌ Start race error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get race by ID
router.get('/:raceId', (req, res) => {
  try {
    const { raceId } = req.params;
    
    if (races.has(raceId)) {
      res.json(races.get(raceId));
    } else {
      // Return mock race data for testing
      res.json({
        _id: raceId,
        status: 'racing',
        settings: {
          language: 'Python',
          level: 1,
          totalLaps: 2
        },
        players: [],
        questions: []
      });
    }
  } catch (error) {
    console.error('❌ Get race error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Submit answer
router.post('/:raceId/answer', (req, res) => {
  try {
    const { raceId } = req.params;
    const { questionId, answer, responseTime } = req.body || {};
    
    // Mock response
    const isCorrect = Math.random() > 0.3; // 70% chance correct for testing
    
    console.log('✅ Answer submitted:', { raceId, questionId, answer, isCorrect });
    
    res.json({
      isCorrect: isCorrect,
      correctAnswer: 'B',
      explanation: 'This is the correct answer because...',
      streak: isCorrect ? 1 : 0
    });
  } catch (error) {
    console.error('❌ Submit answer error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Finish race
router.post('/:raceId/finish', (req, res) => {
  try {
    const { raceId } = req.params;
    
    console.log('✅ Race finished:', raceId);
    
    res.json({
      raceResult: {
        rank: 1,
        stats: {
          totalQuestions: 10,
          correctAnswers: 7,
          accuracy: 0.7,
          averageResponseTime: 5.5,
          bestStreak: 3
        },
        xpEarned: 150,
        suggestedLevel: 2
      }
    });
  } catch (error) {
    console.error('❌ Finish race error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get race results
router.get('/:raceId/results', (req, res) => {
  try {
    const { raceId } = req.params;
    
    // Mock results
    res.json([
      {
        user: { _id: 'user1', username: 'Player1', avatar: 'avatar1' },
        rank: 1,
        stats: {
          totalQuestions: 10,
          correctAnswers: 8,
          accuracy: 0.8,
          averageResponseTime: 4.2,
          bestStreak: 5
        },
        xpEarned: 200,
        wrongAnswers: []
      },
      {
        user: { _id: 'user2', username: 'Player2', avatar: 'avatar2' },
        rank: 2,
        stats: {
          totalQuestions: 10,
          correctAnswers: 6,
          accuracy: 0.6,
          averageResponseTime: 6.1,
          bestStreak: 3
        },
        xpEarned: 150,
        wrongAnswers: []
      }
    ]);
  } catch (error) {
    console.error('❌ Get results error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;