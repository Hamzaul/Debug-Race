const { Server } = require('socket.io');

const initializeSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:5173',
      methods: ['GET', 'POST'],
      credentials: true
    }
  });

  // Store active rooms
  const rooms = new Map();
  const playerRooms = new Map();

  io.on('connection', (socket) => {
    console.log(`🔌 Player connected: ${socket.id}`);

    // Create Room
    socket.on('createRoom', (data) => {
      const { teamCode, userId, username, avatar } = data;
      
      const room = {
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
      };
      
      rooms.set(teamCode, room);
      playerRooms.set(socket.id, teamCode);
      socket.join(teamCode);
      
      io.to(teamCode).emit('roomUpdate', room);
      console.log(`🏠 Room created: ${teamCode}`);
    });

    // Join Room
    socket.on('joinRoom', (data) => {
      const { teamCode, userId, username, avatar } = data;
      
      if (!rooms.has(teamCode)) {
        socket.emit('error', { message: 'Room not found' });
        return;
      }
      
      const room = rooms.get(teamCode);
      
      if (room.players.length >= 4) {
        socket.emit('error', { message: 'Room is full' });
        return;
      }
      
      room.players.push({
        id: userId,
        socketId: socket.id,
        username,
        avatar,
        isReady: false,
        isLeader: false
      });
      
      playerRooms.set(socket.id, teamCode);
      socket.join(teamCode);
      
      io.to(teamCode).emit('roomUpdate', room);
      console.log(`👤 Player joined room: ${teamCode}`);
    });

    // Player Ready
    socket.on('playerReady', (data) => {
      const { teamCode, isReady } = data;
      
      if (rooms.has(teamCode)) {
        const room = rooms.get(teamCode);
        const player = room.players.find(p => p.socketId === socket.id);
        
        if (player) {
          player.isReady = isReady;
          io.to(teamCode).emit('roomUpdate', room);
        }
      }
    });

    // Start Race
    socket.on('startRace', async (data) => {
      const { teamCode, raceId } = data;
      
      if (rooms.has(teamCode)) {
        const room = rooms.get(teamCode);
        room.status = 'racing';
        room.raceId = raceId;
        
        // Countdown
        for (let i = 3; i >= 0; i--) {
          io.to(teamCode).emit('countdown', { count: i });
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
        
        io.to(teamCode).emit('startRace', { raceId });
      }
    });

    // Speed Update
    socket.on('answerSubmitted', (data) => {
      const { teamCode, isCorrect, responseTime } = data;
      
      if (rooms.has(teamCode)) {
        const room = rooms.get(teamCode);
        const player = room.players.find(p => p.socketId === socket.id);
        
        if (player) {
          // Calculate new speed
          let speedChange = isCorrect ? 15 : -20;
          
          io.to(teamCode).emit('speedUpdate', {
            playerId: socket.id,
            speedChange,
            isCorrect
          });
        }
      }
    });

    // Position Update
    socket.on('positionUpdate', (data) => {
      const { teamCode, position, lap, speed } = data;
      
      if (rooms.has(teamCode)) {
        io.to(teamCode).emit('positionUpdate', {
          playerId: socket.id,
          position,
          lap,
          speed
        });
      }
    });

    // Leave Room
    socket.on('leaveRoom', (data) => {
      const { teamCode } = data;
      handleLeaveRoom(socket, teamCode);
    });

    // Disconnect
    socket.on('disconnect', () => {
      console.log(`🔌 Player disconnected: ${socket.id}`);
      const roomCode = playerRooms.get(socket.id);
      if (roomCode) {
        handleLeaveRoom(socket, roomCode);
      }
    });

    function handleLeaveRoom(socket, teamCode) {
      if (rooms.has(teamCode)) {
        const room = rooms.get(teamCode);
        const leavingPlayer = room.players.find(p => p.socketId === socket.id);
        
        room.players = room.players.filter(p => p.socketId !== socket.id);
        
        if (leavingPlayer?.isLeader && room.players.length > 0) {
          room.players[0].isLeader = true;
        }
        
        if (room.players.length === 0) {
          rooms.delete(teamCode);
        } else {
          io.to(teamCode).emit('roomUpdate', room);
        }
      }
      
      playerRooms.delete(socket.id);
      socket.leave(teamCode);
    }
  });

  return io;
};

module.exports = initializeSocket;