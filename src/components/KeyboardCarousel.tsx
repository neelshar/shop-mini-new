import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

export const KeyboardCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(1); // Start with middle image

  const keyboardImages = [
    {
      src: '/kbd_sounds_formatted/keyboard_images/GOyCynoakAAWOsP.jpg',
      title: 'Gaming Pro',
    },
    {
      src: '/kbd_sounds_formatted/keyboard_images/feature-coolest-mechanical-keyboards.png',
      title: 'Aesthetic Build',
    },
    {
      src: '/kbd_sounds_formatted/keyboard_images/rsz_holynickepic.jpg',
      title: 'Custom Artisan',
    },
  ];

  // Auto-cycle through images
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % keyboardImages.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [keyboardImages.length]);

  const getCardStyle = (index: number) => {
    const diff = index - currentIndex;
    const absIndex = Math.abs(diff);
    
    if (absIndex === 0) {
      // Center card
      return {
        scale: 1.1,
        x: 0,
        z: 50,
        rotateY: 0,
        opacity: 1,
        zIndex: 10,
      };
    } else if (absIndex === 1) {
      // Side cards
      return {
        scale: 0.85,
        x: diff > 0 ? 200 : -200,
        z: -50,
        rotateY: diff > 0 ? -25 : 25,
        opacity: 0.7,
        zIndex: 5,
      };
    } else {
      // Hidden cards
      return {
        scale: 0.7,
        x: diff > 0 ? 400 : -400,
        z: -100,
        rotateY: diff > 0 ? -45 : 45,
        opacity: 0.3,
        zIndex: 1,
      };
    }
  };

  return (
    <div className="relative w-full h-72 perspective-1000 preserve-3d flex items-center justify-center">
      <div className="relative w-full h-full">
        {keyboardImages.map((keyboard, index) => {
          const style = getCardStyle(index);
          return (
            <motion.div
              key={index}
              className="absolute left-1/2 top-1/2 w-72 h-56 cursor-pointer"
              style={{
                transformOrigin: 'center center',
                zIndex: style.zIndex,
              }}
              animate={{
                scale: style.scale,
                x: `calc(-50% + ${style.x}px)`,
                y: '-50%',
                z: style.z,
                rotateY: style.rotateY,
                opacity: style.opacity,
              }}
              transition={{
                duration: 0.8,
                ease: [0.25, 0.1, 0.25, 1],
              }}
              onClick={() => setCurrentIndex(index)}
            >
              <div className="w-full h-full rounded-3xl overflow-hidden relative group shadow-2xl">
                <div className="w-full h-full bg-gradient-to-br from-purple-900/20 via-slate-800 to-black rounded-3xl">
                  <img
                    src={keyboard.src}
                    alt={keyboard.title}
                    className="w-full h-full object-cover rounded-3xl"
                    onLoad={(e) => {
                      console.log(`Successfully loaded: ${keyboard.src}`);
                      e.currentTarget.style.opacity = '1';
                    }}
                    onError={(e) => {
                      console.log(`Failed to load image: ${keyboard.src}`);
                      e.currentTarget.style.display = 'none';
                      const parent = e.currentTarget.parentElement;
                      if (parent) {
                        parent.innerHTML = `
                          <div class="w-full h-full bg-gradient-to-br from-purple-600 via-violet-700 to-purple-900 rounded-3xl flex items-center justify-center">
                            <div class="text-center text-white">
                              <div class="text-4xl mb-2">⌨️</div>
                              <div class="text-lg font-semibold">${keyboard.title}</div>
                              <div class="text-sm opacity-70">Custom Keyboard</div>
                            </div>
                          </div>
                        `;
                      }
                    }}
                    style={{ opacity: 0, transition: 'opacity 0.3s' }}
                  />
                </div>
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent rounded-3xl" />
                {/* Purple glow effect for center card */}
                {index === currentIndex && (
                  <>
                    <div className="absolute inset-0 rounded-3xl shadow-2xl shadow-purple-500/40" />
                    <div className="absolute inset-0 rounded-3xl ring-2 ring-purple-400/30" />
                  </>
                )}
                {/* Title overlay */}
                <div className="absolute bottom-6 left-6 right-6">
                  <motion.h3
                    className="text-white font-bold text-xl drop-shadow-lg"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ 
                      opacity: index === currentIndex ? 1 : 0.8,
                      y: index === currentIndex ? 0 : 5,
                      scale: index === currentIndex ? 1 : 0.9
                    }}
                    transition={{ duration: 0.3 }}
                  >
                    {keyboard.title}
                  </motion.h3>
                </div>
                {/* Glass morphism overlay for non-center cards */}
                {index !== currentIndex && (
                  <div className="absolute inset-0 bg-black/40 backdrop-blur-sm rounded-3xl" />
                )}
                {/* Floating accent for center card */}
                {index === currentIndex && (
                  <motion.div
                    className="absolute top-4 right-4 w-3 h-3 bg-purple-400 rounded-full"
                    animate={{
                      scale: [1, 1.3, 1],
                      opacity: [0.7, 1, 0.7],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  />
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
      {/* Progress dots */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-3">
        {keyboardImages.map((_, index) => (
          <motion.div
            key={index}
            className={`w-3 h-3 rounded-full cursor-pointer transition-all duration-300 ${
              index === currentIndex ? 'bg-purple-400 shadow-lg shadow-purple-400/50' : 'bg-white/40 hover:bg-white/60'
            }`}
            whileHover={{ scale: 1.3 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setCurrentIndex(index)}
          />
        ))}
      </div>
    </div>
  );
};