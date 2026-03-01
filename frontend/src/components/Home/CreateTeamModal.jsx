import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Copy, Check, ArrowRight, Users } from 'lucide-react';
import { useGame } from '../../context/GameContext';
import { useSocket } from '../../context/SocketContext';
import { teamAPI } from '../../services/api';
import Modal from '../common/Modal';
import Button from '../common/Button';

const LANGUAGES = [
  { value: 'Python', label: 'Python', icon: '🐍' },
  { value: 'JavaScript', label: 'JavaScript', icon: '💛' },
  { value: 'Java', label: 'Java', icon: '☕' },
  { value: 'C', label: 'C', icon: '⚡' }
];

const LEVELS = [
  { value: 1, label: 'Rookie Grid', laps: 2, icon: '🟢' },
  { value: 2, label: 'Code Circuit', laps: 3, icon: '🟡' },
  { value: 3, label: 'Logic Grand Prix', laps: 4, icon: '🟠' },
  { value: 4, label: 'Algorithm Arena', laps: 5, icon: '🔴' },
  { value: 5, label: 'Championship Circuit', laps: 6, icon: '🏆' }
];

export default function CreateTeamModal({ isOpen, onClose }) {
  const navigate = useNavigate();
  const { state, dispatch } = useGame();
  const { emit, socketId } = useSocket();

  const [step, setStep] = useState(1);
  const [teamName, setTeamName] = useState('');
  const [language, setLanguage] = useState('Python');
  const [level, setLevel] = useState(1);
  const [teamCode, setTeamCode] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const handleCreate = async () => {
    if (!teamName.trim()) {
      setError('Please enter a team name');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await teamAPI.create({ 
        name: teamName.trim(), 
        language, 
        level 
      });
      
      const team = response.data.team;
      setTeamCode(team.code);
      dispatch({ type: 'SET_TEAM', payload: team });

      // Create socket room
      emit('createRoom', {
        teamCode: team.code,
        userId: state.user?._id,
        username: state.user?.username,
        avatar: state.user?.avatar || 'avatar1'
      });

      setStep(2);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create team');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(teamCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleProceed = () => {
    navigate(`/lobby/${teamCode}`);
    handleClose();
  };

  const handleClose = () => {
    setStep(1);
    setTeamCode(null);
    setTeamName('');
    setLanguage('Python');
    setLevel(1);
    setError('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Create Team" size="lg">
      <AnimatePresence mode="wait">
        {step === 1 ? (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="space-y-6"
          >
            {/* Team Name Input */}
            <div>
              <label className="block font-body text-gray-300 mb-2 text-sm">
                Team Name
              </label>
              <motion.input
                type="text"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                placeholder="Enter your team name..."
                whileFocus={{ scale: 1.01 }}
                className="w-full px-4 py-3 rounded-xl input-cyber text-white font-body"
                maxLength={30}
              />
            </div>

            {/* Language Selection */}
            <div>
              <label className="block font-body text-gray-300 mb-2 text-sm">
                Programming Language
              </label>
              <div className="grid grid-cols-2 gap-3">
                {LANGUAGES.map((lang) => (
                  <motion.button
                    key={lang.value}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setLanguage(lang.value)}
                    className={`
                      p-4 rounded-xl border-2 transition-all flex items-center gap-3
                      ${language === lang.value
                        ? 'border-cyan-500 bg-cyan-500/10 text-white'
                        : 'border-white/10 bg-white/5 text-gray-400 hover:border-cyan-500/50'
                      }
                    `}
                  >
                    <span className="text-2xl">{lang.icon}</span>
                    <span className="font-racing">{lang.label}</span>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Level Selection */}
            <div>
              <label className="block font-body text-gray-300 mb-2 text-sm">
                Difficulty Level
              </label>
              <div className="space-y-2">
                {LEVELS.map((lvl) => (
                  <motion.button
                    key={lvl.value}
                    whileHover={{ scale: 1.01, x: 5 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => setLevel(lvl.value)}
                    className={`
                      w-full p-3 rounded-xl border-2 transition-all
                      flex items-center justify-between
                      ${level === lvl.value
                        ? 'border-cyan-500 bg-cyan-500/10'
                        : 'border-white/10 bg-white/5 hover:border-cyan-500/50'
                      }
                    `}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{lvl.icon}</span>
                      <span className="font-racing text-white">{lvl.label}</span>
                    </div>
                    <span className="font-body text-sm text-cyan-400">
                      {lvl.laps} laps
                    </span>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Error message */}
            <AnimatePresence>
              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="text-red-400 font-body text-sm text-center"
                >
                  {error}
                </motion.p>
              )}
            </AnimatePresence>

            {/* Create Button */}
            <Button
              variant="primary"
              size="lg"
              fullWidth
              onClick={handleCreate}
              loading={isLoading}
              icon={<Users size={20} />}
            >
              Create Team
            </Button>
          </motion.div>
        ) : (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="text-center space-y-6"
          >
            {/* Success animation */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', damping: 10 }}
              className="w-20 h-20 mx-auto rounded-full bg-gradient-to-r from-cyan-500 to-purple-600 flex items-center justify-center"
            >
              <Check size={40} className="text-white" />
            </motion.div>

            <div>
              <p className="font-body text-gray-300 mb-2">Your Team Code</p>
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2, type: 'spring' }}
                className="relative"
              >
                <div className="text-5xl md:text-6xl font-racing tracking-[0.3em] text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500">
                  {teamCode}
                </div>
                
                {/* Glow effect */}
                <motion.div
                  animate={{
                    boxShadow: [
                      '0 0 20px rgba(0,240,255,0.3)',
                      '0 0 40px rgba(0,240,255,0.5)',
                      '0 0 20px rgba(0,240,255,0.3)'
                    ]
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute inset-0 -z-10 blur-xl bg-gradient-to-r from-cyan-500/30 to-purple-500/30 rounded-lg"
                />
              </motion.div>
            </div>

            <p className="font-body text-gray-400 text-sm">
              Share this code with your teammates to join the race!
            </p>

            {/* Action buttons */}
            <div className="flex gap-3">
              <Button
                variant="secondary"
                onClick={handleCopyCode}
                icon={copied ? <Check size={18} /> : <Copy size={18} />}
                className="flex-1"
              >
                {copied ? 'Copied!' : 'Copy Code'}
              </Button>
              
              <Button
                variant="primary"
                onClick={handleProceed}
                icon={<ArrowRight size={18} />}
                iconPosition="right"
                className="flex-1"
              >
                Go to Lobby
              </Button>
            </div>

            {/* Team info */}
            <div className="pt-4 border-t border-white/10">
              <div className="flex justify-center gap-6 text-sm">
                <div>
                  <span className="text-gray-500 font-body">Language:</span>
                  <span className="text-cyan-400 font-racing ml-2">{language}</span>
                </div>
                <div>
                  <span className="text-gray-500 font-body">Level:</span>
                  <span className="text-purple-400 font-racing ml-2">{level}</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Modal>
  );
}