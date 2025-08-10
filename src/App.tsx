import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RealKeysim } from './components/RealKeysim';
import { ComponentSearchModal } from './components/ComponentSearchModal';
import { AnimatedBackground } from './components/AnimatedBackground';
import { HolographicButton } from './components/HolographicButton';
import { KeyboardCarousel } from './components/KeyboardCarousel';

// Types for our keyboard configuration
interface KeyboardConfig {
  layout: 'ansi' | 'iso' | '60' | '65' | 'tkl' | 'full'
  switches: 'linear' | 'tactile' | 'clicky'
  keycaps: 'cherry' | 'oem' | 'sa' | 'xda'
  case: 'aluminum' | 'plastic' | 'wood' | 'carbon'
  plate: 'steel' | 'aluminum' | 'brass' | 'pc'
  stabilizers: 'cherry' | 'durock' | 'zeal'
  case_color: string
  keycap_color: string
  switch_color: string
}

type AppPage = 'welcome' | 'preferences' | 'builder' | 'customizer' | 'sound-test'



export function App() {
  const [currentPage, setCurrentPage] = useState<AppPage>('welcome')
  const [keyboardConfig, setKeyboardConfig] = useState<KeyboardConfig>({
    layout: 'tkl',
    switches: 'tactile',
    keycaps: 'cherry',
    case: 'aluminum',
    plate: 'aluminum',
    stabilizers: 'durock',
    case_color: '#f5f5f5', // Light grey case
    keycap_color: '#ffffff', // Pure white keycaps
    switch_color: '#2a2a2a' // Dark grey switches
  })
  const [isLoaded, setIsLoaded] = useState(false)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [nextPage, setNextPage] = useState<AppPage | null>(null)
  
  // Product search/select states
  const [selectedComponent, setSelectedComponent] = useState<'keycaps' | 'switches' | 'case' | null>(null)
  const [selectedProducts, setSelectedProducts] = useState<{
    keycaps: any | null
    switches: any | null
    case: any | null
  }>({
    keycaps: null,
    switches: null,
    case: null
  })

  // Simple cart state
  const [isCartOpen, setIsCartOpen] = useState(false)

  useEffect(() => {
    // Trigger animations after component mounts
    const timer = setTimeout(() => setIsLoaded(true), 100)
    return () => clearTimeout(timer)
  }, [])

  // Smooth page transition function
  const navigateToPage = (page: AppPage) => {
    if (page === currentPage || isTransitioning) return
    
    setIsTransitioning(true)
    setNextPage(page)
    
    // Delay to show exit animation, then change page
    setTimeout(() => {
      setCurrentPage(page)
      setIsTransitioning(false)
      setNextPage(null)
    }, 300)
  }

  // Handle product selection
  const handleProductSelect = (product: any, componentType: 'keycaps' | 'switches' | 'case') => {
    console.log(`Selected ${componentType}:`, product)
    console.log('Product price structure:', {
      priceRange: product.priceRange,
      minVariantPrice: product.priceRange?.minVariantPrice,
      amount: product.priceRange?.minVariantPrice?.amount
    })
    setSelectedProducts(prev => ({
      ...prev,
      [componentType]: product
    }))
  }

  // Simple cart calculation
  const calculateCartTotal = () => {
    let total = 0
    
    const getPrice = (product: any) => {
      if (!product) return 0
      const price = product.priceRange?.minVariantPrice?.amount ||
                   product.priceRange?.min?.amount ||
                   product.variants?.[0]?.priceV2?.amount ||
                   product.variants?.[0]?.price ||
                   product.price?.amount ||
                   product.price
      return price ? parseFloat(price) : 0
    }
    
    if (selectedProducts.keycaps) total += getPrice(selectedProducts.keycaps)
    if (selectedProducts.switches) total += getPrice(selectedProducts.switches)
    if (selectedProducts.case) total += getPrice(selectedProducts.case)
    
    return total > 0 ? total : 399
  }

  // Welcome Page - Clean Layout
  if (currentPage === 'welcome') {
    return (
      <div className="min-h-screen relative overflow-hidden">
        {/* Animated Background with floating rings */}
        <AnimatedBackground />
        
        {/* Main Content - Clean Layout */}
        <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-6">
          {/* INSANELY SLEEK Header Text */}
          <motion.div 
            className="text-center mb-8 max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
          >
            {/* DESIGN with perfect typography */}
            <motion.h1 
              className="text-5xl sm:text-6xl lg:text-7xl font-black text-white mb-3 leading-none tracking-tight"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
              style={{
                fontFamily: 'system-ui, -apple-system, sans-serif',
                fontWeight: 900,
                letterSpacing: '-0.02em'
              }}
            >
              DESIGN
            </motion.h1>
            
            {/* PERFECT divider line exactly like reference */}
            <motion.div 
              className="relative mx-auto mb-3 flex items-center justify-center"
              initial={{ opacity: 0, scaleX: 0 }}
              animate={{ opacity: 1, scaleX: 1 }}
              transition={{ duration: 1.5, delay: 0.5, ease: "easeOut" }}
            >
              {/* Left line */}
              <div className="w-16 h-px bg-gradient-to-r from-transparent to-purple-500"></div>
              
              {/* Center dot with glow */}
              <motion.div 
                className="relative mx-4"
                animate={{
                  scale: [1, 1.1, 1]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <div className="w-2 h-2 bg-purple-500 rounded-full relative z-10"></div>
                <motion.div 
                  className="absolute inset-0 w-2 h-2 bg-purple-400 rounded-full blur-sm"
                  animate={{
                    opacity: [0.6, 1, 0.6],
                    scale: [1, 1.3, 1]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                ></motion.div>
              </motion.div>
              
              {/* Right line */}
              <div className="w-16 h-px bg-gradient-to-l from-transparent to-purple-500"></div>
            </motion.div>
            
            {/* YOUR CLICKS with perfect typography */}
            <motion.h1 
              className="text-5xl sm:text-6xl lg:text-7xl font-black text-white mb-8 leading-none tracking-tight"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
              style={{
                fontFamily: 'system-ui, -apple-system, sans-serif',
                fontWeight: 900,
                letterSpacing: '-0.02em'
              }}
            >
              YOUR CLICKS
            </motion.h1>
            
            {/* Elegant subtitle */}
            <motion.p 
              className="text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed font-light"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8, ease: "easeOut" }}
              style={{
                fontFamily: 'system-ui, -apple-system, sans-serif',
                letterSpacing: '0.01em'
              }}
            >
              Streamline your custom keyboard<br />building experience
            </motion.p>
          </motion.div>

          {/* Gallery with smooth entrance */}
          <motion.div 
            className="mb-12 w-full px-2"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 1.2, ease: "easeOut" }}
          >
            <KeyboardCarousel />
          </motion.div>

          {/* ABSOLUTELY INSANE Premium Button */}
          <motion.div 
            className="relative"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 1.6, ease: "easeOut" }}
          >
            {/* Container without gradients */}
            <div className="relative">
              {/* Premium Button */}
              <motion.button
                onClick={() => setCurrentPage('preferences')}
                className="relative bg-transparent text-white font-semibold px-16 py-5 text-lg rounded-2xl overflow-hidden w-full border border-white/15"
                whileHover={{ 
                  scale: 1.01,
                  borderColor: "rgba(255,255,255,0.3)"
                }}
                whileTap={{ scale: 0.99 }}
                transition={{ 
                  type: "spring", 
                  stiffness: 400, 
                  damping: 25,
                  boxShadow: { duration: 0.2 }
                }}
                      style={{
                  fontFamily: 'system-ui, -apple-system, sans-serif',
                  fontWeight: 600,
                  letterSpacing: '0.02em'
                }}
              >
                <span className="relative z-10 drop-shadow-lg">Start Building</span>
              </motion.button>
            </div>
          </motion.div>
                  </div>
                  </div>
    )
  }

  // Preferences Page - ABSOLUTELY INSANE MAGICAL DESIGN
  if (currentPage === 'preferences') {
    return (
      <div className="min-h-screen relative overflow-hidden">
        {/* Epic Animated Background matching home page */}
        <AnimatedBackground />
        
        <div className="relative z-10 min-h-screen flex flex-col px-6 py-8">
          {/* Magical Header */}
          <motion.div 
            className="text-center mb-12"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
          >
            {/* Back Button - Floating */}
            <motion.button
              onClick={() => navigateToPage('welcome')}
              className="absolute top-8 left-8 w-12 h-12 bg-slate-900/40 backdrop-blur-sm border border-slate-700/50 rounded-full flex items-center justify-center text-white/80 hover:text-white hover:bg-slate-800/60 transition-all duration-300"
              whileHover={{ scale: 1.1, rotate: -90 }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </motion.button>

                        {/* Refined Title - Better Visual Hierarchy */}
            <motion.h1 
              className="text-4xl sm:text-5xl lg:text-6xl leading-none tracking-tight mb-6"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
              style={{
                fontFamily: 'system-ui, -apple-system, sans-serif',
                letterSpacing: '-0.02em'
              }}
            >
              <span className="font-medium text-white/90">PICK YOUR</span><br />
              <motion.span
                className="font-black bg-gradient-to-r from-purple-400 via-blue-400 to-purple-300 bg-clip-text text-transparent"
                animate={{
                  backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                style={{
                  backgroundSize: '200% 200%'
                }}
              >
                PREFERENCES
              </motion.span>
            </motion.h1>
            
            {/* Engaging subtitle with fade-in */}
            <motion.p 
              className="text-lg text-gray-300 max-w-xl mx-auto leading-relaxed font-light mb-16"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.8, ease: "easeOut" }}
                      style={{
                fontFamily: 'system-ui, -apple-system, sans-serif',
                letterSpacing: '0.01em'
              }}
            >
              Your perfect keyboard, in the making.
            </motion.p>

            {/* Magical divider */}
            <motion.div 
              className="relative mx-auto mb-8 flex items-center justify-center"
              initial={{ opacity: 0, scaleX: 0 }}
              animate={{ opacity: 1, scaleX: 1 }}
              transition={{ duration: 1.5, delay: 0.6, ease: "easeOut" }}
            >
              <div className="w-20 h-px bg-gradient-to-r from-transparent via-purple-500/60 to-transparent"></div>
              <motion.div 
                className="relative mx-4"
                animate={{
                  rotate: [0, 180, 360]
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <div className="w-2 h-2 bg-purple-500 rounded-full relative z-10"></div>
                <motion.div 
                  className="absolute inset-0 w-6 h-6 -m-2 bg-purple-400/20 rounded-full blur-sm"
                  animate={{
                    opacity: [0.4, 0.8, 0.4],
                    scale: [1, 1.5, 1]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                ></motion.div>
              </motion.div>
              <div className="w-20 h-px bg-gradient-to-l from-transparent via-purple-500/60 to-transparent"></div>
            </motion.div>
          </motion.div>

          {/* Preference Sections with Glassmorphism */}
          <div className="flex-1 max-w-5xl mx-auto w-full">
            <div className="space-y-12">
              
                                          {/* Layout Selection - Glassmorphic Section */}
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 1 }}
                className="relative"
              >
                {/* Glass container */}
                <div className="bg-slate-900/20 backdrop-blur-sm border border-slate-700/30 rounded-2xl p-8">
                                    <motion.h2 
                    className="text-xl font-bold text-white/90 mb-8 text-left tracking-tight"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.2 }}
                    style={{
                      fontFamily: 'system-ui, -apple-system, sans-serif',
                      fontWeight: 700,
                      letterSpacing: '-0.01em'
                    }}
                  >
                    Keyboard Layout
                  </motion.h2>
                  
                  <div className="grid grid-cols-3 gap-4">
                    {[
                      { id: 'tkl', name: 'TKL', desc: 'Tenkeyless' },
                      { id: '60', name: '60%', desc: 'Compact' },
                      { id: 'full', name: 'Full', desc: 'Complete' },
                    ].map((layout, index) => (
                      <motion.button
                        key={layout.id}
                        onClick={() => setKeyboardConfig(prev => ({ ...prev, layout: layout.id as any }))}
                        className={`group relative h-24 rounded-xl border transition-all duration-300 overflow-hidden ${
                          keyboardConfig.layout === layout.id
                            ? 'bg-gradient-to-br from-purple-500/15 to-blue-500/15 border-purple-400/60 shadow-lg shadow-purple-500/25'
                            : 'bg-slate-800/30 border-slate-600/40 hover:bg-slate-700/40 hover:border-slate-500/50'
                        }`}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ 
                          duration: 0.5, 
                          delay: 1.4 + index * 0.1,
                          hover: { type: "spring", stiffness: 400, damping: 25 }
                        }}
                      >
                        {/* Gradient overlay on selection */}
                        {keyboardConfig.layout === layout.id && (
                          <motion.div
                            className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-blue-500/10"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.3 }}
                          />
                        )}
                        
                        <div className="relative z-10 h-full flex flex-col items-center justify-center">
                          <div className="text-base font-semibold text-white mb-1" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                            {layout.name}
                      </div>
                          <div className="text-xs text-gray-400 font-normal">
                            {layout.desc}
                    </div>
                  </div>
                  
                        {/* Selection indicator with bounce */}
                        {keyboardConfig.layout === layout.id && (
                          <motion.div
                            className="absolute top-3 right-3 w-2 h-2 bg-purple-400 rounded-full"
                            initial={{ scale: 0 }}
                            animate={{ scale: [0, 1.3, 1] }}
                            transition={{ duration: 0.4, delay: 0.1 }}
                          />
                        )}
                      </motion.button>
                  ))}
                </div>
              </div>
              </motion.div>

                                          {/* Switch Type - Glassmorphic Section */}
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 1.4 }}
                className="relative"
              >
                {/* Glass container */}
                <div className="bg-slate-900/20 backdrop-blur-sm border border-slate-700/30 rounded-2xl p-8">
                                    <motion.h2 
                    className="text-xl font-bold text-white/90 mb-8 text-left tracking-tight"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.6 }}
                    style={{
                      fontFamily: 'system-ui, -apple-system, sans-serif',
                      fontWeight: 700,
                      letterSpacing: '-0.01em'
                    }}
                  >
                    Switch Type
                  </motion.h2>
                  
                  <div className="grid grid-cols-3 gap-4">
                    {[
                      { id: 'linear', name: 'Linear', desc: 'Smooth feel', accent: 'blue' },
                      { id: 'tactile', name: 'Tactile', desc: 'Tactile bump', accent: 'purple' },
                      { id: 'clicky', name: 'Clicky', desc: 'Audible click', accent: 'green' },
                    ].map((switch_, index) => {
                      const isSelected = keyboardConfig.switches === switch_.id;
                      const accentColors = {
                        blue: isSelected ? 'from-blue-500/15 to-cyan-500/15 border-blue-400/60 shadow-blue-500/25' : 'hover:border-blue-600/50',
                        purple: isSelected ? 'from-purple-500/15 to-pink-500/15 border-purple-400/60 shadow-purple-500/25' : 'hover:border-purple-600/50',
                        green: isSelected ? 'from-green-500/15 to-emerald-500/15 border-green-400/60 shadow-green-500/25' : 'hover:border-green-600/50'
                      };
                      
                      return (
                        <motion.button
                          key={switch_.id}
                          onClick={() => setKeyboardConfig(prev => ({ ...prev, switches: switch_.id as any }))}
                          className={`group relative h-24 rounded-xl border transition-all duration-300 overflow-hidden ${
                            isSelected
                              ? `bg-gradient-to-br ${accentColors[switch_.accent as keyof typeof accentColors]} shadow-lg`
                              : `bg-slate-800/30 border-slate-600/40 hover:bg-slate-700/40 hover:border-slate-500/50 ${accentColors[switch_.accent as keyof typeof accentColors]}`
                          }`}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ 
                            duration: 0.5, 
                            delay: 1.8 + index * 0.1,
                            hover: { type: "spring", stiffness: 400, damping: 25 }
                          }}
                        >
                          {/* Gradient overlay on selection */}
                          {isSelected && (
                            <motion.div
                              className={`absolute inset-0 bg-gradient-to-r ${
                                switch_.accent === 'blue' ? 'from-blue-500/10 to-cyan-500/10' :
                                switch_.accent === 'purple' ? 'from-purple-500/10 to-pink-500/10' :
                                'from-green-500/10 to-emerald-500/10'
                              }`}
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ duration: 0.3 }}
                            />
                          )}
                          
                          <div className="relative z-10 h-full flex flex-col items-center justify-center">
                            <div className="text-base font-semibold text-white mb-1" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                              {switch_.name}
                    </div>
                            <div className="text-xs text-gray-400 font-normal">
                              {switch_.desc}
                    </div>
                  </div>

                          {/* Selection indicator with bounce */}
                          {isSelected && (
                            <motion.div
                              className={`absolute top-3 right-3 w-2 h-2 rounded-full ${
                                switch_.accent === 'blue' ? 'bg-blue-400' :
                                switch_.accent === 'purple' ? 'bg-purple-400' :
                                'bg-green-400'
                              }`}
                              initial={{ scale: 0 }}
                              animate={{ scale: [0, 1.3, 1] }}
                              transition={{ duration: 0.4, delay: 0.1 }}
                            />
                          )}
                        </motion.button>
                      );
                    })}
                </div>
            </div>
              </motion.div>

                                          {/* Case Material - Glassmorphic Section */}
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 1.8 }}
                className="relative"
              >
                {/* Glass container */}
                <div className="bg-slate-900/20 backdrop-blur-sm border border-slate-700/30 rounded-2xl p-8">
                                    <motion.h2 
                    className="text-xl font-bold text-white/90 mb-8 text-left tracking-tight"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 2 }}
                    style={{
                      fontFamily: 'system-ui, -apple-system, sans-serif',
                      fontWeight: 700,
                      letterSpacing: '-0.01em'
                    }}
                  >
                    Case Material
                  </motion.h2>
                  
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { id: 'aluminum', name: 'Aluminum', desc: 'Premium metal', accent: 'slate' },
                      { id: 'plastic', name: 'Plastic', desc: 'Lightweight', accent: 'indigo' },
                      { id: 'wood', name: 'Wood', desc: 'Natural finish', accent: 'amber' },
                      { id: 'carbon', name: 'Carbon Fiber', desc: 'Ultra premium', accent: 'red' },
                    ].map((material, index) => {
                      const isSelected = keyboardConfig.case === material.id;
                      const accentColors = {
                        slate: isSelected ? 'from-slate-500/15 to-gray-500/15 border-slate-400/60 shadow-slate-500/25' : 'hover:border-slate-600/50',
                        indigo: isSelected ? 'from-indigo-500/15 to-purple-500/15 border-indigo-400/60 shadow-indigo-500/25' : 'hover:border-indigo-600/50',
                        amber: isSelected ? 'from-amber-500/15 to-orange-500/15 border-amber-400/60 shadow-amber-500/25' : 'hover:border-amber-600/50',
                        red: isSelected ? 'from-red-500/15 to-pink-500/15 border-red-400/60 shadow-red-500/25' : 'hover:border-red-600/50'
                      };
                      
                      return (
                        <motion.button
                          key={material.id}
                          onClick={() => setKeyboardConfig(prev => ({ ...prev, case: material.id as any }))}
                          className={`group relative h-24 rounded-xl border transition-all duration-300 overflow-hidden ${
                            isSelected
                              ? `bg-gradient-to-br ${accentColors[material.accent as keyof typeof accentColors]} shadow-lg`
                              : `bg-slate-800/30 border-slate-600/40 hover:bg-slate-700/40 hover:border-slate-500/50 ${accentColors[material.accent as keyof typeof accentColors]}`
                          }`}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ 
                            duration: 0.5, 
                            delay: 2.2 + index * 0.1,
                            hover: { type: "spring", stiffness: 400, damping: 25 }
                          }}
                        >
                          {/* Gradient overlay on selection */}
                          {isSelected && (
                            <motion.div
                              className={`absolute inset-0 bg-gradient-to-r ${
                                material.accent === 'slate' ? 'from-slate-500/10 to-gray-500/10' :
                                material.accent === 'indigo' ? 'from-indigo-500/10 to-purple-500/10' :
                                material.accent === 'amber' ? 'from-amber-500/10 to-orange-500/10' :
                                'from-red-500/10 to-pink-500/10'
                              }`}
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ duration: 0.3 }}
                            />
                          )}
                          
                          <div className="relative z-10 h-full flex flex-col items-center justify-center">
                            <div className="text-base font-semibold text-white mb-1" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                              {material.name}
                  </div>
                            <div className="text-xs text-gray-400 font-normal">
                              {material.desc}
              </div>
            </div>
                          
                          {/* Selection indicator with bounce */}
                          {isSelected && (
                            <motion.div
                              className={`absolute top-3 right-3 w-2 h-2 rounded-full ${
                                material.accent === 'slate' ? 'bg-slate-400' :
                                material.accent === 'indigo' ? 'bg-indigo-400' :
                                material.accent === 'amber' ? 'bg-amber-400' :
                                'bg-red-400'
                              }`}
                              initial={{ scale: 0 }}
                              animate={{ scale: [0, 1.3, 1] }}
                              transition={{ duration: 0.4, delay: 0.1 }}
                            />
                          )}
                        </motion.button>
                      );
                    })}
          </div>
                </div>
              </motion.div>
            </div>
          </div>

          {/* INSANE Premium Continue Button */}
          <motion.div 
            className="mt-12 max-w-md mx-auto w-full"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 2.4, ease: "easeOut" }}
          >
            <motion.div 
              className="relative p-px rounded-2xl bg-gradient-to-r from-purple-600/60 via-blue-500/80 to-purple-600/60"
              animate={{
                background: [
                  "linear-gradient(90deg, rgba(147,51,234,0.6), rgba(59,130,246,0.9), rgba(147,51,234,0.6))",
                  "linear-gradient(180deg, rgba(59,130,246,0.9), rgba(147,51,234,0.8), rgba(59,130,246,0.9))",
                  "linear-gradient(270deg, rgba(147,51,234,0.8), rgba(59,130,246,0.6), rgba(147,51,234,0.8))",
                  "linear-gradient(360deg, rgba(59,130,246,0.6), rgba(147,51,234,0.9), rgba(59,130,246,0.6))"
                ]
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <motion.button
                onClick={() => navigateToPage('builder')}
                className="relative bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white font-bold py-4 px-12 text-lg rounded-2xl w-full backdrop-blur-sm"
                whileHover={{ 
                  scale: 1.02,
                  boxShadow: "0 25px 50px rgba(147, 51, 234, 0.4)"
                }}
                whileTap={{ scale: 0.98 }}
                transition={{ 
                  type: "spring", 
                  stiffness: 400, 
                  damping: 25
                }}
                style={{
                  fontFamily: 'system-ui, -apple-system, sans-serif',
                  fontWeight: 700,
                  letterSpacing: '0.02em'
                }}
              >
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                  animate={{
                    x: [-400, 400]
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                    repeatDelay: 1
                  }}
                />
                <span className="relative z-10">CREATE MY KEYBOARD</span>
              </motion.button>
            </motion.div>
          </motion.div>
        </div>
      </div>
    )
  }

  // Builder Page - Clean Minimalistic Design
  if (currentPage === 'builder') {
    return (
    <div className={`min-h-screen bg-secondary ${isTransitioning ? 'page-exit' : 'page-enter'}`}>
      <div className="section-padding max-w-4xl mx-auto">
          {/* Header */}
        <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <button
              onClick={() => navigateToPage('preferences')}
              className="minimal-button p-3 hover:scale-110 active:scale-95 transition-transform duration-200"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div>
              <h1 className="text-heading text-primary">Your Keyboard</h1>
              <p className="text-body text-secondary">Based on your preferences</p>
            </div>
          </div>

              <button
            onClick={() => setIsCartOpen(true)}
            className="minimal-button p-3"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13h10m-5 5a1 1 0 100 2 1 1 0 000-2zm5 0a1 1 0 100 2 1 1 0 000-2z" />
                </svg>
              </button>
              </div>

        {/* 3D KeySim Viewer */}
        <div className="mb-8 h-80 minimal-card relative overflow-hidden animate-scale-in">
          <div className="absolute inset-0 bg-gradient-light-blue opacity-8"></div>
            <RealKeysim
              layout="80"
              caseColor={keyboardConfig.case_color}
              keycapColor={keyboardConfig.keycap_color}
              switchColor={keyboardConfig.switch_color}
            />
            
            {/* Touch to rotate hint */}
          <div className="absolute bottom-4 left-4 text-xs text-muted">
              Drag to rotate • Pinch to zoom
            </div>
          </div>

          {/* Component Details */}
          <div className="space-y-4 mb-8 animate-slide-up">
            <div className="grid grid-cols-3 gap-4">
              {/* Keycaps - Clickable */}
                  <button
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  console.log('Keycaps button clicked!')
                  setSelectedComponent('keycaps')
                }}
                onTouchStart={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  console.log('Keycaps button touched!')
                  setSelectedComponent('keycaps')
                }}
                className="minimal-card p-4 text-left group cursor-pointer"
              >
                <div className="flex items-center space-x-2 mb-2">
                  <div className="w-3 h-3 bg-gradient-sky-blue rounded-sm"></div>
                  <h3 className="text-body font-medium text-primary">Keycaps</h3>
                  <svg className="w-3 h-3 text-muted ml-auto opacity-0 group-hover:opacity-100 transition-all duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
                {selectedProducts.keycaps ? (
                  <>
                    <p className="text-xs text-primary font-medium">{selectedProducts.keycaps.title}</p>
                    <p className="text-xs text-secondary mt-1">${(() => {
                      const product = selectedProducts.keycaps
                      return product.priceRange?.minVariantPrice?.amount ||
                             product.priceRange?.min?.amount ||
                             product.variants?.[0]?.priceV2?.amount ||
                             product.variants?.[0]?.price ||
                             product.price?.amount ||
                             product.price ||
                             'N/A'
                    })()}</p>
                  </>
                ) : (
                  <>
                    <p className="text-xs text-secondary">{keyboardConfig.keycaps.toUpperCase()} Profile</p>
                    <p className="text-xs text-muted mt-1">Click to shop</p>
                  </>
                )}
                  </button>
              
              {/* Switches - Clickable */}
              <button 
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  console.log('Switches button clicked!')
                  setSelectedComponent('switches')
                }}
                onTouchStart={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  console.log('Switches button touched!')
                  setSelectedComponent('switches')
                }}
                className="minimal-card p-4 text-left group cursor-pointer"
              >
                <div className="flex items-center space-x-2 mb-2">
                  <div className="w-3 h-3 bg-gradient-ocean-blue rounded-full"></div>
                  <h3 className="text-body font-medium text-primary">Switches</h3>
                  <svg className="w-3 h-3 text-muted ml-auto opacity-0 group-hover:opacity-100 transition-all duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
              </div>
                {selectedProducts.switches ? (
                  <>
                    <p className="text-xs text-primary font-medium">{selectedProducts.switches.title}</p>
                    <p className="text-xs text-secondary mt-1">${(() => {
                      const product = selectedProducts.switches
                      return product.priceRange?.minVariantPrice?.amount ||
                             product.priceRange?.min?.amount ||
                             product.variants?.[0]?.priceV2?.amount ||
                             product.variants?.[0]?.price ||
                             product.price?.amount ||
                             product.price ||
                             'N/A'
                    })()}</p>
                  </>
                ) : (
                  <>
                    <p className="text-xs text-secondary">{keyboardConfig.switches} Type</p>
                    <p className="text-xs text-muted mt-1">Click to shop</p>
                  </>
                )}
              </button>
              
              {/* Case - Clickable */}
                  <button
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  console.log('Case button clicked!')
                  setSelectedComponent('case')
                }}
                onTouchStart={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  console.log('Case button touched!')
                  setSelectedComponent('case')
                }}
                className="minimal-card p-4 text-left group cursor-pointer"
              >
                <div className="flex items-center space-x-2 mb-2">
                  <div className="w-3 h-3 bg-dark-tertiary rounded-sm"></div>
                  <h3 className="text-body font-medium text-primary">Case</h3>
                  <svg className="w-3 h-3 text-muted ml-auto opacity-0 group-hover:opacity-100 transition-all duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
                {selectedProducts.case ? (
                  <>
                    <p className="text-xs text-primary font-medium">{selectedProducts.case.title}</p>
                    <p className="text-xs text-secondary mt-1">${(() => {
                      const product = selectedProducts.case
                      return product.priceRange?.minVariantPrice?.amount ||
                             product.priceRange?.min?.amount ||
                             product.variants?.[0]?.priceV2?.amount ||
                             product.variants?.[0]?.price ||
                             product.price?.amount ||
                             product.price ||
                             'N/A'
                    })()}</p>
                  </>
                ) : (
                  <>
                    <p className="text-xs text-secondary">{keyboardConfig.case} Material</p>
                    <p className="text-xs text-muted mt-1">Click to shop</p>
                  </>
                )}
                  </button>
              </div>
            </div>

          {/* Fixed Bottom Actions */}
          <div className="fixed bottom-0 left-0 right-0 bg-primary border-t border-light p-4">
            <div className="flex space-x-3 max-w-4xl mx-auto">
                  <button
                onClick={() => navigateToPage('customizer')}
                className="minimal-button py-3 px-6 hover:scale-105 active:scale-95 transition-transform duration-200"
              >
                Customize Colors
                  </button>
              <button
                onClick={() => setIsCartOpen(true)}
                className="flex-1 bg-gradient-deep-blue text-white font-medium py-3 px-6 rounded-xl hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-200 relative overflow-hidden"
              >
                <span className="relative z-10">Add to Cart - ${calculateCartTotal().toFixed(2)}</span>
                <div className="absolute inset-0 bg-gradient-ocean-blue opacity-0 hover:opacity-100 transition-opacity duration-200"></div>
              </button>
            </div>
              </div>
            </div>

        {/* Component Search Modal */}
        <ComponentSearchModal
          isOpen={selectedComponent !== null}
          onClose={() => setSelectedComponent(null)}
          componentType={selectedComponent}
          currentConfig={keyboardConfig}
          onProductSelect={handleProductSelect}
          selectedProduct={selectedComponent ? selectedProducts[selectedComponent] : null}
        />

        {/* Clean Cart Summary Modal */}
        {isCartOpen && (
          <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="minimal-card w-full max-w-md overflow-hidden animate-scale-in">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-light">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-sky-blue rounded-xl flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.1 5H17M9 19.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM20 19.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                    </svg>
                  </div>
            <div>
                    <h2 className="text-heading text-primary">Cart Summary</h2>
                    <p className="text-body text-secondary">Your keyboard build</p>
                  </div>
                </div>
                  <button
                  onClick={() => setIsCartOpen(false)}
                  className="minimal-button p-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  </button>
              </div>

              {/* Cart Items */}
              <div className="p-6 space-y-4">
                {selectedProducts.keycaps && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-dark-tertiary rounded-sm"></div>
                      <span className="text-primary text-sm">Keycaps</span>
            </div>
                    <span className="text-dark font-medium text-sm">
                      ${(() => {
                        const price = selectedProducts.keycaps.priceRange?.minVariantPrice?.amount ||
                                     selectedProducts.keycaps.priceRange?.min?.amount ||
                                     selectedProducts.keycaps.variants?.[0]?.priceV2?.amount ||
                                     selectedProducts.keycaps.variants?.[0]?.price ||
                                     selectedProducts.keycaps.price?.amount ||
                                     selectedProducts.keycaps.price
                        return price ? parseFloat(price).toFixed(2) : '0.00'
                      })()}
                    </span>
          </div>
                )}
                
                {selectedProducts.switches && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-dark-secondary rounded-full"></div>
                      <span className="text-primary text-sm">Switches</span>
                    </div>
                    <span className="text-dark font-medium text-sm">
                      ${(() => {
                        const price = selectedProducts.switches.priceRange?.minVariantPrice?.amount ||
                                     selectedProducts.switches.priceRange?.min?.amount ||
                                     selectedProducts.switches.variants?.[0]?.priceV2?.amount ||
                                     selectedProducts.switches.variants?.[0]?.price ||
                                     selectedProducts.switches.price?.amount ||
                                     selectedProducts.switches.price
                        return price ? parseFloat(price).toFixed(2) : '0.00'
                      })()}
                    </span>
                  </div>
                )}
                
                {selectedProducts.case && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-dark-tertiary rounded-sm"></div>
                      <span className="text-primary text-sm">Case</span>
                    </div>
                    <span className="text-dark font-medium text-sm">
                      ${(() => {
                        const price = selectedProducts.case.priceRange?.minVariantPrice?.amount ||
                                     selectedProducts.case.priceRange?.min?.amount ||
                                     selectedProducts.case.variants?.[0]?.priceV2?.amount ||
                                     selectedProducts.case.variants?.[0]?.price ||
                                     selectedProducts.case.price?.amount ||
                                     selectedProducts.case.price
                        return price ? parseFloat(price).toFixed(2) : '0.00'
                      })()}
                    </span>
                  </div>
                )}

                {/* Totals */}
                <div className="border-t border-light pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-secondary">Subtotal</span>
                    <span className="text-primary">${calculateCartTotal().toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-secondary">Tax (8%)</span>
                    <span className="text-primary">${(calculateCartTotal() * 0.08).toFixed(2)}</span>
                  </div>
                  <div className="border-t border-medium pt-2 flex justify-between">
                    <span className="text-primary font-semibold">Total</span>
                    <span className="text-primary font-semibold text-lg">${(calculateCartTotal() * 1.08).toFixed(2)}</span>
                  </div>
                </div>

                {/* Checkout Button */}
                <button className="bg-gradient-deep-blue text-white font-medium w-full py-4 px-6 rounded-xl hover:shadow-xl hover:shadow-blue-500/20 transition-all duration-300 relative overflow-hidden">
                  <span className="relative z-10">Proceed to Checkout</span>
                  <div className="absolute inset-0 bg-gradient-ocean-blue opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
              </button>
            </div>
          </div>
        </div>
        )}
      </div>
    )
  }

  // Color Customizer Page
  if (currentPage === 'customizer') {
    const colorOptions = [
      { name: 'Grey', value: '#6b7280' },
      { name: 'Black', value: '#1f2937' },
      { name: 'White', value: '#f3f4f6' },
      { name: 'Blue', value: '#3b82f6' },
      { name: 'Red', value: '#ef4444' },
      { name: 'Green', value: '#10b981' },
      { name: 'Purple', value: '#8b5cf6' },
      { name: 'Orange', value: '#f97316' },
      { name: 'Pink', value: '#ec4899' },
      { name: 'Cyan', value: '#06b6d4' },
    ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-slate-950 to-zinc-950">
      <div className="pt-4 px-4 pb-24">
        {/* Header */}
          <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <button
                onClick={() => setCurrentPage('builder')}
              className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-700/50 text-slate-300 hover:text-white hover:bg-slate-900/80 transition-all duration-200"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div>
                <h1 className="text-xl font-semibold text-white">Customize Colors</h1>
                <p className="text-slate-400 text-sm">Make it uniquely yours</p>
            </div>
          </div>
        </div>

          {/* 3D KeySim Preview */}
          <div className="mb-6 h-64 rounded-2xl bg-gradient-to-br from-slate-900/60 to-slate-800/60 border border-slate-700/50 backdrop-blur-sm relative overflow-hidden">
            <KeysimViewer
              layout="80"
              caseColor={keyboardConfig.case_color}
              keycapColor={keyboardConfig.keycap_color}
              switchColor={keyboardConfig.switch_color}
            />
          </div>
          
          {/* Color Customization */}
          <div className="space-y-6">
            {/* Case Color */}
            <div>
              <h3 className="text-white font-medium mb-3">Case Color</h3>
              <div className="grid grid-cols-5 gap-3">
                {colorOptions.map((color) => (
                  <button
                    key={`case-${color.value}`}
                    onClick={() => setKeyboardConfig(prev => ({ ...prev, case_color: color.value }))}
                    className={`aspect-square rounded-xl border-2 transition-all duration-200 ${
                      keyboardConfig.case_color === color.value
                        ? 'border-white scale-110'
                        : 'border-slate-600 hover:border-slate-400 hover:scale-105'
                    }`}
                    style={{ backgroundColor: color.value }}
                  >
                    <span className="sr-only">{color.name}</span>
                  </button>
                ))}
          </div>
        </div>

            {/* Keycap Color */}
            <div>
              <h3 className="text-white font-medium mb-3">Keycap Color</h3>
              <div className="grid grid-cols-5 gap-3">
                {colorOptions.map((color) => (
                  <button
                    key={`keycap-${color.value}`}
                    onClick={() => setKeyboardConfig(prev => ({ ...prev, keycap_color: color.value }))}
                    className={`aspect-square rounded-xl border-2 transition-all duration-200 ${
                      keyboardConfig.keycap_color === color.value
                        ? 'border-white scale-110'
                        : 'border-slate-600 hover:border-slate-400 hover:scale-105'
                    }`}
                    style={{ backgroundColor: color.value }}
                  >
                    <span className="sr-only">{color.name}</span>
                  </button>
                ))}
              </div>
            </div>
            
            {/* Switch Color */}
            <div>
              <h3 className="text-white font-medium mb-3">Switch Color</h3>
              <div className="grid grid-cols-5 gap-3">
                {colorOptions.map((color) => (
                  <button
                    key={`switch-${color.value}`}
                    onClick={() => setKeyboardConfig(prev => ({ ...prev, switch_color: color.value }))}
                    className={`aspect-square rounded-xl border-2 transition-all duration-200 ${
                      keyboardConfig.switch_color === color.value
                        ? 'border-white scale-110'
                        : 'border-slate-600 hover:border-slate-400 hover:scale-105'
                    }`}
                    style={{ backgroundColor: color.value }}
                  >
                    <span className="sr-only">{color.name}</span>
                  </button>
                ))}
              </div>
          </div>
        </div>

        {/* Fixed Bottom Actions */}
        <div className="fixed bottom-0 left-0 right-0 bg-slate-950/90 backdrop-blur-sm border-t border-slate-800/50 p-4">
          <div className="flex space-x-3">
              <button 
                onClick={() => setCurrentPage('builder')}
                className="flex-1 bg-slate-900/60 border border-slate-700/50 text-slate-300 font-medium py-3 px-4 rounded-xl hover:bg-slate-900/80 transition-all duration-200"
              >
                Back
            </button>
            <button className="flex-1 bg-white text-slate-950 font-medium py-3 px-4 rounded-xl hover:shadow-lg transition-all duration-200">
              Add to Cart - $399
            </button>
          </div>
        </div>
      </div>
    </div>
  )
  }

  // This should never be reached, but just in case
  return null
}