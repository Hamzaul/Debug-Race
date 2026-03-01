const express = require('express');
const router = express.Router();

// In-memory team storage
const teams = new Map();

// Generate 6-digit code
const generateCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Test route
router.get('/test', (req, res) => {
  res.json({ 
    message: 'Team route working!', 
    activeTeams: teams.size,
    timestamp: new Date() 
  });
});

// Create team - NO authentication for MVP
router.post('/create', (req, res) => {
  try {
    const { name, language, level } = req.body || {};
    
    if (!name) {
      return res.status(400).json({ error: 'Team name is required' });
    }
    
    // Generate unique code
    let code;
    let attempts = 0;
    do {
      code = generateCode();
      attempts++;
    } while (teams.has(code) && attempts < 100);
    
    const team = {
      _id: `team_${Date.now()}`,
      code: code,
      name: name,
      leader: 'current_user',
      members: [],
      settings: {
        language: language || 'Python',
        level: parseInt(level) || 1,
        maxPlayers: 4
      },
      status: 'waiting',
      createdAt: new Date()
    };
    
    teams.set(code, team);
    
    console.log('✅ Team created:', code, '-', name);
    
    res.status(201).json({
      team: team,
      levelInfo: {
        name: getLevelName(team.settings.level),
        laps: team.settings.level + 1
      }
    });
  } catch (error) {
    console.error('❌ Create team error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Join team
router.post('/join', (req, res) => {
  try {
    const { code } = req.body || {};
    
    if (!code) {
      return res.status(400).json({ error: 'Team code is required' });
    }
    
    if (!teams.has(code)) {
      return res.status(404).json({ error: 'Team not found' });
    }
    
    const team = teams.get(code);
    
    if (team.status !== 'waiting') {
      return res.status(400).json({ error: 'Race already in progress' });
    }
    
    if (team.members.length >= team.settings.maxPlayers) {
      return res.status(400).json({ error: 'Team is full' });
    }
    
    console.log('✅ Player joined team:', code);
    
    res.json({
      team: team,
      levelInfo: {
        name: getLevelName(team.settings.level),
        laps: team.settings.level + 1
      }
    });
  } catch (error) {
    console.error('❌ Join team error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get team by code
router.get('/:code', (req, res) => {
  try {
    const { code } = req.params;
    
    if (!teams.has(code)) {
      return res.status(404).json({ error: 'Team not found' });
    }
    
    const team = teams.get(code);
    
    res.json({
      team: team,
      levelInfo: {
        name: getLevelName(team.settings.level),
        laps: team.settings.level + 1
      }
    });
  } catch (error) {
    console.error('❌ Get team error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Leave team
router.post('/:code/leave', (req, res) => {
  try {
    const { code } = req.params;
    
    if (!teams.has(code)) {
      return res.status(404).json({ error: 'Team not found' });
    }
    
    const team = teams.get(code);
    
    // For MVP, just return success
    console.log('✅ Player left team:', code);
    
    res.json({ message: 'Left team successfully', team });
  } catch (error) {
    console.error('❌ Leave team error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Helper function
function getLevelName(level) {
  const names = {
    1: 'Rookie Grid',
    2: 'Code Circuit',
    3: 'Logic Grand Prix',
    4: 'Algorithm Arena',
    5: 'Championship Circuit'
  };
  return names[level] || 'Rookie Grid';
}

module.exports = router;