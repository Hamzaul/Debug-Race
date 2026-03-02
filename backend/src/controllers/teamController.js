const Team = require('../models/Team');
const { LEVELS } = require('../utils/constants');

// @desc    Create team
// @route   POST /api/team/create
exports.createTeam = async (req, res) => {
  try {
    const { name, language, level } = req.body;
    
    // Generate unique 6-digit code
    let code;
    let codeExists = true;
    while (codeExists) {
      code = Team.generateCode();
      codeExists = await Team.findOne({ code });
    }
    
    const team = await Team.create({
      name,
      code,
      leader: req.user._id,
      members: [{
        user: req.user._id,
        username: req.user.username,
        avatar: req.user.avatar,
        isReady: false
      }],
      settings: {
        language,
        level: parseInt(level)
      }
    });
    
    res.status(201).json({
      team,
      levelInfo: LEVELS[level]
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Join team
// @route   POST /api/team/join
exports.joinTeam = async (req, res) => {
  try {
    const { code } = req.body;
    
    const team = await Team.findOne({ code });
    
    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }
    
    if (team.status !== 'waiting') {
      return res.status(400).json({ error: 'Race already in progress' });
    }
    
    if (team.members.length >= team.settings.maxPlayers) {
      return res.status(400).json({ error: 'Team is full' });
    }
    
    // Check if already a member
    const alreadyMember = team.members.find(
      m => m.user?.toString() === req.user._id.toString()
    );
    
    if (alreadyMember) {
      return res.status(400).json({ error: 'Already in this team' });
    }
    
    team.members.push({
      user: req.user._id,
      username: req.user.username,
      avatar: req.user.avatar,
      isReady: false
    });
    
    await team.save();
    
    res.json({
      team,
      levelInfo: LEVELS[team.settings.level]
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Get team by code
// @route   GET /api/team/:code
exports.getTeam = async (req, res) => {
  try {
    const team = await Team.findOne({ code: req.params.code })
      .populate('members.user', 'username avatar stats')
      .populate('leader', 'username');
    
    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }
    
    res.json({
      team,
      levelInfo: LEVELS[team.settings.level]
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Leave team
// @route   POST /api/team/:code/leave
exports.leaveTeam = async (req, res) => {
  try {
    const team = await Team.findOne({ code: req.params.code });
    
    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }
    
    // Remove member
    team.members = team.members.filter(
      m => m.user?.toString() !== req.user._id.toString()
    );
    
    // If leader leaves and there are other members, assign new leader
    if (team.leader.toString() === req.user._id.toString() && team.members.length > 0) {
      team.leader = team.members[0].user;
    }
    
    // If no members left, delete team
    if (team.members.length === 0) {
      await Team.findByIdAndDelete(team._id);
      return res.json({ message: 'Team disbanded' });
    }
    
    await team.save();
    res.json({ message: 'Left team successfully', team });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};