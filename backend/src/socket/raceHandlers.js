const rooms = new Map();

module.exports = function(io, socket){

  socket.on("createRoom", data => {
    const { teamCode, userId, username, avatar } = data;

    socket.join(teamCode);

    rooms.set(teamCode,[{
      id:userId,
      socketId:socket.id,
      username,
      avatar,
      isReady:false,
      isLeader:true
    }]);

    io.to(teamCode).emit("roomUpdate",{
      code:teamCode,
      players:rooms.get(teamCode),
      status:"waiting"
    });
  });

  socket.on("disconnect",()=>{
    console.log("Player disconnected:", socket.id);
  });

};