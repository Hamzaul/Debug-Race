const express = require('express');
const router = express.Router();

// Test route
router.get('/test', (req, res) => {
  res.json({ message: 'Auth route working!', timestamp: new Date() });
});

// Guest login - NO authentication required
router.post('/guest', (req, res) => {
  try {
    const { username } = req.body || {};
    
    const guestUser = {
      _id: `guest_${Date.now()}`,
      username: username || `Player_${Math.floor(Math.random() * 10000)}`,
      avatar: `avatar${Math.floor(Math.random() * 4) + 1}`,
      isGuest: true,
      stats: {
        totalRaces: 0,
        wins: 0,
        totalQuestions: 0,
        correctAnswers: 0
      }
    };
    
    // Generate simple token
    const token = `guest_token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    console.log('✅ Guest login:', guestUser.username);
    
    res.json({
      ...guestUser,
      token: token
    });
  } catch (error) {
    console.error('❌ Guest login error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Register - placeholder for MVP
router.post('/register', (req, res) => {
  try {
    const { username, email, password } = req.body || {};
    
    const user = {
      _id: `user_${Date.now()}`,
      username: username || 'NewPlayer',
      email: email || 'test@test.com',
      avatar: 'avatar1',
      isGuest: false
    };
    
    const token = `user_token_${Date.now()}`;
    
    res.json({ ...user, token });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Login - placeholder for MVP
router.post('/login', (req, res) => {
  try {
    const { email, password } = req.body || {};
    
    const user = {
      _id: `user_${Date.now()}`,
      username: 'TestPlayer',
      email: email || 'test@test.com',
      avatar: 'avatar1'
    };
    
    const token = `user_token_${Date.now()}`;
    
    res.json({ ...user, token });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get profile - placeholder
router.get('/profile', (req, res) => {
  res.json({
    _id: 'user_123',
    username: 'TestPlayer',
    avatar: 'avatar1',
    stats: {
      totalRaces: 5,
      wins: 2,
      totalQuestions: 50,
      correctAnswers: 35
    }
  });
});

module.exports = router;