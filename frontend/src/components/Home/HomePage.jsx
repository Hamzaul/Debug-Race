import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

// Import contexts and APIs
import { useGame } from '../../context/GameContext';
import { useSocket } from '../../context/SocketContext';
import { authAPI, teamAPI } from '../../services/api';
import { AVATAR_OPTIONS } from '../../utils/constants'; 

// --- F1 Icon Buttons (SVG) for Top Nav ---
const ProfileIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
    <circle cx="12" cy="7" r="4"></circle>
  </svg>
);

const SettingsIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3"></circle>
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
  </svg>
);

// --- List of Avatars (Emojis for simplicity, can be replaced with image URLs) ---



const Home = () => {
  const navigate = useNavigate();
  const { state, dispatch } = useGame(); // Access global game state
  const { emit } = useSocket(); // Access socket functions

  // Modal States
  const [activeModal, setActiveModal] = useState(null); // 'create', 'join', or null
  const [modalError, setModalError] = useState(null); // For displaying API/socket errors in modals
  
  // Create Lobby States
  const [lobbyNameInput, setLobbyNameInput] = useState('');
  const [leaderNameInput, setLeaderNameInput] = useState(''); // Leader's chosen name for THIS lobby
  const [languageInput, setLanguageInput] = useState('JavaScript'); 
  const [levelInput, setLevelInput] = useState('1'); 
  const [leaderAvatarInput, setLeaderAvatarInput] = useState(AVATAR_OPTIONS[0].id); // New: for leader's avatar
  const [generatedLobbyCode, setGeneratedLobbyCode] = useState(null); // Stores code AFTER creation
  const [copied, setCopied] = useState(false);
  const [isCreatingLobby, setIsCreatingLobby] = useState(false);

  // Join Lobby States
  const [playerNameInput, setPlayerNameInput] = useState(''); // Player's chosen name for THIS lobby
  const [playerAvatarInput, setPlayerAvatarInput] = useState(AVATAR_OPTIONS[1].id); // New: for player's avatar
  const [joinCodeInput, setJoinCodeInput] = useState('');
  const [isJoiningLobby, setIsJoiningLobby] = useState(false);
  const [joinInputError, setJoinInputError] = useState(false); // For local input validation/shake

  // --- Auto-Login as Guest on Mount if no user ---
  useEffect(() => {
    const initGuestUser = async () => {
      if (!state.user) {
        try {
          const storedUser = localStorage.getItem('debugrace_user');
          const storedToken = localStorage.getItem('debugrace_token');
          if (storedUser && storedToken) {
            dispatch({ type: 'SET_USER', payload: JSON.parse(storedUser) });
          } else {
            const newGuestName = `Racer_${Math.floor(Math.random() * 10000)}`;
            const response = await authAPI.guestLogin(newGuestName);
            dispatch({ type: 'SET_USER', payload: response.data });
            localStorage.setItem('debugrace_user', JSON.stringify(response.data));
            localStorage.setItem('debugrace_token', response.data.token);
          }
        } catch (error) {
          console.error("Failed to initialize guest user:", error);
        }
      } 
      // Pre-fill modal name inputs if user exists and they are empty
      if (state.user) {
          if (!leaderNameInput) setLeaderNameInput(state.user.username);
          if (!playerNameInput) setPlayerNameInput(state.user.username);
          // Set default avatar from user's current avatar if available, otherwise first option
          if (!leaderAvatarInput) setLeaderAvatarInput(state.user.avatar || AVATAR_OPTIONS[0].id);
          if (!playerAvatarInput) setPlayerAvatarInput(state.user.avatar || AVATAR_OPTIONS[0].id);
      }
    };
    initGuestUser();
  }, [state.user, dispatch, leaderNameInput, playerNameInput, leaderAvatarInput, playerAvatarInput]);


  // --- Lobby Creation Logic ---
  const handleCreateLobby = async (e) => {
    e.preventDefault();
    setModalError(null); // Clear previous errors
    
    // Basic form validation
    if (!lobbyNameInput.trim()) {
      setModalError("Lobby name cannot be empty.");
      return;
    }
    if (!leaderNameInput.trim()) {
      setModalError("Your name for this lobby cannot be empty.");
      return;
    }
    if (!state.user?._id) { 
      setModalError("Error: No user session found. Please refresh.");
      return;
    }

    setIsCreatingLobby(true);
    try {
      const response = await teamAPI.create({ // teamAPI now means lobbyAPI
        name: lobbyNameInput.trim(),
        language: languageInput,
        level: parseInt(levelInput),
        leaderDisplayName: leaderNameInput.trim(), 
        leaderId: state.user._id, // Pass global user ID to backend
        leaderAvatar: leaderAvatarInput // New: Pass selected avatar
      });

      const newLobby = response.data.team; // Response from backend still refers to 'team'
      dispatch({ type: 'SET_TEAM', payload: newLobby }); // Store lobby in global state
      setGeneratedLobbyCode(newLobby.code); // Display the code in the modal

      // --- Emit socket event for room creation ---
      emit('createRoom', {
        teamCode: newLobby.code,
        userId: state.user._id, 
        username: leaderNameInput.trim(), 
        avatar: leaderAvatarInput, // Use selected avatar
        isLeader: true
      });

      // NO NAVIGATION YET. The modal will now show the code and the "ENTER LOBBY" button.

    } catch (error) {
      console.error("Create lobby failed:", error.response?.data || error);
      setModalError(error.response?.data?.error || "Failed to create lobby. Try again.");
    } finally {
      setIsCreatingLobby(false);
    }
  };

  // --- Join Lobby Logic ---
  const handleJoinLobby = async (e) => {
    e.preventDefault();
    setModalError(null);
    
    // Basic form validation
    if (!joinCodeInput.trim() || joinCodeInput.length !== 6) {
      setJoinInputError(true); 
      setModalError("Lobby code must be 6 characters.");
      setTimeout(() => setJoinInputError(false), 600);
      return;
    }
    if (!playerNameInput.trim()) {
      setJoinInputError(true);
      setModalError("Your name for this lobby cannot be empty.");
      setTimeout(() => setJoinInputError(false), 600);
      return;
    }
    if (!state.user?._id) {
      setModalError("Error: No user session found. Please refresh.");
      return;
    }

    setIsJoiningLobby(true);
    try {
      const response = await teamAPI.join(joinCodeInput.trim()); // Call teamAPI.join
      const joinedLobby = response.data.team; // Response from backend still refers to 'team'
      dispatch({ type: 'SET_TEAM', payload: joinedLobby }); // Store lobby in global state

      // --- Emit socket event for joining room ---
      emit('joinRoom', {
        teamCode: joinCodeInput.trim(),
        userId: state.user._id, 
        username: playerNameInput.trim(), 
        avatar: playerAvatarInput // Use selected avatar
      });

      navigate(`/lobby/${joinedLobby.code}`); // Redirect to Lobby page
      closeModal();

    } catch (error) {
      console.error("Join lobby failed:", error.response?.data || error);
      setModalError(error.response?.data?.error || "Invalid lobby code. Try again.");
      setJoinInputError(true); // Trigger shake for UI feedback
      setTimeout(() => setJoinInputError(false), 600);
    } finally {
      setIsJoiningLobby(false);
    }
  };


  // --- Copy to clipboard ---
  const handleCopyLobbyCode = useCallback(() => {
    if (generatedLobbyCode) {
      navigator.clipboard.writeText(generatedLobbyCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [generatedLobbyCode]);

  // --- Close Modal & Reset States ---
  const closeModal = useCallback(() => {
    setActiveModal(null);
    setLobbyNameInput('');
    setLeaderNameInput(state.user?.username || ''); 
    setPlayerNameInput(state.user?.username || ''); 
    setLanguageInput('JavaScript');
    setLevelInput('1');
    setLeaderAvatarInput(state.user?.avatar || AVATAR_OPTIONS[0].id); // Reset avatar to user's or default
    setPlayerAvatarInput(state.user?.avatar || AVATAR_OPTIONS[0].id); // Reset avatar to user's or default
    setGeneratedLobbyCode(null); // Clears code display on modal close
    setJoinCodeInput('');
    setJoinInputError(false);
    setModalError(null); // Clear modal errors on close
  }, [state.user]); // Dependency on state.user for pre-filling names

  // --- Navigate to Lobby from Create Lobby Modal (after code is displayed) ---
  const navigateToLobby = useCallback(() => {
    if (generatedLobbyCode) {
      navigate(`/lobby/${generatedLobbyCode}`);
      closeModal();
    }
  }, [generatedLobbyCode, closeModal, navigate]);

  return (
    <div className="home-container">
      {/* Subtle Animated Diagonal Racetrack Background */}
      <div className="bg-track-animated"></div>
      <div className="bg-vignette"></div>

      {/* TOP NAVBAR */}
      <nav className="top-nav">
        <div className="logo-small">
          <span className="logo-text">DEBUG RACE</span>
        </div>
        <div className="nav-actions">
          {/* Profile Icon SVG */}
          <button className="icon-btn">
            <ProfileIcon />
          </button>
          {/* Settings Icon SVG */}
          <button className="icon-btn">
            <SettingsIcon />
          </button>
        </div>
      </nav>

      {/* CENTER CONTENT */}
      <main className="center-content">
        <header className="hero-section">
          <h1 className="main-title">DEBUG RACE</h1>
          <p className="subtitle">MULTIPLAYER COMPETITIVE DEBUGGING ARENA</p>
        </header>

        <div className="menu-stack">
          {/* Button 1: Create */}
          <button className="esports-btn primary" onClick={() => setActiveModal('create')}>
            <span className="btn-icon">🚀</span>
            <span className="btn-text">CREATE LOBBY</span>
            <div className="btn-border"></div>
          </button>

          {/* Button 2: Join */}
          <button className="esports-btn secondary" onClick={() => setActiveModal('join')}>
            <span className="btn-icon">🔑</span>
            <span className="btn-text">JOIN LOBBY</span>
            <div className="btn-border"></div>
          </button>

          {/* Button 3: Leaderboard */}
          <button className="esports-btn outline" onClick={() => navigate('/stats')}>
            <span className="btn-icon">🏆</span>
            <span className="btn-text">LEADERBOARD</span>
            <div className="btn-border"></div>
          </button>

          {/* Button 4: Stats */}
          <button className="esports-btn outline" onClick={() => navigate('/stats')}>
            <span className="btn-icon">📊</span>
            <span className="btn-text">STATS</span>
            <div className="btn-border"></div>
          </button>
        </div>
      </main>

      {/* MODALS OVERLAY */}
      {activeModal && (
        <div className="modal-overlay" onClick={closeModal}>
          
          {/* CREATE LOBBY MODAL */}
          {activeModal === 'create' && (
            <div className="modal-panel slant-box" onClick={(e) => e.stopPropagation()}>
              <button className="close-btn" onClick={closeModal}>✕</button>
              
              {!generatedLobbyCode ? ( // Show form if no code generated yet
                <>
                  <h2 className="modal-title">INITIATE LOBBY</h2>
                  <form className="modal-form" onSubmit={handleCreateLobby}>
                    {/* Display API errors */}
                    {modalError && <p className="error-text modal-error-msg">{modalError}</p>}
                    
                    <div className="input-group">
                      <label>LOBBY NAME</label>
                      <input 
                        type="text" 
                        required 
                        placeholder="Enter your lobby name"
                        value={lobbyNameInput}
                        onChange={(e) => setLobbyNameInput(e.target.value)}
                        disabled={isCreatingLobby}
                      />
                    </div>
                    
                    <div className="input-group">
                      <label>YOUR NAME FOR LOBBY</label>
                      <input 
                        type="text" 
                        required 
                        placeholder="e.g., RacerX, CodeMaster"
                        value={leaderNameInput}
                        onChange={(e) => setLeaderNameInput(e.target.value)}
                        disabled={isCreatingLobby}
                      />
                    </div>

                    {/* New: Avatar Selection for Leader */}
                    <div className="input-group">
                      <label>SELECT YOUR AVATAR</label>
                      <div className="avatar-selection-grid">
                        {AVATAR_OPTIONS.map(avatar => (
                          <button
                            key={avatar.id}
                            type="button" // Important: prevents form submission
                            className={`avatar-option ${leaderAvatarInput === avatar.id ? 'selected' : ''}`}
                            onClick={() => setLeaderAvatarInput(avatar.id)}
                            disabled={isCreatingLobby}
                          >
                            <span className="avatar-icon">{avatar.icon}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="input-group">
                      <label>LANGUAGE ENGINE</label>
                      <select value={languageInput} onChange={(e) => setLanguageInput(e.target.value)} disabled={isCreatingLobby}>
                        <option value="JavaScript">JavaScript</option>
                        <option value="Python">Python</option>
                        <option value="Java">Java</option>
                        <option value="C">C</option>
                      </select>
                    </div>

                    <div className="input-group">
                      <label>DIFFICULTY LEVEL</label>
                      <select value={levelInput} onChange={(e) => setLevelInput(e.target.value)} disabled={isCreatingLobby}>
                        <option value="1">Rookie (1 Lap)</option>
                        <option value="2">Intermediate (2 Laps)</option>
                        <option value="3">Pro (3 Laps)</option>
                        <option value="4">Expert (4 Laps)</option>
                        <option value="5">Godlike (5 Laps)</option>
                      </select>
                    </div>

                    <button type="submit" className="action-btn action-primary mt-4" disabled={isCreatingLobby}>
                      {isCreatingLobby ? 'GENERATING...' : 'GENERATE LOBBY CODE'}
                    </button>
                  </form>
                </>
              ) : ( // Show code display once code is generated
                /* CODE GENERATED STATE */
                <div className="generated-code-view">
                  <h2 className="modal-title text-success">LOBBY SECURED</h2>
                  <p className="modal-subtitle">Share this frequency with your squad</p>
                  
                  <div className="code-display-box">
                    <span className="code-number">{generatedLobbyCode}</span>
                  </div>

                  <div className="modal-actions mt-4">
                    <button className="action-btn action-secondary" onClick={handleCopyLobbyCode}>
                      {copied ? "COPIED!" : "COPY CODE"}
                    </button>
                    <button className="action-btn action-primary" onClick={navigateToLobby}>
                      ENTER LOBBY
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* JOIN LOBBY MODAL */}
          {activeModal === 'join' && (
            <div className={`modal-panel slant-box ${joinInputError ? 'error-shake' : ''}`} onClick={(e) => e.stopPropagation()}>
              <button className="close-btn" onClick={closeModal}>✕</button>
              <h2 className="modal-title">ENTER THE GRID</h2>
              
              <form className="modal-form" onSubmit={handleJoinLobby}>
                {/* Display API errors */}
                {modalError && <p className="error-text modal-error-msg">{modalError}</p>}

                <div className="input-group">
                  <label>YOUR NAME FOR LOBBY</label>
                  <input 
                    type="text" 
                    required 
                    placeholder="e.g., RacerX, CodeMaster"
                    value={playerNameInput}
                    onChange={(e) => setPlayerNameInput(e.target.value)}
                    disabled={isJoiningLobby}
                  />
                </div>

                {/* New: Avatar Selection for Joiner */}
                <div className="input-group">
                  <label>SELECT YOUR AVATAR</label>
                  <div className="avatar-selection-grid">
                    {AVATAR_OPTIONS.map(avatar => (
                      <button
                        key={avatar.id}
                        type="button" // Important: prevents form submission
                        className={`avatar-option ${playerAvatarInput === avatar.id ? 'selected' : ''}`}
                        onClick={() => setPlayerAvatarInput(avatar.id)}
                        disabled={isJoiningLobby}
                      >
                        <span className="avatar-icon">{avatar.icon}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className={`input-group code-input-group ${joinInputError ? 'input-error' : ''}`}>
                  <label>6-DIGIT LOBBY CODE</label>
                  <input 
                    type="text" 
                    required 
                    maxLength="6"
                    placeholder="XXXXXX"
                    className="code-input"
                    value={joinCodeInput}
                    onChange={(e) => setJoinCodeInput(e.target.value.toUpperCase())}
                    disabled={isJoiningLobby}
                  />
                  {modalError && joinInputError && <span className="error-text">{modalError}</span>}
                </div>

                <button type="submit" className="action-btn action-primary mt-4" disabled={isJoiningLobby}>
                  {isJoiningLobby ? 'CONNECTING...' : 'CONNECT'}
                </button>
              </form>
            </div>
          )}

        </div>
      )}

      {/* STYLES */}
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;800&family=Orbitron:wght@500;700;900&display=swap');

        :root {
          --bg-dark: #070707;
          --bg-panel: #111111;
          --neon-orange: #FF6E00;
          --neon-yellow: #FEEA00;
          --accent-red: #ff2a2a;
          --text-main: #ffffff;
          --text-muted: #666666;
        }

        * { box-sizing: border-box; }

        .home-container {
          position: relative;
          width: 100vw;
          min-height: 100vh;
          background-color: var(--bg-dark);
          font-family: 'Montserrat', sans-serif;
          color: var(--text-main);
          overflow-x: hidden;
          display: flex;
          flex-direction: column;
        }

        /* Diagonal Animated Racetrack Background */
        .bg-track-animated {
          position: absolute;
          inset: -50%;
          background: repeating-linear-gradient(
            45deg,
            var(--bg-dark),
            var(--bg-dark) 40px,
            rgba(255, 110, 0, 0.03) 40px,
            rgba(255, 110, 0, 0.03) 42px,
            var(--bg-dark) 42px,
            var(--bg-dark) 80px,
            rgba(254, 234, 0, 0.02) 80px,
            rgba(254, 234, 0, 0.02) 82px
          );
          animation: move-track 30s linear infinite;
          z-index: 0;
        }

        @keyframes move-track {
          0% { background-position: 0 0; }
          100% { background-position: 400px 400px; }
        }

        .bg-vignette {
          position: absolute;
          inset: 0;
          background: radial-gradient(circle at center, transparent 20%, #000000 90%);
          z-index: 1;
          pointer-events: none;
        }

        /* Top Nav */
        .top-nav {
          position: relative;
          z-index: 10;
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 2rem 3rem;
        }

        .logo-small {
          /* Add some styling for the small logo if needed */
        }

        .logo-small .logo-text { /* Specific styling for the small logo */
          font-family: 'Orbitron', sans-serif;
          font-size: 1.2rem; /* Adjusted for smaller size */
          font-weight: 900;
          letter-spacing: 2px;
          color: var(--text-main);
          border-left: 3px solid var(--neon-orange);
          padding-left: 10px;
          text-shadow: 0 0 8px rgba(255, 110, 0, 0.3);
        }

        .nav-actions {
          display: flex;
          gap: 15px;
        }

        .icon-btn {
          background: transparent;
          border: 1px solid rgba(255,255,255,0.1);
          color: var(--text-main);
          width: 45px;
          height: 45px;
          display: flex;
          justify-content: center;
          align-items: center;
          cursor: pointer;
          transition: all 0.3s ease;
          clip-path: polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px);
        }

        .icon-btn:hover {
          background: rgba(255, 110, 0, 0.1);
          border-color: var(--neon-orange);
          color: var(--neon-orange);
          box-shadow: 0 0 15px rgba(255, 110, 0, 0.2);
        }

        .icon-btn svg { width: 20px; height: 20px; }

        /* Center Content */
        .center-content {
          position: relative;
          z-index: 10;
          flex-grow: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding-bottom: 5vh;
        }

        .hero-section {
          text-align: center;
          margin-bottom: 3.5rem;
        }

        .main-title {
          font-family: 'Orbitron', sans-serif;
          font-size: 5rem;
          font-weight: 900;
          margin: 0;
          letter-spacing: 4px;
          background: linear-gradient(to bottom, #ffffff, #aaaaaa);
          -webkit-background-clip: text;
          color: transparent;
          filter: drop-shadow(0 0 20px rgba(255, 110, 0, 0.3));
        }

        .subtitle {
          font-size: 1rem;
          font-weight: 600;
          letter-spacing: 5px;
          color: var(--neon-yellow);
          margin-top: -5px;
          text-transform: uppercase;
        }

        /* Main Menu Stack */
        .menu-stack {
          display: flex;
          flex-direction: column;
          gap: 1.2rem;
          width: 100%;
          max-width: 400px;
        }

        /* Esports Button Styling */
        .esports-btn {
          position: relative;
          background: var(--bg-panel);
          border: none;
          padding: 1.2rem 2rem;
          color: var(--text-main);
          font-family: 'Orbitron', sans-serif;
          font-size: 1.1rem;
          font-weight: 700;
          letter-spacing: 2px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 15px;
          transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275), box-shadow 0.3s;
          /* Sharp angled corners */
          clip-path: polygon(15px 0, 100% 0, 100% calc(100% - 15px), calc(100% - 15px) 100%, 0 100%, 0 15px);
        }

        /* Animated Neon Border Hack */
        .btn-border {
          position: absolute;
          inset: 0;
          border: 2px solid transparent;
          transition: border-color 0.3s;
          pointer-events: none;
        }

        .esports-btn::after {
          content: '';
          position: absolute;
          top: 0; left: -100%;
          width: 50%; height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
          transform: skewX(-20deg);
          transition: 0s;
        }

        /* Hover Effects */
        .esports-btn:hover {
          transform: translateY(-5px); /* Upward movement */
        }

        .esports-btn:hover::after {
          left: 200%;
          transition: left 0.6s ease-in-out; /* Shine sweep effect */
        }

        /* Button Variations */
        .esports-btn.primary { background: linear-gradient(135deg, rgba(255, 110, 0, 0.2), transparent); }
        .esports-btn.primary .btn-border { border-color: var(--neon-orange); }
        .esports-btn.primary:hover { box-shadow: 0 10px 30px rgba(255, 110, 0, 0.3); background: rgba(255, 110, 0, 0.3); }

        .esports-btn.secondary { background: linear-gradient(135deg, rgba(254, 234, 0, 0.1), transparent); }
        .esports-btn.secondary .btn-border { border-color: rgba(254, 234, 0, 0.5); }
        .esports-btn.secondary:hover { box-shadow: 0 10px 30px rgba(254, 234, 0, 0.2); background: rgba(254, 234, 0, 0.2); border-color: var(--neon-yellow); }

        .esports-btn.outline { background: transparent; }
        .esports-btn.outline .btn-border { border-color: #333; }
        .esports-btn.outline:hover { background: rgba(255,255,255,0.05); .btn-border { border-color: #666; } }

        .btn-icon { font-size: 1.4rem; filter: grayscale(100%) brightness(200%); }
        .esports-btn:hover .btn-icon { filter: none; }

        /* ---------------- MODALS ---------------- */
        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.85);
          backdrop-filter: blur(8px);
          z-index: 100;
          display: flex;
          justify-content: center;
          align-items: center;
          animation: fade-in 0.2s ease-out;
        }

        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }

        .modal-panel {
          background: var(--bg-panel);
          border: 1px solid rgba(255, 110, 0, 0.3);
          width: 100%;
          max-width: 450px;
          padding: 2.5rem;
          position: relative;
          box-shadow: 0 20px 50px rgba(0,0,0,0.9), inset 0 0 30px rgba(255, 110, 0, 0.05);
        }

        /* Esports slant corner for modal */
        .slant-box {
          clip-path: polygon(25px 0, 100% 0, 100% calc(100% - 25px), calc(100% - 25px) 100%, 0 100%, 0 25px);
        }

        .close-btn {
          position: absolute;
          top: 15px; right: 20px;
          background: transparent; border: none;
          color: var(--text-muted);
          font-size: 1.2rem;
          cursor: pointer;
          transition: color 0.2s;
        }
        .close-btn:hover { color: var(--neon-orange); }

        .modal-title {
          font-family: 'Orbitron', sans-serif;
          font-size: 1.8rem;
          font-weight: 800;
          margin: 0 0 1.5rem 0;
          color: var(--text-main);
          letter-spacing: 2px;
          border-left: 4px solid var(--neon-orange);
          padding-left: 12px;
        }

        .modal-form { display: flex; flex-direction: column; gap: 1.2rem; }

        .input-group { display: flex; flex-direction: column; gap: 6px; }
        .input-group label { font-size: 0.75rem; font-weight: 700; color: var(--text-muted); letter-spacing: 1px; }
        
        .input-group input, .input-group select {
          background: #0A0A0A;
          border: 1px solid #333;
          color: var(--text-main);
          padding: 12px 15px;
          font-family: 'Montserrat', sans-serif;
          font-size: 1rem;
          outline: none;
          transition: border-color 0.3s, box-shadow 0.3s;
          clip-path: polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px);
        }

        .input-group input:focus, .input-group select:focus {
          border-color: var(--neon-orange);
          box-shadow: 0 0 10px rgba(255, 110, 0, 0.2);
        }

        .code-input {
          font-family: 'Orbitron', sans-serif !important;
          font-size: 1.5rem !important;
          letter-spacing: 10px;
          text-align: center;
          text-transform: uppercase;
        }

        /* Action Buttons inside Modals */
        .action-btn {
          padding: 15px;
          font-family: 'Orbitron', sans-serif;
          font-weight: 700;
          font-size: 1rem;
          letter-spacing: 2px;
          border: none;
          cursor: pointer;
          transition: all 0.2s;
          clip-path: polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 15px);
        }
        
        .mt-4 { margin-top: 1rem; }

        .action-primary { background: var(--neon-orange); color: #000; }
        .action-primary:hover { background: #ff8522; box-shadow: 0 0 20px rgba(255, 110, 0, 0.5); }

        .action-secondary { background: #222; color: var(--text-main); border: 1px solid #444; }
        .action-secondary:hover { background: #333; border-color: var(--neon-yellow); }

        /* Generated Code State */
        .generated-code-view { text-align: center; }
        .text-success { border-color: var(--neon-yellow); color: var(--neon-yellow); text-align: left; }
        .modal-subtitle { color: var(--text-muted); font-size: 0.9rem; margin-bottom: 2rem; text-align: left; }
        
        .code-display-box {
          background: #000;
          border: 1px dashed var(--neon-orange);
          padding: 20px;
          margin: 20px 0;
          box-shadow: 0 0 15px rgba(255, 110, 0, 0.3);
        }
        .code-number {
          font-family: 'Orbitron', sans-serif;
          font-size: 3.5rem;
          font-weight: 900;
          color: var(--text-main);
          letter-spacing: 8px;
          text-shadow: 0 0 15px rgba(255, 110, 0, 0.6);
        }

        .modal-actions { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }

        /* Join Error State */
        .input-error input { border-color: var(--accent-red) !important; box-shadow: 0 0 15px rgba(255, 42, 42, 0.3) !important; color: var(--accent-red); }
        .error-text { color: var(--accent-red); font-size: 0.75rem; font-weight: 700; margin-top: 5px; }
        .modal-error-msg { text-align: center; margin-bottom: 1rem; }
        
        .error-shake {
          animation: ui-shake 0.4s cubic-bezier(.36,.07,.19,.97) both;
          border-color: var(--accent-red);
        }

        @keyframes ui-shake {
          10%, 90% { transform: translate3d(-2px, 0, 0); }
          20%, 80% { transform: translate3d(4px, 0, 0); }
          30%, 50%, 70% { transform: translate3d(-8px, 0, 0); }
          40%, 60% { transform: translate3d(8px, 0, 0); }
        }

        .player-alias-display {
          font-size: 0.9rem;
          color: var(--text-muted);
          margin-bottom: 1rem;
          text-align: center;
        }

        .player-alias {
          font-family: 'Orbitron', sans-serif;
          color: var(--neon-yellow);
          font-weight: 700;
        }

        /* Avatar Selection Grid */
        .avatar-selection-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 10px;
          margin-top: 10px;
        }

        .avatar-option {
          background: #1a1a1a;
          border: 2px solid #333;
          border-radius: 8px;
          padding: 10px;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .avatar-option:hover {
          border-color: var(--neon-yellow);
          box-shadow: 0 0 10px rgba(254, 234, 0, 0.2);
        }

        .avatar-option.selected {
          border-color: var(--neon-orange);
          box-shadow: 0 0 15px rgba(255, 110, 0, 0.5), inset 0 0 10px rgba(255, 110, 0, 0.2);
          transform: scale(1.05);
        }

        .avatar-icon {
          font-size: 1.8rem;
          line-height: 1;
        }


        /* Media Queries for Responsiveness */
        @media (max-width: 1024px) {
          .top-nav { padding: 1.5rem 2rem; }
          .main-title { font-size: 4rem; }
          .subtitle { font-size: 0.8rem; letter-spacing: 4px; }
          .menu-stack { max-width: 350px; }
          .esports-btn { font-size: 1rem; padding: 1rem 1.5rem; }
          .logo-small .logo-text { font-size: 1.1rem; }
          .avatar-selection-grid { grid-template-columns: repeat(3, 1fr); }
        }

        @media (max-width: 768px) {
          .loader-container { padding: 1rem; }
          .top-nav { flex-direction: column; align-items: center; gap: 1rem; padding: 1rem; }
          .main-title { font-size: 3rem; }
          .subtitle { font-size: 0.7rem; letter-spacing: 3px; }
          .menu-stack { max-width: 300px; gap: 0.8rem; }
          .esports-btn { font-size: 0.9rem; padding: 0.8rem 1rem; }
          .modal-panel { padding: 1.5rem; max-width: 90%; }
          .modal-title { font-size: 1.2rem; }
          .input-group input, .input-group select { padding: 10px 12px; }
          .code-input { font-size: 1.2rem !important; letter-spacing: 5px; }
          .action-btn { font-size: 0.9rem; padding: 12px; }
          .logo-small .logo-text { font-size: 0.9rem; }
          .avatar-selection-grid { grid-template-columns: repeat(3, 1fr); }
        }

        @media (max-width: 480px) {
          .main-title { font-size: 2.5rem; letter-spacing: 2px; }
          .subtitle { font-size: 0.6rem; letter-spacing: 2px; }
          .modal-actions { grid-template-columns: 1fr; }
          .avatar-selection-grid { grid-template-columns: repeat(2, 1fr); }
        }
      `}} />
    </div>
  );
};

export default Home;