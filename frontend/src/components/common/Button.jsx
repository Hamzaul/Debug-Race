import React from 'react';
import { motion } from 'framer-motion';

const variants = {
  primary: `
    bg-gradient-to-r from-cyan-500 to-blue-600
    hover:from-cyan-400 hover:to-blue-500
    text-white shadow-lg shadow-cyan-500/30
    hover:shadow-cyan-500/50
  `,
  secondary: `
    bg-transparent border-2 border-cyan-500
    text-cyan-400 hover:bg-cyan-500/10
    hover:shadow-lg hover:shadow-cyan-500/30
  `,
  success: `
    bg-gradient-to-r from-emerald-500 to-green-600
    hover:from-emerald-400 hover:to-green-500
    text-white shadow-lg shadow-emerald-500/30
    hover:shadow-emerald-500/50
  `,
  danger: `
    bg-gradient-to-r from-red-500 to-rose-600
    hover:from-red-400 hover:to-rose-500
    text-white shadow-lg shadow-red-500/30
    hover:shadow-red-500/50
  `,
  purple: `
    bg-gradient-to-r from-purple-500 to-pink-600
    hover:from-purple-400 hover:to-pink-500
    text-white shadow-lg shadow-purple-500/30
    hover:shadow-purple-500/50
  `,
  ghost: `
    bg-transparent text-gray-400
    hover:text-white hover:bg-white/5
  `
};

const sizes = {
  sm: 'px-4 py-2 text-sm',
  md: 'px-6 py-3 text-base',
  lg: 'px-8 py-4 text-lg',
  xl: 'px-10 py-5 text-xl'
};

export default function Button({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  icon = null,
  iconPosition = 'left',
  fullWidth = false,
  className = '',
  ...props
}) {
  return (
    <motion.button
      onClick={onClick}
      disabled={disabled || loading}
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      className={`
        relative font-racing font-bold uppercase tracking-wider
        rounded-lg transition-all duration-300
        focus:outline-none focus:ring-2 focus:ring-offset-2 
        focus:ring-offset-[#0a0a0f] focus:ring-cyan-500
        disabled:opacity-50 disabled:cursor-not-allowed
        flex items-center justify-center gap-2
        overflow-hidden
        ${variants[variant]}
        ${sizes[size]}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
      {...props}
    >
      {/* Shine effect */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
        initial={{ x: '-100%' }}
        whileHover={{ x: '100%' }}
        transition={{ duration: 0.5 }}
      />
      
      {/* Loading spinner */}
      {loading && (
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
        />
      )}
      
      {/* Icon left */}
      {icon && iconPosition === 'left' && !loading && (
        <span className="text-xl">{icon}</span>
      )}
      
      {/* Text */}
      <span className="relative z-10">{children}</span>
      
      {/* Icon right */}
      {icon && iconPosition === 'right' && !loading && (
        <span className="text-xl">{icon}</span>
      )}
    </motion.button>
  );
}