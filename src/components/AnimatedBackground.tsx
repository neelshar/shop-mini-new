import { motion } from 'framer-motion';

const FloatingRing = ({ size, delay, initialX, initialY, strokeWidth = 2 }: {
  size: number;
  delay: number;
  initialX: number;
  initialY: number;
  strokeWidth?: number;
}) => {
  return (
    <motion.div
      className="absolute"
      style={{
        left: `${initialX}%`,
        top: `${initialY}%`,
        width: size,
        height: size,
      }}
      animate={{
        x: [0, 100, -50, 80, 0],
        y: [0, -80, 120, -40, 0],
        rotate: [0, 180, 360],
        scale: [1, 1.2, 0.8, 1.1, 1],
      }}
      transition={{
        duration: 25 + delay,
        delay,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    >
      <svg width="100%" height="100%" viewBox="0 0 100 100" className="opacity-20">
        <circle
          cx="50"
          cy="50"
          r={45}
          fill="none"
          stroke="url(#purpleGradient)"
          strokeWidth={strokeWidth}
          className="blur-sm"
        />
        <defs>
          <linearGradient id="purpleGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#8b5cf6" />
            <stop offset="50%" stopColor="#a855f7" />
            <stop offset="100%" stopColor="#c084fc" />
          </linearGradient>
        </defs>
      </svg>
    </motion.div>
  );
};

const FloatingBubble = ({ size, delay, initialX, initialY }: {
  size: number;
  delay: number;
  initialX: number;
  initialY: number;
}) => {
  return (
    <motion.div
      className="absolute rounded-full opacity-10"
      style={{
        left: `${initialX}%`,
        top: `${initialY}%`,
        width: size,
        height: size,
        background: 'radial-gradient(circle at 30% 30%, rgba(139, 92, 246, 0.4), rgba(139, 92, 246, 0.1), transparent)',
        filter: 'blur(1px)',
      }}
      animate={{
        x: [0, -60, 40, -20, 0],
        y: [0, 80, -60, 30, 0],
        scale: [1, 0.7, 1.3, 0.9, 1],
        opacity: [0.1, 0.3, 0.05, 0.2, 0.1],
      }}
      transition={{
        duration: 20 + delay * 2,
        delay,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    />
  );
};

export const AnimatedBackground = () => {
  const rings = [
    { size: 200, delay: 0, x: 15, y: 20, strokeWidth: 1 },
    { size: 150, delay: 3, x: 75, y: 15, strokeWidth: 2 },
    { size: 300, delay: 7, x: 80, y: 70, strokeWidth: 1 },
    { size: 120, delay: 12, x: 25, y: 80, strokeWidth: 3 },
    { size: 180, delay: 5, x: 60, y: 45, strokeWidth: 1 },
    { size: 250, delay: 15, x: 10, y: 50, strokeWidth: 2 },
    { size: 100, delay: 20, x: 90, y: 30, strokeWidth: 2 },
    { size: 80, delay: 8, x: 40, y: 10, strokeWidth: 1 },
  ];

  const bubbles = [
    { size: 60, delay: 2, x: 20, y: 30 },
    { size: 40, delay: 8, x: 70, y: 60 },
    { size: 80, delay: 14, x: 85, y: 20 },
    { size: 50, delay: 6, x: 30, y: 75 },
    { size: 35, delay: 18, x: 65, y: 25 },
    { size: 70, delay: 10, x: 15, y: 65 },
  ];

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {/* Pure Black Background */}
      <div className="absolute inset-0 bg-black" />
      
      {/* Floating Rings */}
      {rings.map((ring, index) => (
        <FloatingRing
          key={`ring-${index}`}
          size={ring.size}
          delay={ring.delay}
          initialX={ring.x}
          initialY={ring.y}
          strokeWidth={ring.strokeWidth}
        />
      ))}

      {/* Floating Bubbles */}
      {bubbles.map((bubble, index) => (
        <FloatingBubble
          key={`bubble-${index}`}
          size={bubble.size}
          delay={bubble.delay}
          initialX={bubble.x}
          initialY={bubble.y}
        />
      ))}

      {/* Subtle Purple Accent Glows */}
      <motion.div
        className="absolute top-1/3 left-1/5 w-96 h-96 bg-purple-600/5 rounded-full blur-3xl"
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.05, 0.15, 0.05],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="absolute bottom-1/3 right-1/5 w-80 h-80 bg-violet-600/5 rounded-full blur-3xl"
        animate={{
          scale: [1.2, 0.8, 1.2],
          opacity: [0.1, 0.05, 0.1],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    </div>
  );
};