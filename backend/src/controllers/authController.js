const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// @desc    Register user
// @route   POST /api/auth/register
exports.register = async (req, res) => {
  try {
    const { username, email, password, avatar } = req.body;
    
    // Check if user exists
    const userExists = await User.findOne({ $or: [{ email }, { username }] });
    if (userExists) {
      return res.status(400).json({ error: 'User already exists' });
    }
    
    // Create user
    const user = await User.create({
      username,
      email,
      password,
      avatar: avatar || 'avatar1'
    });
    
    res.status(201).json({
      _id: user._id,
      username: user.username,
      email: user.email,
      avatar: user.avatar,
      token: generateToken(user._id)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = await User.findOne({ email });
    
    if (user && (await user.comparePassword(password))) {
      res.json({
        _id: user._id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        stats: user.stats,
        token: generateToken(user._id)
      });
    } else {
      res.status(401).json({ error: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Update user stats
// @route   PUT /api/auth/stats
exports.updateStats = async (req, res) => {
  try {
    const { stats } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: { stats } },
      { new: true }
    ).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Guest login
// @route   POST /api/auth/guest
exports.guestLogin = async (req, res) => {
  try {
    const { username } = req.body;
    
    // Create a temporary guest user
    const guestId = `guest_${Date.now()}`;
    const guestUser = {
      _id: guestId,
      username: username || `Player_${Math.floor(Math.random() * 10000)}`,
      avatar: `avatar${Math.floor(Math.random() * 4) + 1}`,
      isGuest: true
    };
    
    res.json({
      ...guestUser,
      token: generateToken(guestId)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};