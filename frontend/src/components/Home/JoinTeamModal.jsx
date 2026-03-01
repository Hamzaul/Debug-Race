import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, AlertCircle } from 'lucide-react';
import { useGame } from '../../context/GameContext';
import { useSocket } from '../../context/SocketContext';
import { teamAPI } from '../../services/api';
import Modal from '../common/Modal';
import Button from '../common/Button';

export default function JoinTeamModal({ isOpen, onClose }) {
  const navigate = useNavigate();
  const { state, dispatch } = useGame();
  const { emit } = useSocket();
  
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [shake, setShake] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(0);
  const inputRefs = useRef([]);

  // Focus first input when modal opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 100);
    }
  }, [isOpen]);

  const handleInputChange = (index, value) => {
    // Only allow numbers
    if (!/^\d*$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value.slice(-1); // Take only last character
    setCode(newCode);
    setError('');

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
      setFocusedIndex(index + 1);
    }

    // Auto-submit when all filled
    if (index === 5 && value) {
      const fullCode = [...newCode.slice(0, 5), value.slice(-1)].join('');
      if (fullCode.length === 6) {
        setTimeout(() => handleJoin(fullCode), 300);
      }
    }
  };

  const handleKeyDown = (index, e) => {
    // Handle backspace
    if (e.key === 'Backspace') {
      if (!code[index] && index > 0) {
        const newCode = [...code];
        newCode[index - 1] = '';
        setCode(newCode);
        inputRefs.current[index - 1]?.focus();
        setFocusedIndex(index - 1);
      }
    }

    // Handle left arrow
    if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
      setFocusedIndex(index - 1);
    }

    // Handle right arrow
    if (e.key === 'ArrowRight' && index < 5) {
      inputRefs.current[index + 1]?.focus();
      setFocusedIndex(index + 1);
    }

    // Handle paste
    if (e.key === 'v' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      navigator.clipboard.readText().then(text => {
        const digits = text.replace(/\D/g, '').slice(0, 6).split('');
        const newCode = [...code];
        digits.forEach((digit, i) => {
          if (i < 6) newCode[i] = digit;
        });
        setCode(newCode);
        
        // Focus appropriate input
        const nextIndex = Math.min(digits.length, 5);
        inputRefs.current[nextIndex]?.focus();
        setFocusedIndex(nextIndex);
        
        // Auto-submit if complete
        if (digits.length === 6) {
          setTimeout(() => handleJoin(digits.join('')), 300);
        }
      });
    }

    // Handle Enter
    if (e.key === 'Enter') {
      const fullCode = code.join('');
      if (fullCode.length === 6) {
        handleJoin(fullCode);
      }
    }
  };

  const handleJoin = async (teamCode = null) => {
    const codeToUse = teamCode || code.join('');
    
    if (codeToUse.length !== 6) {
      setError('Please enter a complete 6-digit code');
      triggerShake();
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await teamAPI.join(codeToUse);
      const team = response.data.team;
      
      dispatch({ type: 'SET_TEAM', payload: team });

      // Join socket room
      emit('joinRoom', {
        teamCode: codeToUse,
        userId: state.user?._id,
        username: state.user?.username,
        avatar: state.user?.avatar || 'avatar1'
      });

      navigate(`/lobby/${codeToUse}`);
      handleClose();
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Invalid team code';
      setError(errorMsg);
      triggerShake();
    } finally {
      setIsLoading(false);
    }
  };

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 500);
  };

  const handleClose = () => {
    setCode(['', '', '', '', '', '']);
    setError('');
    setFocusedIndex(0);
    onClose();
  };

  const isComplete = code.every(digit => digit !== '');

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Join Team" size="md">
      <div className="space-y-8">
        {/* Instructions */}
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center font-body text-gray-400"
        >
          Enter the 6-digit code to join your team
        </motion.p>

        {/* Code input boxes */}
        <motion.div
          animate={shake ? { x: [-10, 10, -10, 10, 0] } : {}}
          transition={{ duration: 0.4 }}
          className="flex justify-center gap-2 md:gap-3"
        >
          {code.map((digit, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="relative"
            >
              <input
                ref={el => inputRefs.current[index] = el}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleInputChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onFocus={() => setFocusedIndex(index)}
                className={`
                  code-input rounded-xl
                  ${error ? 'error' : ''}
                  ${digit ? 'success' : ''}
                  ${focusedIndex === index ? 'ring-2 ring-cyan-500/50' : ''}
                `}
              />
              
              {/* Focus indicator */}
              {focusedIndex === index && !digit && (
                <motion.div
                  animate={{ opacity: [1, 0] }}
                  transition={{ duration: 0.8, repeat: Infinity }}
                  className="absolute inset-x-4 bottom-3 h-0.5 bg-cyan-500"
                />
              )}
            </motion.div>
          ))}
        </motion.div>

        {/* Error message */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex items-center justify-center gap-2 text-red-400"
            >
              <AlertCircle size={18} />
              <span className="font-body text-sm">{error}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Join button */}
        <Button
          variant="primary"
          size="lg"
          fullWidth
          onClick={() => handleJoin()}
          loading={isLoading}
          disabled={!isComplete}
          icon={<ArrowRight size={20} />}
          iconPosition="right"
        >
          Join Race
        </Button>

        {/* Helper text */}
        <p className="text-center text-gray-500 text-xs font-body">
          Ask your friend for the team code, or create your own team
        </p>
      </div>
    </Modal>
  );
}