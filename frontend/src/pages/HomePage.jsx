import { useState } from "react";
import { useAuth } from "../features/auth/features.authContext";
import { useNavigate } from "react-router-dom";
import{ api }from "../services/api.service";
import "../styles/homePage.css";
import{ useLobby }from "../features/lobby/LobbyContext"

const Home = () => {
  const{ joinLobbyByCode }= useLobby();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [showJoinModal, setShowJoinModal] = useState(false);
  const [code, setCode] = useState("");

  const handleCreate = async () => {

    try {

      // const res = await api.post("/lobby/create");
      

      navigate(`/lobby`);

    } catch (err) {
      console.log(err);
    }

  };

  const openJoinModal = () => {
    setShowJoinModal(true);
  };

  const closeJoinModal = () => {
    setShowJoinModal(false);
    setCode("");
  };

  const handleJoinLobby = async () => {

    if (!code) return;

    try {
      await joinLobbyByCode(code)

      navigate(`/room/${code.toUpperCase()}`);

    } catch (err) {
      alert("Lobby not found");
    }

  };

  return (
    <div className="home-container">

      {/* Top Navigation */}
      <div className="top-bar">
        <div className="logo">DEBUG RACE</div>

        <div className="top-icons">
          <button
            className="icon-btn"
            onClick={() => navigate("/profile")}
          >
            <i className="fa-regular fa-user"></i>
          </button>
        </div>
      </div>

      {/* Main Section */}
      <div className="hero-section">

        <h1 className="main-title">DEBUG RACE</h1>

        <p className="subtitle">
          MULTIPLAYER COMPETITIVE DEBUGGING ARENA
        </p>

        <div className="button-group">

          <button
            className="primary-action"
            onClick={handleCreate}
          >
            🚀 CREATE LOBBY
          </button>

          <button
            className="secondary-action"
            onClick={openJoinModal}
          >
            🔑 JOIN LOBBY
          </button>

          <button className="neutral-action">
            🏆 LEADERBOARD
          </button>

          <button className="neutral-action">
            📊 STATS
          </button>

        </div>

      </div>

      {/* JOIN LOBBY MODAL */}

      {showJoinModal && (

        <div className="modal-overlay">

          <div className="join-modal">

            <h2>JOIN LOBBY</h2>

            <input
              type="text"
              placeholder="ENTER ROOM CODE"
              value={code}
              onChange={(e)=>setCode(e.target.value)}
            />

            <div className="modal-actions">

              <button
                className="secondary-action"
                onClick={handleJoinLobby}
              >
                JOIN
              </button>

              <button
                className="neutral-action"
                onClick={closeJoinModal}
              >
                CANCEL
              </button>

            </div>

          </div>

        </div>

      )}

    </div>
  );
};

export default Home;