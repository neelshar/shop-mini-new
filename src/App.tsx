import { useState, useEffect } from 'react'
import { RealKeysim } from './components/RealKeysim'
import { ComponentSearchModal } from './components/ComponentSearchModal'

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

type AppPage = 'welcome' | 'preferences' | 'builder' | 'customizer'



export function App() {
  const [currentPage, setCurrentPage] = useState<AppPage>('welcome')
  const [keyboardConfig, setKeyboardConfig] = useState<KeyboardConfig>({
    layout: 'tkl',
    switches: 'tactile',
    keycaps: 'cherry',
    case: 'aluminum',
    plate: 'aluminum',
    stabilizers: 'durock',
    case_color: '#eeeeee', // Clean white case like original KeySim
    keycap_color: '#4a90e2', // Beautiful blue to match keycap textures
    switch_color: '#ffa726' // Default tactile orange
  })
  const [isLoaded, setIsLoaded] = useState(false)
  
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

  // Welcome/Landing Page with INSANE animations
  if (currentPage === 'welcome') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-slate-950 to-zinc-950 overflow-hidden">
        {/* Animated background particles */}
        <div className="absolute inset-0">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className={`absolute w-1 h-1 bg-slate-400/20 rounded-full animate-pulse transform transition-all duration-[3000ms] ${
                isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
              }`}
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${i * 150}ms`,
                animationDuration: `${3000 + i * 200}ms`
              }}
            />
          ))}
        </div>

        <div className="relative">
          {/* Gradient overlay with animation */}
          <div className={`absolute inset-0 bg-gradient-to-b from-transparent via-slate-950/30 to-slate-950/60 transition-opacity duration-1000 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          }`} />
          
          <div className="relative pt-16 px-6 pb-12">
            {/* Spinning Keycap Logo - HERO ANIMATION */}
            <div className="text-center mb-16">
              <div className={`relative inline-block mb-8 transform transition-all duration-1000 ${
                isLoaded ? 'opacity-100 translate-y-0 rotate-0 scale-100' : 'opacity-0 translate-y-20 rotate-180 scale-50'
              } animate-float`}>
                {/* 3D Keycap with K letter */}
                <div className="relative w-24 h-24 mx-auto">
                  {/* Outer glow ring */}
                  <div className="absolute -inset-6 bg-gradient-to-r from-blue-500/30 via-purple-500/30 to-cyan-500/30 rounded-full blur-2xl animate-spin-slow" />
                  <div className="absolute -inset-4 bg-gradient-to-r from-purple-500/40 via-blue-500/40 to-violet-500/40 rounded-full blur-xl animate-glow-pulse" />
                  
                  {/* Keycap base with enhanced 3D effect */}
                  <div className="absolute inset-0 bg-gradient-to-br from-slate-600 via-slate-700 to-slate-900 rounded-2xl border border-slate-500/60 shadow-2xl transform rotate-12">
                    <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-black/20 rounded-2xl" />
                  </div>
                  <div className="absolute inset-1 bg-gradient-to-br from-slate-500 via-slate-600 to-slate-800 rounded-xl border border-slate-400/40">
                    <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-black/30 rounded-xl" />
                  </div>
                  
                  {/* Keycap top surface */}
                  <div className="absolute inset-2 bg-gradient-to-br from-slate-400 via-slate-500 to-slate-700 rounded-lg border border-slate-300/50 shadow-inner">
                    <div className="absolute inset-0 bg-gradient-to-br from-white/30 via-white/10 to-transparent rounded-lg" />
                  </div>
                  
                  {/* Epic spinning K letter with multiple effects */}
                  <div className={`absolute inset-0 flex items-center justify-center transform transition-transform duration-2000 ${
                    isLoaded ? 'rotate-[1080deg]' : 'rotate-0'
                  }`}>
                    <div className="relative">
                      {/* Letter shadow */}
                      <span className="absolute inset-0 text-3xl font-black text-black/50 blur-sm transform translate-x-0.5 translate-y-0.5">
                        K
                      </span>
                      {/* Main letter with gradient */}
                      <span className="relative text-3xl font-black bg-gradient-to-br from-white via-blue-200 to-purple-200 bg-clip-text text-transparent filter drop-shadow-lg">
                        K
                      </span>
                      {/* Highlight effect */}
                      <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-transparent to-transparent text-3xl font-black bg-clip-text text-transparent animate-pulse">
                        K
                      </div>
                    </div>
                  </div>
                  
                  {/* Enhanced glow effects */}
                  <div className="absolute -inset-3 bg-gradient-to-r from-cyan-500/20 via-blue-500/20 to-purple-500/20 rounded-3xl blur-lg animate-pulse" />
                  <div className="absolute -inset-1 bg-gradient-to-r from-blue-400/40 to-purple-400/40 rounded-2xl blur-md animate-glow-pulse" />
                  
                  {/* Particle effects */}
                  {[...Array(8)].map((_, i) => (
                    <div
                      key={i}
                      className="absolute w-1 h-1 bg-blue-400 rounded-full animate-ping"
                      style={{
                        top: `${20 + Math.sin(i * 0.785) * 15}%`,
                        left: `${50 + Math.cos(i * 0.785) * 15}%`,
                        animationDelay: `${i * 200}ms`,
                        animationDuration: '2s'
                      }}
                    />
                  ))}
                </div>
              </div>
              
              {/* Animated title with staggered reveal */}
              <div className="overflow-hidden">
                <h1 className={`text-5xl font-light text-white mb-4 tracking-tight transform transition-all duration-1000 delay-300 ${
                  isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
                }`}>
                  Custom
                  <span className={`block font-semibold bg-gradient-to-r from-slate-200 via-white to-slate-300 bg-clip-text text-transparent transform transition-all duration-1000 delay-500 ${
                    isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
                  }`}>
                    Keyboards
                  </span>
                </h1>
              </div>
              
              <p className={`text-slate-400 text-lg font-light max-w-sm mx-auto leading-relaxed transform transition-all duration-1000 delay-700 ${
                isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}>
                Design, visualize, and perfect your ideal mechanical keyboard experience
              </p>
            </div>

            {/* Feature Cards with staggered floating animation */}
            <div className="grid grid-cols-1 gap-4 mb-12 max-w-sm mx-auto">
              {[
                {
                  icon: <div className="w-5 h-3 bg-blue-400 rounded-sm opacity-80 animate-pulse" />,
                  gradient: "from-blue-500/20 to-blue-600/20 border-blue-500/30",
                  title: "3D Visualization",
                  desc: "Real-time rendering of every component and customization",
                  delay: "delay-[900ms]"
                },
                {
                  icon: <div className="w-4 h-4 rounded-full bg-emerald-400 opacity-80 animate-pulse" />,
                  gradient: "from-emerald-500/20 to-emerald-600/20 border-emerald-500/30",
                  title: "Authentic Sound",
                  desc: "Experience realistic switch sounds and typing feedback",
                  delay: "delay-[1100ms]"
                },
                {
                  icon: (
                    <div className="grid grid-cols-2 gap-0.5 w-4 h-4">
                      <div className="bg-violet-400 rounded-sm opacity-80 animate-pulse" />
                      <div className="bg-violet-400 rounded-sm opacity-60 animate-pulse" />
                      <div className="bg-violet-400 rounded-sm opacity-60 animate-pulse" />
                      <div className="bg-violet-400 rounded-sm opacity-80 animate-pulse" />
                    </div>
                  ),
                  gradient: "from-violet-500/20 to-violet-600/20 border-violet-500/30",
                  title: "Premium Components",
                  desc: "Choose from curated switches, keycaps, and materials",
                  delay: "delay-[1300ms]"
                }
              ].map((feature, index) => (
                <div
                  key={index}
                  className={`group p-6 rounded-2xl bg-slate-900/40 border border-slate-800/50 backdrop-blur-sm transition-all duration-700 hover:bg-slate-900/60 hover:scale-105 hover:-translate-y-1 hover:shadow-2xl transform ${feature.delay} ${
                    isLoaded ? 'opacity-100 translate-y-0 rotate-0' : `opacity-0 translate-y-12 rotate-${index * 2 + 1}`
                  }`}
                >
                  <div className="flex items-start space-x-4">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12`}>
                      {feature.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-white text-sm mb-1 transition-colors duration-300 group-hover:text-blue-300">{feature.title}</h3>
                      <p className="text-slate-400 text-xs leading-relaxed transition-colors duration-300 group-hover:text-slate-300">{feature.desc}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Primary CTA with epic entrance */}
            <div className={`space-y-4 max-w-sm mx-auto transform transition-all duration-1000 delay-[1500ms] ${
              isLoaded ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-8 scale-95'
            }`}>
              <button
                onClick={() => setCurrentPage('preferences')}
                className="relative w-full bg-white text-slate-950 font-medium py-4 px-6 rounded-2xl shadow-lg shadow-white/10 hover:shadow-white/30 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] overflow-hidden group"
              >
                {/* Animated background effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-out" />
                <span className="relative z-10">Start Building</span>
              </button>
            </div>

            {/* Trust Indicators with gentle float-in */}
            <div className={`mt-12 pt-8 border-t border-slate-800/50 transform transition-all duration-1000 delay-[1700ms] ${
              isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}>
              <div className="flex items-center justify-center space-x-8 text-xs text-slate-500">
                {[
                  { color: "bg-emerald-400", text: "Free Shipping" },
                  { color: "bg-blue-400", text: "30-Day Returns" },
                  { color: "bg-violet-400", text: "2-Year Warranty" }
                ].map((item, index) => (
                  <div key={index} className="flex items-center space-x-2 transition-all duration-300 hover:text-slate-300">
                    <div className={`w-1.5 h-1.5 ${item.color} rounded-full animate-pulse`} style={{ animationDelay: `${index * 200}ms` }} />
                    <span>{item.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Preferences Page - No 3D Preview, Just Preference Selection
  if (currentPage === 'preferences') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-slate-950 to-zinc-950">
        <div className="pt-4 px-4 pb-24">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setCurrentPage('welcome')}
                className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-700/50 text-slate-300 hover:text-white hover:bg-slate-900/80 transition-all duration-200"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div>
                <h1 className="text-xl font-semibold text-white">Preferences</h1>
                <p className="text-slate-400 text-sm">Tell us your preferences for personalized recommendations</p>
              </div>
            </div>
          </div>

          {/* Configuration Sections */}
          <div className="space-y-6">
            {/* Layout Selection */}
            <div>
              <h2 className="text-lg font-medium text-white mb-4">Preferred Layout</h2>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: 'tkl', name: 'TKL', desc: '87 keys' },
                  { id: '60', name: '60%', desc: '61 keys' },
                  { id: 'full', name: 'Full', desc: '104 keys' },
                ].map((layout) => (
                  <button
                    key={layout.id}
                    onClick={() => setKeyboardConfig(prev => ({ ...prev, layout: layout.id as any }))}
                    className={`p-4 rounded-xl border transition-all duration-200 ${
                      keyboardConfig.layout === layout.id
                        ? 'bg-white/10 border-white/30 text-white'
                        : 'bg-slate-900/40 border-slate-700/50 text-slate-300 hover:bg-slate-900/60 hover:border-slate-600/50'
                    }`}
                  >
                    <div className="font-medium text-sm mb-1">{layout.name}</div>
                    <div className="text-xs opacity-70">{layout.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Switch Type */}
            <div>
              <h2 className="text-lg font-medium text-white mb-4">Switch Type Preference</h2>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: 'linear', name: 'Linear', desc: 'Smooth & Fast', color: 'from-red-500/30 to-red-600/30 border-red-500/40' },
                  { id: 'tactile', name: 'Tactile', desc: 'Bumpy Feel', color: 'from-amber-500/30 to-amber-600/30 border-amber-500/40' },
                  { id: 'clicky', name: 'Clicky', desc: 'Audible Click', color: 'from-blue-500/30 to-blue-600/30 border-blue-500/40' },
                ].map((switch_) => (
                  <button
                    key={switch_.id}
                    onClick={() => setKeyboardConfig(prev => ({ ...prev, switches: switch_.id as any }))}
                    className={`p-4 rounded-xl border transition-all duration-200 ${
                      keyboardConfig.switches === switch_.id
                        ? `bg-gradient-to-br ${switch_.color} text-white`
                        : 'bg-slate-900/40 border-slate-700/50 text-slate-300 hover:bg-slate-900/60'
                    }`}
                  >
                    <div className="font-medium text-sm mb-1">{switch_.name}</div>
                    <div className="text-xs opacity-70">{switch_.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Case Material */}
            <div>
              <h2 className="text-lg font-medium text-white mb-4">Case Material Preference</h2>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { id: 'aluminum', name: 'Aluminum', desc: 'Premium & Durable' },
                  { id: 'plastic', name: 'Plastic', desc: 'Lightweight' },
                  { id: 'wood', name: 'Wood', desc: 'Natural & Warm' },
                  { id: 'carbon', name: 'Carbon Fiber', desc: 'Ultra Premium' },
                ].map((material) => (
                  <button
                    key={material.id}
                    onClick={() => setKeyboardConfig(prev => ({ ...prev, case: material.id as any }))}
                    className={`p-4 rounded-xl border transition-all duration-200 text-left ${
                      keyboardConfig.case === material.id
                        ? 'bg-white/10 border-white/30 text-white'
                        : 'bg-slate-900/40 border-slate-700/50 text-slate-300 hover:bg-slate-900/60'
                    }`}
                  >
                    <div className="font-medium text-sm mb-1">{material.name}</div>
                    <div className="text-xs opacity-70">{material.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Keycap Profile */}
            <div>
              <h2 className="text-lg font-medium text-white mb-4">Keycap Profile</h2>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { id: 'cherry', name: 'Cherry', desc: 'Low profile, comfortable' },
                  { id: 'oem', name: 'OEM', desc: 'Standard height' },
                  { id: 'sa', name: 'SA', desc: 'High profile, sculpted' },
                  { id: 'xda', name: 'XDA', desc: 'Uniform, flat' },
                ].map((profile) => (
                  <button
                    key={profile.id}
                    onClick={() => setKeyboardConfig(prev => ({ ...prev, keycaps: profile.id as any }))}
                    className={`p-4 rounded-xl border transition-all duration-200 text-left ${
                      keyboardConfig.keycaps === profile.id
                        ? 'bg-white/10 border-white/30 text-white'
                        : 'bg-slate-900/40 border-slate-700/50 text-slate-300 hover:bg-slate-900/60'
                    }`}
                  >
                    <div className="font-medium text-sm mb-1">{profile.name}</div>
                    <div className="text-xs opacity-70">{profile.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Fixed Bottom Actions */}
          <div className="fixed bottom-0 left-0 right-0 bg-slate-950/90 backdrop-blur-sm border-t border-slate-800/50 p-4">
            <div className="flex space-x-3">
              <button 
                onClick={() => setCurrentPage('welcome')}
                className="flex-1 bg-slate-900/60 border border-slate-700/50 text-slate-300 font-medium py-3 px-4 rounded-xl hover:bg-slate-900/80 transition-all duration-200"
              >
                Back
              </button>
              <button 
                onClick={() => setCurrentPage('builder')}
                className="flex-1 bg-white text-slate-950 font-medium py-3 px-4 rounded-xl hover:shadow-lg transition-all duration-200"
              >
                See Recommendations
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Builder Page - Shows 3D Keyboard with Basic Config
  if (currentPage === 'builder') {
  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-slate-950 to-zinc-950">
      <div className="pt-4 px-4 pb-24">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setCurrentPage('preferences')}
              className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-700/50 text-slate-300 hover:text-white hover:bg-slate-900/80 transition-all duration-200"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div>
                <h1 className="text-xl font-semibold text-white">Your Keyboard</h1>
                <p className="text-slate-400 text-sm">Based on your preferences</p>
            </div>
          </div>
          
          <button className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-700/50 text-slate-300 hover:text-white hover:bg-slate-900/80 transition-all duration-200">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13h10m-5 5a1 1 0 100 2 1 1 0 000-2zm5 0a1 1 0 100 2 1 1 0 000-2z" />
            </svg>
          </button>
        </div>

          {/* 3D KeySim Viewer - REAL from GitHub */}
          <div className="mb-8 h-80 rounded-2xl bg-gradient-to-br from-slate-900/60 to-slate-800/60 border border-slate-700/50 backdrop-blur-sm relative overflow-hidden">
            <RealKeysim
              layout="80"
              caseColor={keyboardConfig.case_color}
              keycapColor={keyboardConfig.keycap_color}
              switchColor={keyboardConfig.switch_color}
            />
            
            {/* Touch to rotate hint */}
            <div className="absolute bottom-4 left-4 text-slate-400 text-xs">
              Drag to rotate • Pinch to zoom
            </div>
          </div>

          {/* Component Details */}
          <div className="space-y-4 mb-32 relative z-20">
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
                className="bg-slate-900/40 border border-slate-700/50 rounded-xl p-4 hover:bg-slate-900/60 hover:border-blue-500/50 transition-all duration-200 text-left group cursor-pointer relative z-30 touch-manipulation"
              >
                <div className="flex items-center space-x-2 mb-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full group-hover:scale-110 transition-transform"></div>
                  <h3 className="text-white font-medium text-sm group-hover:text-blue-300 transition-colors">Keycaps</h3>
                  <svg className="w-3 h-3 text-slate-500 group-hover:text-blue-400 ml-auto opacity-0 group-hover:opacity-100 transition-all duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
                {selectedProducts.keycaps ? (
                  <>
                    <p className="text-slate-300 text-xs font-medium group-hover:text-white transition-colors">{selectedProducts.keycaps.title}</p>
                    <p className="text-green-400 text-xs mt-1">${(() => {
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
                    <p className="text-slate-400 text-xs group-hover:text-slate-300 transition-colors">{keyboardConfig.keycaps.toUpperCase()} Profile</p>
                    <p className="text-slate-500 text-xs mt-1 group-hover:text-blue-400/70 transition-colors">Click to shop</p>
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
                className="bg-slate-900/40 border border-slate-700/50 rounded-xl p-4 hover:bg-slate-900/60 hover:border-amber-500/50 transition-all duration-200 text-left group cursor-pointer relative z-30 touch-manipulation"
              >
                <div className="flex items-center space-x-2 mb-2">
                  <div className="w-3 h-3 bg-amber-500 rounded-full group-hover:scale-110 transition-transform"></div>
                  <h3 className="text-white font-medium text-sm group-hover:text-amber-300 transition-colors">Switches</h3>
                  <svg className="w-3 h-3 text-slate-500 group-hover:text-amber-400 ml-auto opacity-0 group-hover:opacity-100 transition-all duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
                {selectedProducts.switches ? (
                  <>
                    <p className="text-slate-300 text-xs font-medium group-hover:text-white transition-colors">{selectedProducts.switches.title}</p>
                    <p className="text-green-400 text-xs mt-1">${(() => {
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
                    <p className="text-slate-400 text-xs group-hover:text-slate-300 transition-colors">{keyboardConfig.switches} Type</p>
                    <p className="text-slate-500 text-xs mt-1 group-hover:text-amber-400/70 transition-colors">Click to shop</p>
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
                className="bg-slate-900/40 border border-slate-700/50 rounded-xl p-4 hover:bg-slate-900/60 hover:border-slate-400/50 transition-all duration-200 text-left group cursor-pointer relative z-30 touch-manipulation"
              >
                <div className="flex items-center space-x-2 mb-2">
                  <div className="w-3 h-3 bg-slate-500 rounded-full group-hover:scale-110 transition-transform"></div>
                  <h3 className="text-white font-medium text-sm group-hover:text-slate-300 transition-colors">Case</h3>
                  <svg className="w-3 h-3 text-slate-500 group-hover:text-slate-400 ml-auto opacity-0 group-hover:opacity-100 transition-all duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
                {selectedProducts.case ? (
                  <>
                    <p className="text-slate-300 text-xs font-medium group-hover:text-white transition-colors">{selectedProducts.case.title}</p>
                    <p className="text-green-400 text-xs mt-1">${(() => {
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
                    <p className="text-slate-400 text-xs group-hover:text-slate-300 transition-colors">{keyboardConfig.case} Material</p>
                    <p className="text-slate-500 text-xs mt-1 group-hover:text-slate-400/70 transition-colors">Click to shop</p>
                  </>
                )}
              </button>
            </div>
          </div>
          
          {/* Fixed Bottom Actions */}
          <div className="fixed bottom-0 left-0 right-0 bg-slate-950/90 backdrop-blur-sm border-t border-slate-800/50 p-4">
            <div className="flex space-x-3">
              <button 
                onClick={() => setCurrentPage('customizer')}
                className="flex-1 bg-slate-900/60 border border-slate-700/50 text-slate-300 font-medium py-3 px-4 rounded-xl hover:bg-slate-900/80 transition-all duration-200"
              >
                Customize Colors
              </button>
              <button
                onClick={() => setIsCartOpen(true)}
                className="bg-slate-900/60 border border-slate-700/50 text-slate-300 font-medium py-3 px-4 rounded-xl hover:bg-slate-900/80 transition-all duration-200 flex items-center space-x-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.1 5H17M9 19.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM20 19.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                </svg>
                <span>Cart</span>
              </button>
              <button className="flex-1 bg-white text-slate-950 font-medium py-3 px-4 rounded-xl hover:shadow-lg transition-all duration-200">
                Add to Cart - ${calculateCartTotal().toFixed(2)}
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

        {/* Simple Cart Summary Modal */}
        {isCartOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-slate-950 w-full max-w-md rounded-2xl border border-slate-800/50 overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-slate-800/50">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.1 5H17M9 19.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM20 19.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-white font-semibold text-lg">Cart Summary</h2>
                    <p className="text-slate-400 text-sm">Your keyboard build</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="w-8 h-8 bg-slate-800/50 hover:bg-slate-700/50 rounded-lg flex items-center justify-center transition-all duration-200"
                >
                  <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Cart Items */}
              <div className="p-6 space-y-4">
                {selectedProducts.keycaps && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <span className="text-white text-sm">Keycaps</span>
                    </div>
                    <span className="text-green-400 font-medium text-sm">
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
                      <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
                      <span className="text-white text-sm">Switches</span>
                    </div>
                    <span className="text-green-400 font-medium text-sm">
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
                      <div className="w-3 h-3 bg-slate-500 rounded-full"></div>
                      <span className="text-white text-sm">Case</span>
                    </div>
                    <span className="text-green-400 font-medium text-sm">
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
                <div className="border-t border-slate-700/50 pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Subtotal</span>
                    <span className="text-white">${calculateCartTotal().toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Tax (8%)</span>
                    <span className="text-white">${(calculateCartTotal() * 0.08).toFixed(2)}</span>
                  </div>
                  <div className="border-t border-slate-700/50 pt-2 flex justify-between">
                    <span className="text-white font-semibold">Total</span>
                    <span className="text-white font-semibold text-lg">${(calculateCartTotal() * 1.08).toFixed(2)}</span>
                  </div>
                </div>

                {/* Checkout Button */}
                <button className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 hover:shadow-lg hover:shadow-blue-500/25 active:scale-95">
                  Proceed to Checkout
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