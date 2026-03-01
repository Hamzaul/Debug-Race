import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, UserPlus, BarChart3, Zap, Trophy, Code } from 'lucide-react';
import { useGame } from '../../context/GameContext';
import { useSocket } from '../../context/SocketContext';
import { authAPI } from '../../services/api';
import Button from '../common/Button';
import CreateTeamModal from './CreateTeamModal';
import JoinTeamModal from './JoinTeamModal';

// Animated background car
const BackgroundCar = ({ delay, top, color }) => (
  <motion.div
    initial={{ x: '-100px' }}
    animate={{ x: 'calc(100vw + 100px)' }}
    transition={{
      duration: 8,
      delay,
      repeat: Infinity,
      ease: 'linear'
    }}
    className="absolute opacity-10"
    style={{ top }}
  >
    <div
      className="w-16 h-6 rounded-lg"
      style={{ backgroundColor: color }}
    />
  </motion.div>
);

// Feature card component
const FeatureCard = ({ icon: Icon, title, description, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    whileHover={{ scale: 1.05, y: -5 }}
    className="p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm"
  >
    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center mb-3">
      <Icon size={20} className="text-white" />
    </div>
    <h3 className="font-racing text-white text-sm mb-1">{title}</h3>
    <p className="text-gray-500 text-xs font-body">{description}</p>
  </motion.div>
);

// Level badge component
const LevelBadge = ({ level, name, laps, isActive }) => (
  <motion.div
    whileHover={{ scale: 1.1 }}
    className={`
      text-center p-3 rounded-xl cursor-pointer transition-all
      ${isActive 
        ? 'bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border-2 border-cyan-500' 
        : 'bg-white/5 border border-white/10 hover:border-cyan-500/50'
      }
    `}
  >
    <div className={`font-racing text-2xl ${isActive ? 'text-cyan-400' : 'text-gray-400'}`}>
      {level}
    </div>
    <div className="font-body text-xs text-gray-500 truncate">{name}</div>
    <div className={`font-mono text-xs ${isActive ? 'text-purple-400' : 'text-gray-600'}`}>
      {laps} laps
    </div>
  </motion.div>
);

export default function HomePage() {
  const navigate = useNavigate();
  const { state, dispatch } = useGame();
  const { isConnected, socketId } = useSocket();
  
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Auto-login as guest
  useEffect(() => {
    const initUser = async () => {
      if (!state.user) {
        setIsLoading(true);
        try {
          const response = await authAPI.guestLogin(`Racer_${Math.floor(Math.random() * 10000)}`);
          dispatch({ type: 'SET_USER', payload: response.data });
          localStorage.setItem('debugrace_token', response.data.token);
        } catch (error) {
          console.error('Guest login failed:', error);
        } finally {
          setIsLoading(false);
        }
      }
    };
    initUser();
  }, [state.user, dispatch]);

  const levels = [
    { level: 1, name: 'Rookie Grid', laps: 2 },
    { level: 2, name: 'Code Circuit', laps: 3 },
    { level: 3, name: 'Logic GP', laps: 4 },
    { level: 4, name: 'Algorithm Arena', laps: 5 },
    { level: 5, name: 'Championship', laps: 6 }
  ];

  const features = [
    { icon: Code, title: 'Debug Challenges', description: 'Fix bugs to boost speed' },
    { icon: Zap, title: 'Power-ups', description: 'Nitro, Shield & more' },
    { icon: Users, title: 'Multiplayer', description: 'Race with friends' },
    { icon: Trophy, title: 'Leaderboards', description: 'Compete globally' }
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0f] relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-grid opacity-20" />
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-transparent to-purple-500/5" />
      
      {/* Animated background cars */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <BackgroundCar delay={0} top="15%" color="#00f0ff" />
        <BackgroundCar delay={3} top="35%" color="#bf00ff" />
        <BackgroundCar delay={6} top="55%" color="#00ff88" />
        <BackgroundCar delay={2} top="75%" color="#ff00f5" />
      </div>

      {/* Connection status */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="absolute top-4 right-4 z-20"
      >
        <div className={`
          flex items-center gap-2 px-4 py-2 rounded-full
          ${isConnected ? 'bg-emerald-500/10 border border-emerald-500/30' : 'bg-red-500/10 border border-red-500/30'}
        `}>
          <div className={`status-dot ${isConnected ? 'status-online' : 'status-offline'}`} />
          <span className={`text-sm font-body ${isConnected ? 'text-emerald-400' : 'text-red-400'}`}>
            {isConnected ? 'Connected' : 'Connecting...'}
          </span>
        </div>
      </motion.div>

      {/* Main content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 py-12">
        {/* Logo section */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10"
        >
          <motion.h1
            className="font-racing text-5xl md:text-7xl text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 mb-3"
            animate={{
              backgroundPosition: ['0%', '100%', '0%']
            }}
            transition={{ duration: 5, repeat: Infinity }}
            style={{ backgroundSize: '200%' }}
          >
            DEBUG RACE
          </motion.h1>
          <p className="font-body text-lg text-gray-400 italic">
            "Where Coding Meets Speed."
          </p>
        </motion.div>

        {/* User info */}
        <AnimatePresence>
          {state.user && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="mb-8 px-6 py-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center text-xl">
                  🏎️
                </div>
                <div>
                  <p className="font-body text-gray-400 text-sm">Playing as</p>
                  <p className="font-racing text-white">{state.user.username}</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main action buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-col gap-4 w-full max-w-xs mb-12"
        >
          <Button
            variant="primary"
            size="lg"
            icon="🏁"
            fullWidth
            onClick={() => setShowCreateModal(true)}
            disabled={isLoading}
          >
            Create Team
          </Button>

          <Button
            variant="secondary"
            size="lg"
            icon="🎮"
            fullWidth
            onClick={() => setShowJoinModal(true)}
            disabled={isLoading}
          >
            Join Team
          </Button>

          <Button
            variant="ghost"
            size="lg"
            icon="📊"
            fullWidth
            onClick={() => navigate('/stats')}
          >
            Stats
          </Button>
        </motion.div>

        {/* Feature cards */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mb-12"
        >
          {features.map((feature, index) => (
            <FeatureCard
              key={feature.title}
              {...feature}
              delay={0.5 + index * 0.1}
            />
          ))}
        </motion.div>

        {/* Level indicators */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="w-full max-w-2xl"
        >
          <h3 className="font-racing text-center text-gray-400 text-sm mb-4 uppercase tracking-wider">
            Race Levels
          </h3>
          <div className="grid grid-cols-5 gap-2">
            {levels.map((lvl, index) => (
              <LevelBadge 
                key={lvl.level} 
                {...lvl} 
                isActive={index === 0} 
              />
            ))}
          </div>
        </motion.div>
      </div>

      {/* Decorative corners */}
      <div className="absolute top-4 left-4 w-16 h-16 border-l-2 border-t-2 border-cyan-500/20 rounded-tl-lg" />
      <div className="absolute top-4 right-20 w-16 h-16 border-r-2 border-t-2 border-cyan-500/20 rounded-tr-lg" />
      <div className="absolute bottom-4 left-4 w-16 h-16 border-l-2 border-b-2 border-purple-500/20 rounded-bl-lg" />
      <div className="absolute bottom-4 right-4 w-16 h-16 border-r-2 border-b-2 border-purple-500/20 rounded-br-lg" />

      {/* Modals */}
      <CreateTeamModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />
      
      <JoinTeamModal
        isOpen={showJoinModal}
        onClose={() => setShowJoinModal(false)}
      />
    </div>
  );
}