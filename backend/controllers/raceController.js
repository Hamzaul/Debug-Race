const Race = require('../models/Race');
const Team = require('../models/Team');
const RaceResult = require('../models/RaceResult');
const User = require('../models/User');
const { generateQuestionsForRace } = require('../services/questionService');
const { calculateXP, calculateSuggestedLevel } = require('../utils/helpers');

// @desc    Start race
// @route   POST /api/race/start
exports.startRace = async (req, res) => {
  try {
    const { teamCode } = req.body;
    
    const team = await Team.findOne({ code: teamCode });
    
    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }
    
    if (team.leader.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Only leader can start the race' });
    }
    
    // Generate questions for the race
    const questions = await generateQuestionsForRace(
      team.settings.language,
      team.settings.level,
      team.getLaps()
    );
    
    // Create race
    const race = await Race.create({
      team: team._id,
      players: team.members.map(m => ({
        user: m.user,
        username: m.username,
        socketId: m.socketId,
        position: 0,
        speed: 50,
        lap: 1
      })),
      settings: {
        language: team.settings.language,
        level: team.settings.level,
        totalLaps: team.getLaps()
      },
      questions: questions.map((q, idx) => ({
        question: q._id,
        lap: Math.floor(idx / 2) + 1,
        type: idx % 2 === 0 ? 'MCQ' : 'DEBUG'
      })),
      status: 'racing',
      startTime: new Date()
    });
    
    // Update team status
    team.status = 'racing';
    team.currentRace = race._id;
    await team.save();
    
    res.json({ race, questions });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Get race status
// @route   GET /api/race/:raceId
exports.getRace = async (req, res) => {
  try {
    const race = await Race.findById(req.params.raceId)
      .populate('questions.question')
      .populate('players.user', 'username avatar');
    
    if (!race) {
      return res.status(404).json({ error: 'Race not found' });
    }
    
    res.json(race);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Submit answer
// @route   POST /api/race/:raceId/answer
exports.submitAnswer = async (req, res) => {
  try {
    const { questionId, answer, responseTime } = req.body;
    const race = await Race.findById(req.params.raceId)
      .populate('questions.question');
    
    if (!race) {
      return res.status(404).json({ error: 'Race not found' });
    }
    
    const question = race.questions.find(
      q => q.question._id.toString() === questionId
    );
    
    const isCorrect = question.question.correctAnswer === answer;
    
    // Update player stats in race
    const playerIndex = race.players.findIndex(
      p => p.user.toString() === req.user._id.toString()
    );
    
    if (playerIndex !== -1) {
      race.players[playerIndex].questionsAnswered += 1;
      race.players[playerIndex].totalResponseTime += responseTime;
      
      if (isCorrect) {
        race.players[playerIndex].correctAnswers += 1;
        race.players[playerIndex].streak += 1;
      } else {
        race.players[playerIndex].streak = 0;
      }
    }
    
    await race.save();
    
    res.json({
      isCorrect,
      correctAnswer: question.question.correctAnswer,
      explanation: question.question.explanation,
      streak: race.players[playerIndex].streak
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Finish race for player
// @route   POST /api/race/:raceId/finish
exports.finishRace = async (req, res) => {
  try {
    const race = await Race.findById(req.params.raceId);
    
    if (!race) {
      return res.status(404).json({ error: 'Race not found' });
    }
    
    const playerIndex = race.players.findIndex(
      p => p.user.toString() === req.user._id.toString()
    );
    
    if (playerIndex !== -1 && !race.players[playerIndex].finished) {
      race.players[playerIndex].finished = true;
      race.players[playerIndex].finishTime = Date.now() - race.startTime;
      
      // Calculate rank
      const finishedPlayers = race.players.filter(p => p.finished);
      race.players[playerIndex].rank = finishedPlayers.length;
      
      await race.save();
      
      // Create race result
      const player = race.players[playerIndex];
      const accuracy = player.correctAnswers / player.questionsAnswered;
      
      const raceResult = await RaceResult.create({
        race: race._id,
        user: req.user._id,
        rank: player.rank,
        stats: {
          totalQuestions: player.questionsAnswered,
          correctAnswers: player.correctAnswers,
          accuracy,
          averageResponseTime: player.totalResponseTime / player.questionsAnswered,
          bestStreak: player.streak
        },
        xpEarned: calculateXP(player.rank, player.correctAnswers, player.questionsAnswered, race.settings.level),
        suggestedLevel: calculateSuggestedLevel(accuracy, race.settings.level)
      });
      
      // Update user stats
      await User.findByIdAndUpdate(req.user._id, {
        $inc: {
          'stats.totalRaces': 1,
          'stats.wins': player.rank === 1 ? 1 : 0,
          'stats.totalQuestions': player.questionsAnswered,
          'stats.correctAnswers': player.correctAnswers,
          xp: raceResult.xpEarned
        }
      });
      
      res.json({ raceResult });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Get race results
// @route   GET /api/race/:raceId/results
exports.getRaceResults = async (req, res) => {
  try {
    const results = await RaceResult.find({ race: req.params.raceId })
      .populate('user', 'username avatar')
      .populate('wrongAnswers.question')
      .sort({ rank: 1 });
    
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};