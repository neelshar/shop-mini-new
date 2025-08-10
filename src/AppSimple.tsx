import { useState } from 'react'

export function AppSimple() {
  const [currentPage, setCurrentPage] = useState('welcome')

  if (currentPage === 'welcome') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-slate-950 to-zinc-950">
        <div className="pt-8 px-4 pb-8">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-white mb-4">
              🎹 Keyboard Shop Mini
            </h1>
            <p className="text-slate-400 text-lg">
              Build Your Perfect Mechanical Keyboard
            </p>
          </div>

          {/* Quick Test Buttons */}
          <div className="space-y-4 max-w-md mx-auto">
            <button 
              onClick={() => setCurrentPage('sound-test')}
              className="w-full bg-blue-600/20 border border-blue-500/40 text-blue-300 font-medium py-4 px-6 rounded-xl hover:bg-blue-600/30 transition-all duration-200"
            >
              🔊 Test Sounds
            </button>
            
            <button 
              onClick={() => setCurrentPage('preferences')}
              className="w-full bg-green-600/20 border border-green-500/40 text-green-300 font-medium py-4 px-6 rounded-xl hover:bg-green-600/30 transition-all duration-200"
            >
              ⚙️ Preferences
            </button>
            
            <button 
              onClick={() => setCurrentPage('builder')}
              className="w-full bg-purple-600/20 border border-purple-500/40 text-purple-300 font-medium py-4 px-6 rounded-xl hover:bg-purple-600/30 transition-all duration-200"
            >
              🛠️ 3D Builder (May Crash)
            </button>
          </div>

          {/* Status */}
          <div className="mt-8 text-center">
            <p className="text-slate-500 text-sm">
              ✅ Basic React app working
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (currentPage === 'sound-test') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-slate-950 to-zinc-950">
        <div className="pt-4 px-4 pb-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => setCurrentPage('welcome')}
              className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-700/50 text-slate-300 hover:text-white hover:bg-slate-900/80 transition-all duration-200"
            >
              ← Back
            </button>
            <h1 className="text-xl font-semibold text-white">Sound Test</h1>
            <div></div>
          </div>

          {/* Simple Audio Test */}
          <div className="bg-yellow-900/20 border border-yellow-600/30 rounded-xl p-6 mb-6">
            <h3 className="text-yellow-300 font-medium mb-3">🔊 Audio Test</h3>
            <p className="text-yellow-200 text-sm mb-4">
              Click to test if audio works on your device
            </p>
            <button
              onClick={() => {
                try {
                  const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEWCTGH1e/HdiYEO4Tm9MSKPwgaY73i7KdTJQULJw==')
                  audio.play().then(() => {
                    alert('✅ Audio test successful!')
                  }).catch((error) => {
                    alert('❌ Audio failed: ' + error.message)
                  })
                } catch (error) {
                  alert('❌ Audio error: ' + error.message)
                }
              }}
              className="bg-yellow-600/20 border border-yellow-500/40 text-yellow-300 px-4 py-2 rounded-lg hover:bg-yellow-600/30"
            >
              🔊 Test Simple Audio
            </button>
          </div>

          <div className="text-center text-slate-400 text-sm">
            Basic audio test page working ✅
          </div>
        </div>
      </div>
    )
  }

  if (currentPage === 'preferences') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-slate-950 to-zinc-950">
        <div className="pt-4 px-4 pb-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => setCurrentPage('welcome')}
              className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-700/50 text-slate-300 hover:text-white hover:bg-slate-900/80 transition-all duration-200"
            >
              ← Back
            </button>
            <h1 className="text-xl font-semibold text-white">Preferences</h1>
            <div></div>
          </div>

          <div className="space-y-4">
            <div className="bg-slate-900/40 border border-slate-700/50 rounded-xl p-4">
              <h3 className="text-white font-medium mb-2">Switch Type</h3>
              <div className="space-y-2">
                {['Linear', 'Tactile', 'Clicky'].map((type) => (
                  <button
                    key={type}
                    className="w-full text-left bg-slate-800/40 border border-slate-600/40 text-slate-300 p-3 rounded-lg hover:bg-slate-800/60"
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-8 text-center text-slate-400 text-sm">
            Preferences page working ✅
          </div>
        </div>
      </div>
    )
  }

  if (currentPage === 'builder') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-slate-950 to-zinc-950">
        <div className="pt-4 px-4 pb-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => setCurrentPage('welcome')}
              className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-700/50 text-slate-300 hover:text-white hover:bg-slate-900/80 transition-all duration-200"
            >
              ← Back
            </button>
            <h1 className="text-xl font-semibold text-white">3D Builder</h1>
            <div></div>
          </div>

          <div className="bg-red-900/20 border border-red-500/40 rounded-xl p-6 mb-6">
            <h3 className="text-red-300 font-medium mb-3">⚠️ 3D Builder Disabled</h3>
            <p className="text-red-200 text-sm mb-4">
              The 3D builder is temporarily disabled due to Canvas/Three.js errors.
              This prevents the white screen crash.
            </p>
            <div className="text-red-400 text-xs">
              Errors: Constructor requires 'new' operator, Canvas context issues
            </div>
          </div>

          <div className="text-center text-slate-400 text-sm">
            3D Builder page (safe mode) ✅
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <div className="text-white">Unknown page: {currentPage}</div>
    </div>
  )
}
