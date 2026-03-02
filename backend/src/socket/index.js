const { Server } = require('socket.io');

const initializeSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:5173',
      methods: ['GET', 'POST'],
      credentials: true
    }
  });

  // Centralized "rooms" (lobbies) store
  const rooms = new Map(); // Map<teamCode, lobbyObject>
  const playerToRoomMap = new Map(); // Map<socketId, teamCode>

  io.on('connection', (socket) => {
    console.log(`🔌 Player connected: ${socket.id}`);
    
    // --- Helper function to emit room state ---
    const emitRoomUpdate = (teamCode) => {
      const room = rooms.get(teamCode);
      if (room) {
        // Only send necessary player info
        io.to(teamCode).emit('roomUpdate', {
          code: room.code,
          name: room.name,
          settings: room.settings,
          status: room.status,
          players: room.players.map(p => ({
            userId: p.userId,
            username: p.username,
            avatar: p.avatar,
            isReady: p.isReady,
            isLeader: p.isLeader,
            socketId: p.socketId // Include socketId for client-side mapping
          }))
        });
        console.log(`Socket: roomUpdate emitted for ${teamCode}`);
      }
    };

    // --- Events ---

    // Create Room
    socket.on('createRoom', (data) => {
      const { teamCode, userId, username, avatar, isLeader } = data;
      console.log(`Socket: createRoom request from ${username} for ${teamCode}`);

      if (rooms.has(teamCode)) {
        socket.emit('error', { message: 'Lobby code already exists. Please try again.' });
        return;
      }

      // Create a new lobby entry in the server's memory
      const newLobby = {
        code: teamCode,
        name: `Lobby-${teamCode}`, // Default name if not passed from API
        settings: { language: 'Python', level: 1, maxPlayers: 4 }, // Default settings for in-memory, will be overwritten by API call
        status: 'waiting',
        leaderId: userId, // The global user ID of the leader
        players: [{
          userId: userId,
          username: username,
          avatar: avatar,
          isReady: false,
          isLeader: true,
          socketId: socket.id
        }]
      };
      
      // Update with details from DB if available (assuming API call precedes this)
      // This is simplified. In a full app, you'd fetch the lobby from DB here
      // to populate `newLobby.name`, `newLobby.settings`, etc.
      // For now, `HomePage.jsx`'s `handleCreateLobby` will have already set the GameContext's `state.team`
      // which has correct data from `teamAPI.create`.

      rooms.set(teamCode, newLobby);
      playerToRoomMap.set(socket.id, teamCode);
      socket.join(teamCode);
      emitRoomUpdate(teamCode);
      console.log(`Socket: Lobby ${teamCode} created by ${username}.`);
    });

    // Join Room
    socket.on('joinRoom', (data) => {
      const { teamCode, userId, username, avatar } = data;
      console.log(`Socket: joinRoom request from ${username} for ${teamCode}`);

      const lobby = rooms.get(teamCode);

      if (!lobby) {
        socket.emit('error', { message: 'Lobby not found. Please check the code.' });
        return;
      }
      if (lobby.players.length >= lobby.settings.maxPlayers) {
        socket.emit('error', { message: 'Lobby is full. Cannot join.' });
        return;
      }
      if (lobby.status !== 'waiting') {
        socket.emit('error', { message: 'Race is already in progress. Cannot join.' });
        return;
      }
      // Check if user already in lobby
      if (lobby.players.some(p => p.userId === userId)) {
        // If they are, just update their socketId if it changed (e.g., reconnect)
        lobby.players = lobby.players.map(p => p.userId === userId ? { ...p, socketId: socket.id } : p);
        console.log(`Socket: User ${username} reconnected to lobby ${teamCode}`);
      } else {
        // Add new player to lobby
        lobby.players.push({
          userId: userId,
          username: username,
          avatar: avatar,
          isReady: false,
          isLeader: false, // Only the creator is leader
          socketId: socket.id
        });
        console.log(`Socket: User ${username} joined lobby ${teamCode}.`);
      }

      playerToRoomMap.set(socket.id, teamCode);
      socket.join(teamCode);
      emitRoomUpdate(teamCode);
    });

    // Player Ready
    socket.on('playerReady', (data) => {
      const { teamCode, userId, isReady } = data;
      console.log(`Socket: playerReady from ${userId} for ${teamCode}: ${isReady}`);

      const lobby = rooms.get(teamCode);
      if (!lobby) return;

      const playerIndex = lobby.players.findIndex(p => p.userId === userId);
      if (playerIndex !== -1) {
        lobby.players[playerIndex].isReady = isReady;
        emitRoomUpdate(teamCode);
      }
    });

    // Request Race Start (from leader)
    socket.on('requestRaceStart', async (data) => {
      const { teamCode, raceId } = data;
      console.log(`Socket: Race start requested for ${teamCode}, Race ID: ${raceId}`);

      const lobby = rooms.get(teamCode);
      if (!lobby) {
        socket.emit('error', { message: 'Lobby not found for race start.' });
        return;
      }
      if (lobby.leaderId !== lobby.players.find(p => p.socketId === socket.id)?.userId) {
          socket.emit('error', { message: 'Only the lobby leader can start the race.' });
          return;
      }
      if (lobby.players.length < 1) { // Min 1 player to start (the leader)
          socket.emit('error', { message: 'At least one player is required to start a race.' });
          return;
      }
      if (!lobby.players.every(p => p.isReady)) {
          socket.emit('error', { message: 'All players must be ready to start the race.' });
          return;
      }
      
      lobby.status = 'racing';
      emitRoomUpdate(teamCode); // Update lobby status for all clients

      // --- Countdown Sequence ---
      let countdown = 5; // F1 style 5 red lights + 1 green
      const countdownInterval = setInterval(() => {
        if (countdown > 0) {
            io.to(teamCode).emit('countdown', { count: countdown }); // Emit current count
            console.log(`Socket: Countdown for ${teamCode}: ${countdown}`);
            countdown--;
        } else {
            clearInterval(countdownInterval);
            io.to(teamCode).emit('raceStarting', { raceId: raceId }); // Emit final 'GO!' and race ID
            console.log(`Socket: Race ${raceId} started for ${teamCode}!`);
            // Clean up lobby data (optional, depends on game flow)
            // rooms.delete(teamCode); 
        }
      }, 800); // 0.8 seconds per light

    });

    // Player Connected (for re-joining / initial lobby data sync)
    // This is useful when a player navigates back to a lobby or reconnects
    socket.on('playerConnected', (data) => {
        const { teamCode, userId, username, avatar } = data;
        const lobby = rooms.get(teamCode);

        if (!lobby) {
            // Lobby not found on server side, possibly old data or server restart.
            socket.emit('error', { message: 'Lobby not found on server. Please try creating or joining again.' });
            return;
        }

        // Update existing player's socketId or add if not present
        const playerIndex = lobby.players.findIndex(p => p.userId === userId);
        if (playerIndex !== -1) {
            lobby.players[playerIndex].socketId = socket.id;
        } else {
            // This case should ideally not happen if a player connects via API.
            // But if they just reloaded the page directly into /lobby/:code
            lobby.players.push({
                userId: userId,
                username: username,
                avatar: avatar,
                isReady: false,
                isLeader: false,
                socketId: socket.id
            });
        }
        playerToRoomMap.set(socket.id, teamCode);
        socket.join(teamCode);
        emitRoomUpdate(teamCode); // Send full room update to the newly connected/reconnected player
        console.log(`Socket: Player ${username} re-syncing with lobby ${teamCode}`);
    });


    // --- Disconnect & Leave Room Logic ---
    socket.on('disconnect', () => {
      console.log(`🔌 Player disconnected: ${socket.id}`);
      const teamCode = playerToRoomMap.get(socket.id);
      if (teamCode) {
        const lobby = rooms.get(teamCode);
        if (lobby) {
          // Remove player
          lobby.players = lobby.players.filter(p => p.socketId !== socket.id);
          console.log(`Socket: ${socket.id} removed from lobby ${teamCode}. Remaining: ${lobby.players.length}`);

          if (lobby.players.length === 0) {
            rooms.delete(teamCode); // Delete lobby if no players left
            console.log(`Socket: Lobby ${teamCode} is empty and deleted.`);
          } else {
            // If leader disconnected, assign new leader
            const disconnectedPlayerWasLeader = lobby.leaderId === lobby.players.find(p => p.userId === lobby.leaderId)?.userId;
            if (disconnectedPlayerWasLeader && lobby.players.length > 0) {
                const newLeader = lobby.players[0];
                lobby.leaderId = newLeader.userId;
                newLeader.isLeader = true;
                console.log(`Socket: New leader assigned for ${teamCode}: ${newLeader.username}`);
            }
            emitRoomUpdate(teamCode); // Update remaining players
          }
        }
        playerToRoomMap.delete(socket.id);
      }
    });
  });

  return io;
};

module.exports = initializeSocket;