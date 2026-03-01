import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { GameProvider } from './context/GameContext';
import { SocketProvider } from './context/SocketContext';

// Pages
import LoaderPage from './components/Loader/LoaderPage';
import HomePage from './components/Home/HomePage';
import LobbyPage from './components/Lobby/LobbyPage';

function App() {
  return (
    <Router>
      <GameProvider>
        <SocketProvider>
          <div className="min-h-screen bg-[#0a0a0f]">
            <Routes>
              <Route path="/" element={<LoaderPage />} />
              <Route path="/home" element={<HomePage />} />
              <Route path="/lobby/:teamCode" element={<LobbyPage />} />
              
              {/* Placeholder routes for future pages */}
              <Route path="/race/:raceId" element={
                <div className="min-h-screen flex items-center justify-center">
                  <p className="font-racing text-2xl text-cyan-400">
                    🏎️ Race Page Coming Soon...
                  </p>
                </div>
              } />
              <Route path="/results/:raceId" element={
                <div className="min-h-screen flex items-center justify-center">
                  <p className="font-racing text-2xl text-cyan-400">
                    🏆 Results Page Coming Soon...
                  </p>
                </div>
              } />
              <Route path="/stats" element={
                <div className="min-h-screen flex items-center justify-center">
                  <p className="font-racing text-2xl text-cyan-400">
                    📊 Stats Page Coming Soon...
                  </p>
                </div>
              } />
              
              {/* Catch all */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </SocketProvider>
      </GameProvider>
    </Router>
  );
}

export default App;