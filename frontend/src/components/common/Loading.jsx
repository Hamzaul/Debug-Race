import React from 'react';
import { motion } from 'framer-motion';

export default function Loading({ 
  text = 'Loading...', 
  size = 'md',
  showText = true 
}) {
  const sizes = {
    sm: 'w-8 h-8',
    md: 'w-16 h-16',
    lg: 'w-24 h-24'
  };

  return (
    <div className="flex flex-col items-center justify-center p-8">
      {/* Animated rings */}
      <div className={`relative ${sizes[size]}`}>
        {/* Outer ring */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          className="absolute inset-0 border-4 border-transparent border-t-cyan-500 border-r-cyan-500/50 rounded-full"
        />
        
        {/* Middle ring */}
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
          className="absolute inset-2 border-4 border-transparent border-t-purple-500 border-r-purple-500/50 rounded-full"
        />
        
        {/* Inner ring */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="absolute inset-4 border-4 border-transparent border-t-pink-500 border-r-pink-500/50 rounded-full"
        />
        
        {/* Center dot */}
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 1, repeat: Infinity }}
          className="absolute inset-0 m-auto w-2 h-2 bg-white rounded-full"
        />
      </div>
      
      {/* Text */}
      {showText && (
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 font-racing text-cyan-400"
        >
          {text.split('').map((char, i) => (
            <motion.span
              key={i}
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ 
                duration: 1.5, 
                repeat: Infinity, 
                delay: i * 0.1 
              }}
            >
              {char}
            </motion.span>
          ))}
        </motion.p>
      )}
    </div>
  );
}