const Lobby = require("../models/lobby.model");

module.exports = function registerRaceHandlers(io, socket) {

  // JOIN LOBBY
  socket.on("join_lobby", async (code) => {

    socket.join(code);

    const lobby = await Lobby.findOne({ code })
      .populate("members.user", "username");

    if (!lobby) return;

    io.to(code).emit("player_joined", {
      players: lobby.members
    });

  });


  // LEAVE LOBBY
  socket.on("leave_lobby", async (code) => {

    socket.leave(code);

    const lobby = await Lobby.findOne({ code })
      .populate("members.user", "username");

    if (!lobby) return;

    io.to(code).emit("player_left", {
      players: lobby.members
    });

  });


  // TOGGLE READY
  socket.on("toggle_ready", async ({ code, userId }) => {

    const lobby = await Lobby.findOne({ code });

    if (!lobby) return;

    const member = lobby.members.find(
      m => m.user.toString() === userId
    );

    if (!member) return;

    member.isReady = !member.isReady;

    await lobby.save();

    const updatedLobby = await Lobby.findOne({ code })
      .populate("members.user", "username");

    io.to(code).emit("ready_updated", {
      players: updatedLobby.members
    });

  });


  // START RACE
  socket.on("start_race", async ({ code }) => {

    const lobby = await Lobby.findOne({ code });

    if (!lobby) return;

    const allReady = lobby.members.every(p => p.isReady);

    if (!allReady) {
      socket.emit("error", "All players must be ready");
      return;
    }

    io.to(code).emit("race_started", {
      message: "Race Started!"
    });

  });

};