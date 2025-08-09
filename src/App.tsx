import { useState } from 'react'

// Types for our keyboard configuration
interface KeyboardConfig {
  layout: 'ansi' | 'iso' | '60' | '65' | 'tkl' | 'full'
  switches: 'linear' | 'tactile' | 'clicky'
  keycaps: 'cherry' | 'oem' | 'sa' | 'xda'
  case: 'aluminum' | 'plastic' | 'wood' | 'carbon'
  plate: 'steel' | 'aluminum' | 'brass' | 'pc'
  stabilizers: 'cherry' | 'durock' | 'zeal'
}

type AppPage = 'welcome' | 'builder'

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

  // Welcome/Landing Page
  if (currentPage === 'welcome') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-slate-950 to-zinc-950">
        <div className="relative overflow-hidden">
          {/* Subtle gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-950/30 to-slate-950/60" />
          
          <div className="relative pt-16 px-6 pb-12">
            {/* Hero Section */}
            <div className="text-center mb-16">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700/50 mb-8">
                <div className="w-8 h-6 bg-gradient-to-r from-slate-400 to-slate-300 rounded-sm" />
              </div>
              
              <h1 className="text-5xl font-light text-white mb-4 tracking-tight">
                Custom
                <span className="block font-semibold bg-gradient-to-r from-slate-200 via-white to-slate-300 bg-clip-text text-transparent">
                  Keyboards
                </span>
              </h1>
              
              <p className="text-slate-400 text-lg font-light max-w-sm mx-auto leading-relaxed">
                Design, visualize, and perfect your ideal mechanical keyboard experience
              </p>
            </div>

            {/* Feature Cards */}
            <div className="grid grid-cols-1 gap-4 mb-12 max-w-sm mx-auto">
              <div className="group p-6 rounded-2xl bg-slate-900/40 border border-slate-800/50 backdrop-blur-sm transition-all duration-300 hover:bg-slate-900/60">
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-600/20 border border-blue-500/30 flex items-center justify-center">
                    <div className="w-5 h-3 bg-blue-400 rounded-sm opacity-80" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-white text-sm mb-1">3D Visualization</h3>
                    <p className="text-slate-400 text-xs leading-relaxed">Real-time rendering of every component and customization</p>
                  </div>
                </div>
              </div>

              <div className="group p-6 rounded-2xl bg-slate-900/40 border border-slate-800/50 backdrop-blur-sm transition-all duration-300 hover:bg-slate-900/60">
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 border border-emerald-500/30 flex items-center justify-center">
                    <div className="w-4 h-4 rounded-full bg-emerald-400 opacity-80" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-white text-sm mb-1">Authentic Sound</h3>
                    <p className="text-slate-400 text-xs leading-relaxed">Experience realistic switch sounds and typing feedback</p>
                  </div>
                </div>
              </div>

              <div className="group p-6 rounded-2xl bg-slate-900/40 border border-slate-800/50 backdrop-blur-sm transition-all duration-300 hover:bg-slate-900/60">
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500/20 to-violet-600/20 border border-violet-500/30 flex items-center justify-center">
                    <div className="grid grid-cols-2 gap-0.5 w-4 h-4">
                      <div className="bg-violet-400 rounded-sm opacity-80" />
                      <div className="bg-violet-400 rounded-sm opacity-60" />
                      <div className="bg-violet-400 rounded-sm opacity-60" />
                      <div className="bg-violet-400 rounded-sm opacity-80" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-white text-sm mb-1">Premium Components</h3>
                    <p className="text-slate-400 text-xs leading-relaxed">Choose from curated switches, keycaps, and materials</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Primary CTA */}
            <div className="space-y-4 max-w-sm mx-auto">
              <button
                onClick={() => setCurrentPage('builder')}
                className="w-full bg-white text-slate-950 font-medium py-4 px-6 rounded-2xl shadow-lg shadow-white/10 hover:shadow-white/20 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
              >
                Start Building
              </button>
            </div>

            {/* Trust Indicators */}
            <div className="mt-12 pt-8 border-t border-slate-800/50">
              <div className="flex items-center justify-center space-x-8 text-xs text-slate-500">
                <div className="flex items-center space-x-2">
                  <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
                  <span>Free Shipping</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-1.5 h-1.5 bg-blue-400 rounded-full" />
                  <span>30-Day Returns</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-1.5 h-1.5 bg-violet-400 rounded-full" />
                  <span>2-Year Warranty</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Keyboard Builder Page
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
              <h1 className="text-xl font-semibold text-white">Keyboard Builder</h1>
              <p className="text-slate-400 text-sm">Design your perfect keyboard</p>
            </div>
          </div>
          
          <button className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-700/50 text-slate-300 hover:text-white hover:bg-slate-900/80 transition-all duration-200">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13h10m-5 5a1 1 0 100 2 1 1 0 000-2zm5 0a1 1 0 100 2 1 1 0 000-2z" />
            </svg>
          </button>
        </div>

        {/* 3D Visualization Area - Placeholder for Keysim integration */}
        <div className="mb-8 h-64 rounded-2xl bg-gradient-to-br from-slate-900/60 to-slate-800/60 border border-slate-700/50 backdrop-blur-sm flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-12 bg-gradient-to-r from-slate-600 to-slate-500 rounded-lg mx-auto mb-4 shadow-lg" />
            <p className="text-slate-400 text-sm font-medium">3D Keyboard Preview</p>
            <p className="text-slate-500 text-xs mt-1">Keysim integration will render here</p>
          </div>
        </div>

        {/* Configuration Sections */}
        <div className="space-y-6">
          {/* Layout Selection */}
          <div>
            <h2 className="text-lg font-medium text-white mb-4">Layout</h2>
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
            <h2 className="text-lg font-medium text-white mb-4">Switch Type</h2>
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
            <h2 className="text-lg font-medium text-white mb-4">Case Material</h2>
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
        </div>

        {/* Fixed Bottom Actions */}
        <div className="fixed bottom-0 left-0 right-0 bg-slate-950/90 backdrop-blur-sm border-t border-slate-800/50 p-4">
          <div className="flex space-x-3">
            <button className="flex-1 bg-slate-900/60 border border-slate-700/50 text-slate-300 font-medium py-3 px-4 rounded-xl hover:bg-slate-900/80 transition-all duration-200">
              Save Configuration
            </button>
            <button className="flex-1 bg-white text-slate-950 font-medium py-3 px-4 rounded-xl hover:shadow-lg transition-all duration-200">
              Add to Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}