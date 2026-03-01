import React from 'react';
import { motion } from 'framer-motion';
import { Crown, Check, Hourglass } from 'lucide-react';

const AVATARS = ['🏎️', '🚗', '🚙', '🏁'];
const COLORS = [
  'from-cyan-500 to-blue-600',
  'from-purple-500 to-pink-600',
  'from-emerald-500 to-green-600',
  'from-orange-500 to-red-600'
];

export default function PlayerCard({ player, isCurrentUser, isEmpty, index }) {
  if (isEmpty) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: index * 0.1 }}
        className="relative min-h-[200px] rounded-2xl border-2 border-dashed border-gray-700 bg-white/[0.02] flex flex-col items-center justify-center p-6"
      >
        <motion.div
          animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-5xl text-gray-600 mb-3"
        >
          👤
        </motion.div>
        <p className="font-body text-gray-600 text-sm">Waiting for player...</p>
        
        {/* Animated border dots */}
        <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
          {[...Array(4)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-gray-600 rounded-full"
              animate={{
                x: [0, 100, 100, 0, 0],
                y: [0, 0, 100, 100, 0],
              }}
              transition={{
                duration: 8,
                delay: i * 2,
                repeat: Infinity,
                ease: 'linear'
              }}
              style={{
                top: i < 2 ? 0 : 'auto',
                bottom: i >= 2 ? 0 : 'auto',
                left: i % 2 === 0 ? 0 : 'auto',
                right: i % 2 === 1 ? 0 : 'auto',
              }}
            />
          ))}
        </div>
      </motion.div>
    );
  }

  const avatarIndex = parseInt(player.avatar?.replace('avatar', '') || '1') - 1;
  const gradientColor = COLORS[index % COLORS.length];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.1, type: 'spring' }}
      whileHover={{ scale: 1.02 }}
      className={`
        player-card relative min-h-[200px] rounded-2xl p-6
        flex flex-col items-center
        ${player.isReady ? 'ready' : ''}
        ${isCurrentUser ? 'ring-2 ring-cyan-500/50' : ''}
      `}
    >
      {/* Background gradient */}
      <div className={`
        absolute inset-0 rounded-2xl opacity-10
        bg-gradient-to-br ${gradientColor}
      `} />

      {/* Leader crown */}
      {player.isLeader && (
        <motion.div
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="absolute -top-3 left-1/2 -translate-x-1/2"
        >
          <div className="px-3 py-1 rounded-full bg-yellow-500/20 border border-yellow-500/50">
            <Crown size={14} className="text-yellow-400" />
          </div>
        </motion.div>
      )}

      {/* Avatar */}
      <motion.div
        animate={player.isReady ? { y: [0, -5, 0] } : {}}
        transition={{ duration: 1, repeat: Infinity }}
        className={`
          text-5xl mb-4 p-4 rounded-full
          bg-gradient-to-br ${gradientColor}
          shadow-lg
        `}
      >
        {AVATARS[avatarIndex] || '🏎️'}
      </motion.div>

      {/* Name */}
      <div className="text-center mb-3">
        <p className="font-racing text-lg text-white truncate max-w-[120px]">
          {player.username}
        </p>
        {isCurrentUser && (
          <span className="text-xs font-body text-cyan-400">(You)</span>
        )}
      </div>

      {/* Ready status */}
      <motion.div
        animate={player.isReady ? { scale: [1, 1.05, 1] } : {}}
        transition={{ duration: 1, repeat: Infinity }}
        className={`
          flex items-center gap-2 px-4 py-2 rounded-full text-sm font-body
          ${player.isReady
            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50'
            : 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
          }
        `}
      >
        {player.isReady ? (
          <>
            <Check size={14} />
            <span>Ready</span>
          </>
        ) : (
          <>
            <Hourglass size={14} />
            <span>Not Ready</span>
          </>
        )}
      </motion.div>

      {/* Connection indicator */}
      <div className="absolute bottom-3 right-3">
        <div className="status-dot status-online" style={{ width: '8px', height: '8px' }} />
      </div>
    </motion.div>
  );
}