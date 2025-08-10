import { useState, useEffect, Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { Keyboard3D } from './components/Keyboard3D'

// Types for our keyboard configuration
interface KeyboardConfig {
  layout: 'ansi' | 'iso' | '60' | '65' | 'tkl' | 'full'
  switches: 'linear' | 'tactile' | 'clicky'
  keycaps: 'cherry' | 'oem' | 'sa' | 'xda'
  case: 'aluminum' | 'plastic' | 'wood' | 'carbon'
  plate: 'steel' | 'aluminum' | 'brass' | 'pc'
  stabilizers: 'cherry' | 'durock' | 'zeal'
}

type AppPage = 'welcome' | 'preferences' | 'builder'

export function App() {
  const [currentPage, setCurrentPage] = useState<AppPage>('welcome')
  const [keyboardConfig, setKeyboardConfig] = useState<KeyboardConfig>({
    layout: 'tkl',
    switches: 'tactile',
    keycaps: 'cherry',
    case: 'aluminum',
    plate: 'aluminum',
    stabilizers: 'durock'
  })
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    // Trigger animations after component mounts
    const timer = setTimeout(() => setIsLoaded(true), 100)
    return () => clearTimeout(timer)
  }, [])

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

  // Test: return simple div instead of complex pages
  return (
    <div className="min-h-screen bg-red-500 flex items-center justify-center">
      <div className="text-white text-2xl">
        Simple Test - Current Page: {currentPage}
      </div>
    </div>
  )
}