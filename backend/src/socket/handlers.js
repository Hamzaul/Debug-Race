const Team = require('../models/Team');
const Race = require('../models/Race');
const { calculateSpeed, checkPowerupUnlock } = require('../utils/helpers');
const { SOCKET_EVENTS, SPEED } = require('../utils/constants');

module.exports = (io, socket, rooms, playerRooms) => {
  
  // Create Room
  socket.on(SOCKET_EVENTS.CREATE_ROOM, async (data) => {
    try {
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
        status: 'waiting',
        race: null
      };
      
      rooms.set(teamCode, room);
      playerRooms.set(socket.id, teamCode);
      
      socket.join(teamCode);
      io.to(teamCode).emit('roomUpdate', room);
      
      console.log(`🏠 Room created: ${teamCode}`);
    } catch (error) {
      socket.emit(SOCKET_EVENTS.ERROR, { message: error.message });
    }
  });

  // Join Room
  socket.on(SOCKET_EVENTS.JOIN_ROOM, async (data) => {
    try {
      const { teamCode, userId, username, avatar } = data;
      
      if (!rooms.has(teamCode)) {
        socket.emit(SOCKET_EVENTS.ERROR, { message: 'Room not found' });
        return;
      }
      
      const room = rooms.get(teamCode);
      
      if (room.players.length >= 4) {
        socket.emit(SOCKET_EVENTS.ERROR, { message: 'Room is full' });
        return;
      }
      
      if (room.status !== 'waiting') {
        socket.emit(SOCKET_EVENTS.ERROR, { message: 'Race already started' });
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
    } catch (error) {
      socket.emit(SOCKET_EVENTS.ERROR, { message: error.message });
    }
  });

  // Leave Room
  socket.on(SOCKET_EVENTS.LEAVE_ROOM, (data) => {
    const { teamCode } = data;
    
    if (rooms.has(teamCode)) {
      const room = rooms.get(teamCode);
      const leavingPlayer = room.players.find(p => p.socketId === socket.id);
      
      room.players = room.players.filter(p => p.socketId !== socket.id);
      
      // If leader leaves, assign new leader
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
  });

  // Player Ready
  socket.on(SOCKET_EVENTS.PLAYER_READY, (data) => {
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
  socket.on(SOCKET_EVENTS.START_RACE, async (data) => {
    const { teamCode, raceId } = data;
    
    if (rooms.has(teamCode)) {
      const room = rooms.get(teamCode);
      room.status = 'racing';
      room.raceId = raceId;
      
      // Initialize race state for each player
      room.raceState = {};
      room.players.forEach(player => {
        room.raceState[player.socketId] = {
          position: 0,
          speed: SPEED.DEFAULT,
          lap: 1,
          nitro: 0,
          shield: false,
          streak: 0,
          finished: false
        };
      });
      
      // Countdown
      for (let i = 3; i >= 0; i--) {
        io.to(teamCode).emit(SOCKET_EVENTS.COUNTDOWN, { count: i });
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      io.to(teamCode).emit(SOCKET_EVENTS.START_RACE, {
        raceId,
        players: room.players.map(p => ({
          ...p,
          ...room.raceState[p.socketId]
        }))
      });
    }
  });

  // Answer Submitted
  socket.on(SOCKET_EVENTS.ANSWER_SUBMITTED, async (data) => {
    const { teamCode, isCorrect, responseTime } = data;
    
    if (rooms.has(teamCode)) {
      const room = rooms.get(teamCode);
      const playerState = room.raceState[socket.id];
      
      if (playerState) {
        // Update streak
        if (isCorrect) {
          playerState.streak += 1;
          
          // Check for powerup unlock
          const powerup = checkPowerupUnlock(playerState.streak);
          if (powerup) {
            playerState[powerup.toLowerCase()] = powerup === 'NITRO' ? 100 : true;
            socket.emit('powerupUnlocked', { type: powerup });
          }
        } else {
          playerState.streak = 0;
        }
        
        // Calculate new speed
        const hasNitro = playerState.nitro > 0;
        playerState.speed = calculateSpeed(playerState.speed, isCorrect, hasNitro);
        
        if (hasNitro && isCorrect) {
          playerState.nitro = Math.max(0, playerState.nitro - 20);
        }
        
        // Broadcast speed update
        io.to(teamCode).emit(SOCKET_EVENTS.SPEED_UPDATE, {
          playerId: socket.id,
          speed: playerState.speed,
          streak: playerState.streak
        });
      }
    }
  });

  // Position Update (from Phaser game loop)
  socket.on(SOCKET_EVENTS.POSITION_UPDATE, (data) => {
    const { teamCode, position, lap } = data;
    
    if (rooms.has(teamCode)) {
      const room = rooms.get(teamCode);
      const playerState = room.raceState[socket.id];
      
      if (playerState) {
        playerState.position = position;
        
        // Check for lap completion
        if (lap > playerState.lap) {
          playerState.lap = lap;
          io.to(teamCode).emit(SOCKET_EVENTS.LAP_COMPLETE, {
            playerId: socket.id,
            lap
          });
        }
        
        // Broadcast to all players
        io.to(teamCode).emit(SOCKET_EVENTS.POSITION_UPDATE, {
          playerId: socket.id,
          position,
          lap,
          speed: playerState.speed
        });
      }
    }
  });

  // Powerup Used
  socket.on(SOCKET_EVENTS.POWERUP_USED, (data) => {
    const { teamCode, powerupType, targetId } = data;
    
    if (rooms.has(teamCode)) {
      const room = rooms.get(teamCode);
      const playerState = room.raceState[socket.id];
      
      if (powerupType === 'SLOW' && targetId) {
        const targetState = room.raceState[targetId];
        if (targetState && !targetState.shield) {
          targetState.speed = Math.max(SPEED.MIN, targetState.speed - 30);
          io.to(targetId).emit('slowedDown', { duration: 3000 });
        }
      }
      
      if (powerupType === 'NITRO') {
        playerState.speed = Math.min(SPEED.MAX, playerState.speed + 50);
        playerState.nitro = 0;
      }
      
      io.to(teamCode).emit(SOCKET_EVENTS.POWERUP_USED, {
        userId: socket.id,
        powerupType,
        targetId
      });
    }
  });

  // Race Finished
  socket.on(SOCKET_EVENTS.RACE_FINISHED, async (data) => {
    const { teamCode, finishTime } = data;
    
    if (rooms.has(teamCode)) {
      const room = rooms.get(teamCode);
      const playerState = room.raceState[socket.id];
      
      if (playerState && !playerState.finished) {
        playerState.finished = true;
        playerState.finishTime = finishTime;
        
        // Calculate rank
        const finishedPlayers = Object.values(room.raceState).filter(p => p.finished);
        playerState.rank = finishedPlayers.length;
        
        io.to(teamCode).emit('playerFinished', {
          playerId: socket.id,
          rank: playerState.rank,
          finishTime
        });
        
        // Check if all players finished
        const allFinished = Object.values(room.raceState).every(p => p.finished);
        if (allFinished) {
          room.status = 'finished';
          io.to(teamCode).emit(SOCKET_EVENTS.RACE_FINISHED, {
            results: Object.entries(room.raceState).map(([socketId, state]) => ({
              socketId,
              ...state
            })).sort((a, b) => a.rank - b.rank)
          });
        }
      }
    }
  });

  // Send Question
  socket.on('sendQuestion', (data) => {
    const { teamCode, question, questionIndex } = data;
    io.to(teamCode).emit(SOCKET_EVENTS.NEW_QUESTION, { question, questionIndex });
  });
};