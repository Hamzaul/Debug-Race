import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

export default function Modal({ 
  isOpen, 
  onClose, 
  title, 
  children,
  size = 'md',
  showClose = true 
}) {
  // Handle escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  const sizes = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl'
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="absolute inset-0 modal-overlay"
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ 
              type: 'spring', 
              damping: 25, 
              stiffness: 300 
            }}
            className={`
              relative z-10 w-full ${sizes[size]}
              bg-gradient-to-b from-[#1a1a2e] to-[#0f0f1a]
              border border-cyan-500/20 rounded-2xl
              shadow-2xl shadow-cyan-500/10
              overflow-hidden
            `}
          >
            {/* Glow effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 via-purple-500/5 to-pink-500/5" />
            
            {/* Top accent line */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500" />
            
            {/* Header */}
            <div className="relative flex items-center justify-between px-6 py-4 border-b border-white/5">
              <motion.h2 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="font-racing text-xl text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500"
              >
                {title}
              </motion.h2>
              
              {showClose && (
                <motion.button
                  onClick={onClose}
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  className="p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-white/5"
                >
                  <X size={20} />
                </motion.button>
              )}
            </div>
            
            {/* Content */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="relative p-6"
            >
              {children}
            </motion.div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}