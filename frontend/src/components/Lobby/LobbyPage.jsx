import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Copy, Check, LogOut, Play, Users, Clock, Code, Zap } from 'lucide-react';
import { useGame } from '../../context/GameContext';
import { useSocket } from '../../context/SocketContext';
import { teamAPI, raceAPI } from '../../services/api';
import Button from '../common/Button';
import Loading from '../common/Loading';
import PlayerCard from './PlayerCard';

const LEVEL_INFO = {
  1: { name: 'Rookie Grid', color: 'from-emerald-500 to-green-600' },
  2: { name: 'Code Circuit', color: 'from-yellow-500 to-orange-500' },
  3: { name: 'Logic Grand Prix', color: 'from-orange-500 to-red-500' },
  4: { name: 'Algorithm Arena', color: 'from-red-500 to-pink-600' },
  5: { name: 'Championship', color: 'from-purple-500 to-pink-600' }
};

export default function LobbyPage() {
  const { teamCode } = useParams();
  const navigate = useNavigate();
  const { state, dispatch } = useGame();
  const { socket, isConnected, emit, on, off } = useSocket();

  const [room, setRoom] = useState(null);
  const [isReady, setIsReady] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isStarting, setIsStarting] = useState(false);
  const [countdown, setCountdown] = useState(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  // Fetch team data
  useEffect(() => {
    const fetchTeam = async () => {
      try {
        const response = await teamAPI.get(teamCode);
        dispatch({ type: 'SET_TEAM', payload: response.data.team });
        setIsLoading(false);
      } catch (err) {
        setError('Team not found');
        setIsLoading(false);
      }
    };
    fetchTeam();
  }, [teamCode, dispatch]);

  // Socket event handlers
  useEffect(() => {
    if (!socket) return;

    const handleRoomUpdate = (roomData) => {
      console.log('📥 Room update:', roomData);
      setRoom(roomData);
    };

    const handlePlayerJoined = (data) => {
      console.log('👤 Player joined:', data);
    };

    const handleCountdown = ({ count }) => {
      console.log('⏱️ Countdown:', count);
      setCountdown(count);
    };

    const handleRaceStarting = ({ raceId }) => {
      console.log('🏁 Race starting:', raceId);
      setTimeout(() => {
        navigate(`/race/${raceId}`);
      }, 500);
    };

    const handleError = ({ message }) => {
      console.error('❌ Socket error:', message);
      setError(message);
    };

    on('roomUpdate', handleRoomUpdate);
    on('playerJoined', handlePlayerJoined);
    on('countdown', handleCountdown);
    on('raceStarting', handleRaceStarting);
    on('error', handleError);

    return () => {
      off('roomUpdate', handleRoomUpdate);
      off('playerJoined', handlePlayerJoined);
      off('countdown', handleCountdown);
      off('raceStarting', handleRaceStarting);
      off('error', handleError);
    };
  }, [socket, on, off, navigate]);

  // Handle ready toggle
  const handleReady = useCallback(() => {
    const newReadyState = !isReady;
    setIsReady(newReadyState);
    emit('playerReady', { teamCode, isReady: newReadyState });
  }, [isReady, teamCode, emit]);

  // Handle start race
  const handleStartRace = useCallback(async () => {
    setIsStarting(true);
    try {
      const response = await raceAPI.start(teamCode);
      const { race } = response.data;
      
      dispatch({ type: 'SET_RACE', payload: race });
      emit('startRace', { teamCode, raceId: race._id || race.raceId });
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to start race');
      setIsStarting(false);
    }
  }, [teamCode, dispatch, emit]);

  // Handle leave
  const handleLeave = useCallback(() => {
    emit('leaveRoom', { teamCode });
    dispatch({ type: 'CLEAR_TEAM' });
    navigate('/home');
  }, [teamCode, emit, dispatch, navigate]);

  // Handle copy code
  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(teamCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  // Computed values
  const isLeader = room?.players?.find(p => p.socketId === socket?.id)?.isLeader;
  const allReady = room?.players?.length > 0 && room?.players?.every(p => p.isReady);
  const canStart = isLeader && allReady;
  const playerCount = room?.players?.length || 0;
  const levelInfo = LEVEL_INFO[state.team?.settings?.level || 1];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f]">
        <Loading text="Loading lobby..." />
      </div>
    );
  }

  if (error && !room) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#0a0a0f] px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="text-6xl mb-4">😕</div>
          <p className="text-red-400 font-body text-xl mb-6">{error}</p>
          <Button variant="secondary" onClick={() => navigate('/home')}>
            Back to Home
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-grid opacity-20" />
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-transparent to-purple-500/5" />

      {/* Countdown overlay */}
      <AnimatePresence>
        {countdown !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 flex items-center justify-center z-50"
          >
            <motion.div
              key={countdown}
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 2, opacity: 0 }}
              transition={{ type: 'spring', damping: 10 }}
              className="text-center"
            >
              <div className={`
                font-racing text-[200px] leading-none
                ${countdown === 0 
                  ? 'text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500' 
                  : 'text-white'
                }
              `}>
                {countdown === 0 ? 'GO!' : countdown}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Content */}
      <div className="relative z-10 min-h-screen p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <h1 className="font-racing text-4xl md:text-5xl text-white mb-4">
              Race Lobby
            </h1>
            
            {/* Team code with copy */}
            <motion.div
              className="inline-flex items-center gap-3 px-6 py-3 rounded-2xl bg-white/5 border border-white/10"
              whileHover={{ scale: 1.02 }}
            >
              <span className="font-body text-gray-400">Code:</span>
              <span className="font-racing text-2xl text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500 tracking-wider">
                {teamCode}
              </span>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleCopyCode}
                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
              >
                {copied ? (
                  <Check size={18} className="text-emerald-400" />
                ) : (
                  <Copy size={18} className="text-gray-400" />
                )}
              </motion.button>
            </motion.div>
          </motion.div>

          {/* Team info card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8 p-6 rounded-2xl bg-gradient-to-r from-white/5 to-white/[0.02] border border-white/10 backdrop-blur-sm"
          >
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {/* Team Name */}
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 text-gray-400 mb-2">
                  <Users size={16} />
                  <span className="font-body text-sm">Team</span>
                </div>
                <p className="font-racing text-xl text-white truncate">
                  {state.team?.name || 'Loading...'}
                </p>
              </div>

              {/* Language */}
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 text-gray-400 mb-2">
                  <Code size={16} />
                  <span className="font-body text-sm">Language</span>
                </div>
                <p className="font-racing text-xl text-cyan-400">
                  {state.team?.settings?.language || 'Python'}
                </p>
              </div>

              {/* Level */}
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 text-gray-400 mb-2">
                  <Zap size={16} />
                  <span className="font-body text-sm">Level</span>
                </div>
                <p className={`font-racing text-xl text-transparent bg-clip-text bg-gradient-to-r ${levelInfo.color}`}>
                  {levelInfo.name}
                </p>
              </div>

              {/* Laps */}
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 text-gray-400 mb-2">
                  <Clock size={16} />
                  <span className="font-body text-sm">Laps</span>
                </div>
                <p className="font-racing text-xl text-purple-400">
                  {(state.team?.settings?.level || 1) + 1}
                </p>
              </div>
            </div>
          </motion.div>

          {/* Players grid */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
          >
            {[0, 1, 2, 3].map((slot) => {
              const player = room?.players?.[slot];
              return (
                <PlayerCard
                  key={slot}
                  player={player}
                  isCurrentUser={player?.socketId === socket?.id}
                  isEmpty={!player}
                  index={slot}
                />
              );
            })}
          </motion.div>

          {/* Action buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col md:flex-row gap-4 justify-center"
          >
            <Button
              variant={isReady ? 'success' : 'secondary'}
              size="lg"
              onClick={handleReady}
              icon={isReady ? '✓' : '✋'}
              className="min-w-[160px]"
            >
              {isReady ? 'Ready!' : 'Ready Up'}
            </Button>

            {isLeader && (
              <Button
                variant="primary"
                size="lg"
                onClick={handleStartRace}
                disabled={!canStart}
                loading={isStarting}
                icon="🏁"
                className="min-w-[200px]"
              >
                {canStart ? 'Start Race!' : `Waiting (${playerCount}/4)`}
              </Button>
            )}

            <Button
              variant="danger"
              size="lg"
              onClick={handleLeave}
              icon={<LogOut size={18} />}
              className="min-w-[140px]"
            >
              Leave
            </Button>
          </motion.div>

          {/* Connection status */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-8 text-center"
          >
            <div className={`
              inline-flex items-center gap-2 px-4 py-2 rounded-full
              ${isConnected ? 'bg-emerald-500/10 border border-emerald-500/30' : 'bg-red-500/10 border border-red-500/30'}
            `}>
              <div className={`status-dot ${isConnected ? 'status-online' : 'status-offline'}`} />
              <span className={`text-sm font-body ${isConnected ? 'text-emerald-400' : 'text-red-400'}`}>
                {isConnected ? 'Connected to server' : 'Reconnecting...'}
              </span>
            </div>
          </motion.div>

          {/* Instructions for non-leaders */}
          {!isLeader && room?.players?.length > 0 && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-6 text-center text-gray-500 font-body"
            >
              Waiting for the team leader to start the race...
            </motion.p>
          )}
        </div>
      </div>

      {/* Decorative elements */}
      <div className="absolute top-4 left-4 w-16 h-16 border-l-2 border-t-2 border-cyan-500/20 rounded-tl-lg" />
      <div className="absolute top-4 right-4 w-16 h-16 border-r-2 border-t-2 border-cyan-500/20 rounded-tr-lg" />
      <div className="absolute bottom-4 left-4 w-16 h-16 border-l-2 border-b-2 border-purple-500/20 rounded-bl-lg" />
      <div className="absolute bottom-4 right-4 w-16 h-16 border-r-2 border-b-2 border-purple-500/20 rounded-br-lg" />
    </div>
  );
}