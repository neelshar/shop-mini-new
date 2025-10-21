import { motion } from 'framer-motion';

export const KeyboardCarousel = () => {
  // DARK CUSTOM MECHANICAL KEYBOARDS - Real custom builds
  const keyboardImages = [
    {
      src: 'https://images.unsplash.com/photo-1595044426077-d36d9236d54a?w=600&h=400&fit=crop&auto=format&q=90',
      title: 'Custom 65%',
      subtitle: 'Artisan Build'
    },
    {
      src: 'https://images.unsplash.com/photo-1541140532154-b024d705b90a?w=600&h=400&fit=crop&auto=format&q=90',
      title: 'Keycap Legend', 
      subtitle: 'Premium Switches'
    },
    {
      src: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&h=400&fit=crop&auto=format&q=90',
      title: 'Enthusiast TKL',
      subtitle: 'Hand Crafted'
    },
  ];

  console.log('🖤 DARK AESTHETIC KEYBOARDS:', keyboardImages.map(img => img.src));

  return (
    <div className="w-full max-w-6xl mx-auto px-2 overflow-hidden">
      {/* Continuously moving horizontal gallery */}
      <motion.div 
        className="flex gap-6"
        animate={{
          x: [0, -100, -200, -300, 0], // Move through all images and back
        }}
        transition={{
          duration: 12, // 12 seconds for full cycle
          repeat: Infinity,
          ease: "linear", // Smooth constant movement
        }}
      >
        {/* Duplicate images for seamless loop */}
        {[...keyboardImages, ...keyboardImages].map((keyboard, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ 
              duration: 0.6, 
              delay: (index % keyboardImages.length) * 0.2,
              ease: [0.25, 0.1, 0.25, 1]
            }}
            className="relative group flex-shrink-0 w-72"
          >
            <div className="aspect-[4/3] rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-[1.02] relative">
              <img
                src={keyboard.src}
                alt={keyboard.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                onLoad={() => console.log(`✅ LOADED: ${keyboard.title}`)}
                onError={() => console.error(`❌ FAILED: ${keyboard.title} - ${keyboard.src}`)}
              />
              
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300" />
              
              {/* Continuous horizontal movement animation */}
              <motion.div
                animate={{
                  x: index === 0 ? [0, 20, 0] : index === 1 ? [0, -15, 0] : [0, 10, 0],
                  y: index === 0 ? [0, -10, 0] : index === 1 ? [0, 8, 0] : [0, -5, 0],
                }}
                transition={{
                  duration: 4 + index * 0.8,
                  repeat: Infinity,
                  ease: "easeInOut",
                  repeatDelay: 0.5
                }}
                className="absolute inset-0 pointer-events-none"
              />
              
              {/* Subtle pulsing glow effect */}
              <motion.div
                animate={{
                  opacity: [0.3, 0.7, 0.3],
                  scale: [1, 1.02, 1],
                }}
                transition={{
                  duration: 3 + index * 0.7,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="absolute inset-0 bg-purple-500/20 rounded-2xl pointer-events-none"
              />
              
              {/* Content overlay */}
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                >
                  <h3 className="text-white font-bold text-lg mb-1 drop-shadow-lg">
                    {keyboard.title}
                  </h3>
                  <p className="text-white/90 text-sm drop-shadow-md">
                    {keyboard.subtitle}
                  </p>
                  <div className="w-12 h-0.5 bg-purple-400 mt-2 rounded-full" />
                </motion.div>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};