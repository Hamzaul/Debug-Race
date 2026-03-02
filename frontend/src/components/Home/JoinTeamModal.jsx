import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const JoinTeamModal = ({
  isOpen,
  onClose,
  playerNameInput,
  setPlayerNameInput,
  joinCodeInput,
  setJoinCodeInput,
  handleJoinLobby, // Renamed from handleJoinTeam to match HomePage
  isJoiningLobby,  // Renamed from isJoiningTeam
  joinInputError,
  modalError,
}) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="modal-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
        >
          <motion.div
            className={`modal-panel slant-box ${joinInputError ? 'error-shake' : ''}`}
            initial={{ y: -50, opacity: 0, scale: 0.8 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: -50, opacity: 0, scale: 0.8 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            onClick={(e) => e.stopPropagation()}
          >
            <button className="close-btn" onClick={onClose}>✕</button>
            <h2 className="modal-title">ENTER THE GRID</h2>
            
            <form className="modal-form" onSubmit={handleJoinLobby}>
              {/* Display API errors */}
              {modalError && <p className="error-text modal-error-msg">{modalError}</p>}

              <div className="input-group">
                <label>PLAYER NAME</label>
                <input 
                  type="text" 
                  required 
                  placeholder="Enter your name for this lobby"
                  value={playerNameInput}
                  onChange={(e) => setPlayerNameInput(e.target.value)}
                  disabled={isJoiningLobby}
                />
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
                {/* Error message shown if validation fails or API returns error and shake is active */}
                {modalError && joinInputError && <span className="error-text">{modalError}</span>}
              </div>

              <button type="submit" className="action-btn action-primary mt-4" disabled={isJoiningLobby}>
                {isJoiningLobby ? 'CONNECTING...' : 'CONNECT'}
              </button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default JoinTeamModal;