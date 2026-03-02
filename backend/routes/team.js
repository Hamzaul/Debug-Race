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
    const { name, language, level, leaderDisplayName, leaderId, leaderAvatar } = req.body || {}; // Added leaderDisplayName, leaderId, leaderAvatar
    
    if (!name) {
      return res.status(400).json({ error: 'Lobby name is required' });
    }
    if (!leaderDisplayName) {
        return res.status(400).json({ error: 'Leader name is required' });
    }
    if (!leaderId) { // Basic check, in real app, userId comes from authenticated session
        return res.status(400).json({ error: 'Leader user ID is required' });
    }
    
    // Generate unique code
    let code;
    let attempts = 0;
    do {
      code = generateCode();
      attempts++;
    } while (teams.has(code) && attempts < 100);
    
    const team = { // 'team' now means 'lobby'
      _id: `lobby_${Date.now()}`,
      code: code,
      name: name, // Lobby Name
      leaderId: leaderId, // Global User ID of the leader
      members: [{ // Initial member is the leader
        userId: leaderId,
        username: leaderDisplayName, // Lobby-specific display name
        avatar: leaderAvatar || 'avatar1', // Store avatar
        isReady: false,
        isLeader: true,
        socketId: null // This will be set on socket connection
      }],
      settings: {
        language: language || 'Python',
        level: parseInt(level) || 1,
        maxPlayers: 4
      },
      status: 'waiting',
      createdAt: new Date()
    };
    
    teams.set(code, team);
    
    console.log('✅ Lobby created:', code, '-', name, 'by', leaderDisplayName);
    
    res.status(201).json({
      team: team, // Still returning 'team' as per original structure
      levelInfo: {
        name: getLevelName(team.settings.level),
        laps: team.settings.level + 1 // Example calculation, adjust if needed
      }
    });
  } catch (error) {
    console.error('❌ Create lobby error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Join team
router.post('/join', (req, res) => {
  try {
    const { code } = req.body || {}; // Renamed from teamCode
    // No playerDisplayName or playerAvatar here.
    // The player's specific display name and avatar for the lobby will be
    // sent via Socket.io 'joinRoom' event after this API call.
    // The backend's socket handler will then add the member to the lobby object.

    if (!code) {
      return res.status(400).json({ error: 'Lobby code is required' });
    }
    
    if (!teams.has(code)) {
      return res.status(404).json({ error: 'Lobby not found' });
    }
    
    const team = teams.get(code); // 'team' now means 'lobby'
    
    if (team.status !== 'waiting') {
      return res.status(400).json({ error: 'Race already in progress' });
    }
    
    if (team.members.length >= team.settings.maxPlayers) {
      return res.status(400).json({ error: 'Lobby is full' });
    }
    
    console.log(`✅ Player is attempting to join lobby: ${code}`);
    
    res.json({
      team: team, // Return lobby details
      levelInfo: {
        name: getLevelName(team.settings.level),
        laps: team.settings.level + 1
      }
    });
  } catch (error) {
    console.error('❌ Join lobby error:', error);
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