const express = require('express');
const http = require('http');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const app = express();
const server = http.createServer(app);

// Middleware
app.use(cors({
  origin: '*', // Allow all origins for MVP
  credentials: true
}));
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  console.log(`📥 ${req.method} ${req.path}`);
  next();
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Test endpoint
app.get('/api/test', (req, res) => {
  res.json({ message: 'Backend is working!' });
});

// Connect to MongoDB
const mongoose = require('mongoose');
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/debugrace');
    console.log('✅ MongoDB Connected');
  } catch (error) {
    console.error('⚠️  MongoDB connection failed:', error.message);
    console.log('📝 Server will continue without database...');
  }
};

// Initialize Socket.io
const { Server } = require('socket.io');
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Socket connection handler
io.on('connection', (socket) => {
  console.log('🔌 Player connected:', socket.id);
  
  // Store active rooms
  const rooms = new Map();
  
  // Create Room
  socket.on('createRoom', (data) => {
    const { teamCode, userId, username, avatar } = data;
    console.log('🏠 Creating room:', teamCode);
    
    socket.join(teamCode);
    io.to(teamCode).emit('roomUpdate', {
      code: teamCode,
      players: [{
        id: userId,
        socketId: socket.id,
        username,
        avatar,
        isReady: false,
        isLeader: true
      }],
      status: 'waiting'
    });
  });
  
  // Join Room
  socket.on('joinRoom', (data) => {
    const { teamCode, userId, username, avatar } = data;
    console.log('👤 Joining room:', teamCode);
    
    socket.join(teamCode);
    io.to(teamCode).emit('playerJoined', { username, socketId: socket.id });
  });
  
  // Player Ready
  socket.on('playerReady', (data) => {
    const { teamCode, isReady } = data;
    console.log('✋ Player ready:', socket.id, isReady);
    
    io.to(teamCode).emit('playerReadyUpdate', {
      socketId: socket.id,
      isReady
    });
  });
  
  // Start Race
  socket.on('startRace', (data) => {
    const { teamCode, raceId } = data;
    console.log('🏁 Starting race:', raceId);
    
    io.to(teamCode).emit('raceStarting', { raceId });
  });
  
  // Answer Submitted
  socket.on('answerSubmitted', (data) => {
    const { teamCode, isCorrect, responseTime } = data;
    console.log('📝 Answer:', isCorrect ? '✓' : '✗');
    
    io.to(teamCode).emit('speedUpdate', {
      playerId: socket.id,
      isCorrect,
      speedChange: isCorrect ? 15 : -20
    });
  });
  
  // Position Update
  socket.on('positionUpdate', (data) => {
    const { teamCode, position, lap, speed } = data;
    
    io.to(teamCode).emit('positionUpdate', {
      playerId: socket.id,
      position,
      lap,
      speed
    });
  });
  
  // Disconnect
  socket.on('disconnect', () => {
    console.log('🔌 Player disconnected:', socket.id);
  });
});

// Make io accessible to routes
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Routes - NO AUTHENTICATION for MVP
app.use('/api/auth', require('./routes/auth'));
app.use('/api/team', require('./routes/team'));
app.use('/api/race', require('./routes/race'));
app.use('/api/ai', require('./routes/ai'));

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: `Cannot ${req.method} ${req.path}` });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('❌ Error:', err.message);
  res.status(500).json({ error: err.message });
});

// Start server
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();
  
  server.listen(PORT, () => {
    console.log(`
╔═══════════════════════════════════════════════════════════╗
║            🏎️  DEBUG RACE SERVER RUNNING  🏎️              ║
╠═══════════════════════════════════════════════════════════╣
║  🌐 Port:      ${PORT}                                        ║
║  🔧 Mode:      ${process.env.NODE_ENV || 'development'}                               ║
║  ⏰ Time:      ${new Date().toLocaleTimeString()}                                ║
╠═══════════════════════════════════════════════════════════╣
║  📍 Endpoints:                                            ║
║     GET  /health            - Health check                ║
║     GET  /api/test          - API test                    ║
║     *    /api/auth/*        - Auth routes                 ║
║     *    /api/team/*        - Team routes                 ║
║     *    /api/race/*        - Race routes                 ║
║     *    /api/ai/*          - AI/Question routes          ║
╚═══════════════════════════════════════════════════════════╝
    `);
  });
};

startServer();