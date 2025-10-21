import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface HolographicButtonProps {
  children: ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const HolographicButton = ({ 
  children, 
  onClick, 
  variant = 'primary', 
  size = 'md',
  className = ''
}: HolographicButtonProps) => {
  const sizeClasses = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg'
  };

  const variantClasses = {
    primary: 'bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500',
    secondary: 'bg-gradient-to-r from-gray-700 via-gray-800 to-gray-900'
  };

  return (
    <motion.button
      onClick={onClick}
      className={`
        relative overflow-hidden rounded-xl font-medium text-white
        ${sizeClasses[size]} ${variantClasses[variant]} ${className}
        border border-white/20 backdrop-blur-sm
        hover:shadow-2xl hover:shadow-purple-500/25
        transition-all duration-300
      `}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      {/* Holographic shimmer effect */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
        animate={{
          x: ['-100%', '100%'],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      
      {/* Inner glow */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 via-purple-400/20 to-pink-400/20 rounded-xl blur-md" />
      
      {/* Content */}
      <span className="relative z-10">{children}</span>
    </motion.button>
  );
};