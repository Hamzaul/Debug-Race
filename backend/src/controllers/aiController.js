const { generateQuestion } = require('../services/openaiService');
const { getAdaptiveQuestion } = require('../services/questionService');
const Question = require('../models/Question');

// @desc    Generate AI question
// @route   POST /api/ai/generate-question
exports.generateAIQuestion = async (req, res) => {
  try {
    const { language, level, questionType, performanceData } = req.body;
    
    console.log(`📥 Generate question request:`, { language, level, questionType });
    
    // Validate input
    if (!language || !level || !questionType) {
      return res.status(400).json({ 
        error: 'Missing required fields: language, level, questionType' 
      });
    }
    
    // Adjust difficulty based on performance
    let adjustedDifficulty = parseInt(level);
    
    if (performanceData) {
      const { recentAccuracy, streak } = performanceData;
      
      // Increase difficulty if performing well
      if (recentAccuracy > 0.8 && streak >= 3) {
        adjustedDifficulty = Math.min(5, adjustedDifficulty + 1);
        console.log(`  📈 Difficulty increased to ${adjustedDifficulty} (high accuracy)`);
      } 
      // Decrease difficulty if struggling
      else if (recentAccuracy < 0.4) {
        adjustedDifficulty = Math.max(1, adjustedDifficulty - 1);
        console.log(`  📉 Difficulty decreased to ${adjustedDifficulty} (low accuracy)`);
      }
    }
    
    // Generate question using OpenAI
    const questionData = await generateQuestion({
      language,
      difficulty: adjustedDifficulty,
      type: questionType,
      performanceData
    });
    
    // Save to database
    const question = await Question.create({
      ...questionData,
      language,
      difficulty: adjustedDifficulty,
      type: questionType,
      isAIGenerated: true
    });
    
    console.log(`✅ Question generated and saved: ${question._id}`);
    
    res.json(question);
    
  } catch (error) {
    console.error('❌ AI Generation Error:', error);
    res.status(500).json({ 
      error: error.message,
      fallback: 'Using cached question instead'
    });
  }
};

// @desc    Get cached questions
// @route   GET /api/ai/questions
exports.getCachedQuestions = async (req, res) => {
  try {
    const { language, level, type, limit = 10 } = req.query;
    
    const query = {};
    if (language) query.language = language;
    if (level) query.difficulty = parseInt(level);
    if (type) query.type = type;
    
    const questions = await Question.find(query)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });
    
    console.log(`📚 Retrieved ${questions.length} cached questions`);
    
    res.json(questions);
    
  } catch (error) {
    console.error('❌ Error fetching questions:', error);
    res.status(500).json({ error: error.message });
  }
};

// @desc    Get question statistics
// @route   GET /api/ai/stats
exports.getQuestionStats = async (req, res) => {
  try {
    const stats = await Question.aggregate([
      {
        $group: {
          _id: {
            language: '$language',
            difficulty: '$difficulty',
            type: '$type'
          },
          count: { $sum: 1 },
          avgSuccessRate: { $avg: '$successRate' },
          totalUsage: { $sum: '$usageCount' }
        }
      },
      {
        $sort: { '_id.language': 1, '_id.difficulty': 1, '_id.type': 1 }
      }
    ]);
    
    const summary = {
      total: await Question.countDocuments(),
      byLanguage: {},
      byDifficulty: {},
      byType: {}
    };
    
    stats.forEach(stat => {
      const { language, difficulty, type } = stat._id;
      
      if (!summary.byLanguage[language]) summary.byLanguage[language] = 0;
      summary.byLanguage[language] += stat.count;
      
      if (!summary.byDifficulty[difficulty]) summary.byDifficulty[difficulty] = 0;
      summary.byDifficulty[difficulty] += stat.count;
      
      if (!summary.byType[type]) summary.byType[type] = 0;
      summary.byType[type] += stat.count;
    });
    
    res.json({
      summary,
      detailed: stats
    });
    
  } catch (error) {
    console.error('❌ Error getting stats:', error);
    res.status(500).json({ error: error.message });
  }
};

// @desc    Test AI generation
// @route   POST /api/ai/test-generation
exports.testGeneration = async (req, res) => {
  try {
    const { language = 'Python', level = 1, type = 'MCQ' } = req.body;
    
    console.log(`🧪 Testing AI generation: ${language} L${level} ${type}`);
    
    const question = await generateQuestion({
      language,
      difficulty: parseInt(level),
      type
    });
    
    res.json({
      success: true,
      message: 'AI generation working',
      question
    });
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
};