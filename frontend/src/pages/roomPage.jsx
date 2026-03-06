import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import socket from "../services/socket";
import { getPlayers, leaveLobby } from "../features/lobby/lobbyAPI";
import "../styles/roomPage.css";

const RoomPage = () => {

  const { code } = useParams();
  const navigate = useNavigate();

  const [players, setPlayers] = useState([]);
  const [leader, setLeader] = useState(null);
  const [userId, setUserId] = useState("");

  useEffect(() => {

    loadPlayers();

    socket.emit("join_lobby", code);

    socket.on("player_joined", (data) => {
      if (data?.players) setPlayers(data.players);
    });

    socket.on("player_left", (data) => {
      if (data?.players) setPlayers(data.players);
    });

    socket.on("ready_updated", (data) => {
      if (data?.players) setPlayers(data.players);
    });

    return () => {
      socket.off("player_joined");
      socket.off("player_left");
      socket.off("ready_updated");
    };

  }, []);

  const loadPlayers = async () => {
    try {

      const res = await getPlayers(code);

      setPlayers(res.data.members);
      setLeader(res.data.leader);
      setUserId(res.data.currentUser);

    } catch (err) {
      console.log(err);
    }
  };

  const handleLeave = async () => {
    try {

      await leaveLobby(code);

      socket.emit("leave_lobby", code);

      navigate("/home");

    } catch (err) {
      console.log(err);
    }
  };

  const toggleReady = () => {

    socket.emit("toggle_ready", {
      code,
      userId
    });

  };

  const startRace = () => {

    socket.emit("start_race", {
      code
    });

  };

  const renderSlots = () => {

    const slots = [];

    for (let i = 0; i < 4; i++) {

      const player = players[i];

      if (player) {

        const playerId = player?.user?._id;

        const isCurrentUser = String(userId) === String(playerId);

        const isLeader =
          leader && String(leader._id) === String(playerId);

        slots.push(

          <div key={i} className="player-box">

            <div className="player-top">

              <div className="player-name">

                {isLeader && (
                  <span className="leader">👑</span>
                )}

                {player.username}

              </div>

              <div
                className={`status ${
                  player.isReady ? "ready" : "not-ready"
                }`}
              >
                {player.isReady ? "READY" : "NOT READY"}
              </div>

            </div>

            {isCurrentUser && (

              <div className="player-actions">

                <button
                  className="ready-btn"
                  onClick={toggleReady}
                >
                  {player.isReady ? "UNREADY" : "READY"}
                </button>

                <button
                  className="leave-btn"
                  onClick={handleLeave}
                >
                  EXIT LOBBY
                </button>

              </div>

            )}

          </div>

        );

      } else {

        slots.push(

          <div key={i} className="player-box empty">
            WAITING FOR PLAYER
          </div>

        );

      }

    }

    return slots;

  };

  const isLeaderUser =
    leader && String(userId) === String(leader._id);

  return (

    <div className="room-container">

      <div className="room-header">

        <h1 className="logo">DEBUG RACE</h1>

        <div className="lobby-code">
          LOBBY CODE : <span>{code}</span>
        </div>

      </div>

      <div className="players-grid">
        {renderSlots()}
      </div>

      {isLeaderUser && (

        <div className="start-container">

          <button
            className="start-btn"
            onClick={startRace}
          >
            START RACE
          </button>

        </div>

      )}

    </div>

  );

};

export default RoomPage;