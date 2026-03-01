const mongoose = require('mongoose');
const dotenv = require('dotenv');
const { seedQuestionsWithAI } = require('../services/questionService');

dotenv.config();

const runSeed = async () => {
  try {
    console.log('🌱 Starting AI Question Seed...\n');
    
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB Connected\n');
    
    // Seed questions
    await seedQuestionsWithAI();
    
    console.log('\n✅ Seeding complete!');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Seed error:', error);
    process.exit(1);
  }
};

runSeed();