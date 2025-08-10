import { useState, useEffect, useRef } from 'react'

// iOS Audio Context singleton
let audioContext: AudioContext | null = null
let isAudioUnlocked = false

const unlockAudioContext = async (): Promise<boolean> => {
  if (isAudioUnlocked) return true
  
  try {
    if (!audioContext) {
      // @ts-ignore
      const AudioContextClass = window.AudioContext || window.webkitAudioContext
      audioContext = new AudioContextClass()
    }
    
    if (audioContext.state === 'suspended') {
      await audioContext.resume()
    }
    
    // Create a short silent buffer to unlock audio
    const buffer = audioContext.createBuffer(1, 1, 22050)
    const source = audioContext.createBufferSource()
    source.buffer = buffer
    source.connect(audioContext.destination)
    source.start(0)
    
    isAudioUnlocked = true
    console.log('Audio context unlocked successfully')
    return true
  } catch (error) {
    console.error('Failed to unlock audio context:', error)
    return false
  }
}

interface SoundPack {
  id: string
  name: string
  type: 'multi_press' | 'single_sprite' | 'multi_press_release'
  path: string
  config: any
  description?: string
  author?: string
  tags?: string[]
}

interface KeyboardSoundBrowserProps {
  isOpen: boolean
  onClose: () => void
  onSelectSoundPack?: (soundPack: SoundPack) => void
}

export function KeyboardSoundBrowser({ isOpen, onClose, onSelectSoundPack }: KeyboardSoundBrowserProps) {
  const [soundPacks, setSoundPacks] = useState<SoundPack[]>([])
  const [selectedPack, setSelectedPack] = useState<SoundPack | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // Discover all sound packs from the public directory
  const discoverSoundPacks = async (): Promise<SoundPack[]> => {
    const packs: SoundPack[] = []

    // Multi-press sound packs
    const multiPressPacks = [
      'banana split lubed',
      'mx-speed-silver', 
      'steelseries apex pro tkl',
      'tealios-v2_Akira'
    ]

    // Single sprite packs
    const singleSpritePacks = [
      'cherrymx-black-pbt',
      'cherrymx-blue-pbt',
      'cherrymx-brown-pbt', 
      'cherrymx-red-pbt',
      'topre-purple-hybrid-pbt'
    ]

    // Multi-press with release packs
    const multiPressReleasePacks = [
      'holy-pandas'
    ]

    // Load multi-press configs
    for (const pack of multiPressPacks) {
      try {
        const response = await fetch(`/kbd_sounds_formatted/multi_press/${pack}/config.json`)
        if (response.ok) {
          const config = await response.json()
          packs.push({
            id: config.id || pack,
            name: config.name || pack,
            type: 'multi_press',
            path: `/kbd_sounds_formatted/multi_press/${pack}`,
            config,
            description: config.description,
            author: config.m_author,
            tags: config.tags
          })
        }
      } catch (error) {
        console.warn(`Failed to load config for ${pack}:`, error)
      }
    }

    // Load single sprite configs
    for (const pack of singleSpritePacks) {
      try {
        const response = await fetch(`/kbd_sounds_formatted/single_sprite/${pack}/config.json`)
        if (response.ok) {
          const config = await response.json()
          packs.push({
            id: config.id || pack,
            name: config.name || pack,
            type: 'single_sprite',
            path: `/kbd_sounds_formatted/single_sprite/${pack}`,
            config,
            tags: config.tags
          })
        }
      } catch (error) {
        console.warn(`Failed to load config for ${pack}:`, error)
      }
    }

    // Load multi-press release configs
    for (const pack of multiPressReleasePacks) {
      try {
        const response = await fetch(`/kbd_sounds_formatted/multi_press_release/${pack}/config.json`)
        if (response.ok) {
          const config = await response.json()
          packs.push({
            id: config.id || pack,
            name: config.name || pack,
            type: 'multi_press_release',
            path: `/kbd_sounds_formatted/multi_press_release/${pack}`,
            config
          })
        }
      } catch (error) {
        console.warn(`Failed to load config for ${pack}:`, error)
      }
    }

    return packs
  }

  useEffect(() => {
    if (isOpen) {
      setLoading(true)
      discoverSoundPacks().then(packs => {
        setSoundPacks(packs)
        setLoading(false)
      })
    }
  }, [isOpen])

  const playSound = async (soundPack: SoundPack, soundFile?: string) => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current = null
    }

    // First, unlock audio context on iOS
    const unlocked = await unlockAudioContext()
    if (!unlocked) {
      alert('❌ Could not initialize audio on this device. Please try again or use a different browser.')
      return
    }

    let audioUrl = ''
    
    // Determine iOS compatibility and choose appropriate audio format
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
    const isSafari = /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent)
    
    if (soundPack.type === 'multi_press') {
      const soundToPlay = soundFile || soundPack.config.sound
      audioUrl = `${soundPack.path}/${soundToPlay}`
    } else if (soundPack.type === 'single_sprite') {
      // iOS doesn't support OGG - skip single sprite for now on iOS
      if (isIOS || isSafari) {
        alert('📱 iOS/Safari Note:\n\nThis sound pack uses OGG format which isn\'t supported on iOS.\nTry the "Holy Pandas" pack instead - it uses MP3 format!')
        setCurrentlyPlaying(null)
        return
      }
      audioUrl = `${soundPack.path}/sound.ogg`
    } else if (soundPack.type === 'multi_press_release') {
      // Use MP3 format - iOS compatible
      const soundToPlay = soundFile || 'GENERIC_R0.mp3'
      audioUrl = `${soundPack.path}/${soundToPlay}`
    }

    setCurrentlyPlaying(soundPack.id)

    try {
      console.log('🎵 Playing sound:', audioUrl)
      console.log('🔍 Device info:', { isIOS, isSafari })
      
      // Use the simplest possible approach that works on iOS
      const audio = new Audio()
      
      // iOS-optimized settings
      audio.volume = 0.5
      audio.preload = 'none' // Better for iOS
      audio.muted = false
      
      // Essential iOS properties
      if ('playsInline' in audio) {
        (audio as any).playsInline = true
      }
      
      // Enhanced cleanup
      const cleanup = () => {
        setCurrentlyPlaying(null)
        audioRef.current = null
      }
      
      audio.addEventListener('ended', cleanup)
      audio.addEventListener('loadstart', () => {
        console.log('📡 Audio loading started')
      })
      audio.addEventListener('canplay', () => {
        console.log('✅ Audio can play')
      })
      audio.addEventListener('error', (e) => {
        console.error('❌ Audio error event:', e)
        const audioError = audio.error
        if (audioError) {
          console.error('❌ Audio error details:', {
            code: audioError.code,
            message: audioError.message
          })
        }
        cleanup()
      })
      
      // Set source
      audio.src = audioUrl
      audioRef.current = audio
      
      // For iOS, we need to load first
      if (isIOS || isSafari) {
        audio.load()
        // Small delay for iOS
        await new Promise(resolve => setTimeout(resolve, 100))
      }
      
      // Play with error handling
      const playPromise = audio.play()
      if (playPromise !== undefined) {
        await playPromise
        console.log('✅ Audio playing successfully')
      }
      
    } catch (error) {
      console.error('❌ Playback failed:', error)
      setCurrentlyPlaying(null)
      audioRef.current = null
      
      // Enhanced error messages
      if (isIOS) {
        alert(`📱 iOS Audio Failed:\n\n🔇 Check Silent Mode: Flip the side switch on your iPhone\n🔊 Check Volume: Turn up your device volume\n🔄 Try: Refresh the page and try again\n📱 Note: Only MP3/WAV files work on iOS\n\nTechnical: ${error.message}`)
      } else if (isSafari) {
        alert(`🦁 Safari Audio Failed:\n\n⚙️ Safari Settings → Websites → Auto-Play → Allow\n🔄 Refresh the page\n📱 Note: Try MP3 audio packs instead\n\nTechnical: ${error.message}`)
      } else {
        alert(`❌ Audio Failed:\n\n🌐 Try Chrome or Firefox\n🔊 Check browser audio permissions\n🔄 Refresh the page\n\nTechnical: ${error.message}`)
      }
    }
  }

  const stopSound = () => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
    }
    setCurrentlyPlaying(null)
  }

  const getSoundTypeIcon = (type: string) => {
    switch (type) {
      case 'multi_press': return '🎵'
      case 'single_sprite': return '🎶'
      case 'multi_press_release': return '🎹'
      default: return '🔊'
    }
  }

  const getSoundTypeDescription = (type: string) => {
    switch (type) {
      case 'multi_press': return 'Multiple sound variations'
      case 'single_sprite': return 'Single audio file with timing'
      case 'multi_press_release': return 'Press + release sounds'
      default: return 'Unknown format'
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end">
      <div className="w-full bg-slate-950 rounded-t-3xl border-t border-slate-700/50 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-800/50">
          <div>
            <h2 className="text-xl font-semibold text-white">
              🎧 Keyboard Sound Browser
            </h2>
            <p className="text-slate-400 text-sm">
              Test all available switch sounds • {soundPacks.length} sound packs
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-700/50 text-slate-300 hover:text-white hover:bg-slate-900/80 transition-all duration-200"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-slate-300 text-sm">Discovering sound packs...</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Audio Unlock Section for iOS */}
              <div className="bg-blue-900/20 border border-blue-600/30 rounded-xl p-4 mb-6">
                <h3 className="text-blue-300 font-medium mb-3 flex items-center space-x-2">
                  <span>🔓</span>
                  <span>iOS Audio Setup</span>
                </h3>
                <p className="text-blue-200 text-xs mb-3">
                  iOS requires user interaction before audio can play. Tap this button first!
                </p>
                <button
                  onClick={async () => {
                    try {
                      const unlocked = await unlockAudioContext()
                      if (unlocked) {
                        alert('✅ Audio unlocked! Now you can play keyboard sounds. Make sure your device is not in silent mode.')
                      } else {
                        alert('❌ Failed to unlock audio. Make sure your device is not in silent mode and volume is up.')
                      }
                    } catch (error) {
                      alert('❌ Audio unlock failed. Please refresh the page and try again.')
                    }
                  }}
                  className="bg-blue-600/20 border border-blue-500/40 text-blue-300 px-4 py-2 rounded-lg text-sm hover:bg-blue-600/30 transition-all duration-200 mr-3"
                >
                  🔓 Unlock Audio for iOS
                </button>
                <span className="text-blue-400 text-xs">
                  {isAudioUnlocked ? '✅ Audio Ready' : '⏳ Tap to unlock'}
                </span>
              </div>

              {/* Audio Test Section */}
              <div className="bg-yellow-900/20 border border-yellow-600/30 rounded-xl p-4 mb-6">
                <h3 className="text-yellow-300 font-medium mb-3 flex items-center space-x-2">
                  <span>🔧</span>
                  <span>Audio Test</span>
                </h3>
                <p className="text-yellow-200 text-xs mb-3">
                  After unlocking audio above, test that sounds work. Make sure device is not in silent mode.
                </p>
                <button
                  onClick={async () => {
                    try {
                      // Use iOS-compatible MP3 format for testing
                      const testPack: SoundPack = {
                        id: 'test-pack',
                        name: 'iOS Audio Test',
                        type: 'multi_press_release',
                        path: '/kbd_sounds_formatted/multi_press_release/holy-pandas',
                        config: { sound: 'GENERIC_R0.mp3' }
                      }
                      
                      // Use our iOS-friendly playSound method
                      await playSound(testPack)
                      
                      // Show success message after a short delay
                      setTimeout(() => {
                        alert('✅ Audio test successful! You should hear a Holy Pandas keyboard sound.')
                        setCurrentlyPlaying(null) // Reset state
                      }, 500)
                      
                    } catch (error) {
                      console.error('Audio test failed:', error)
                      
                      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
                      const isSafari = /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent)
                      
                      let errorMsg = `❌ Audio test failed: ${error.message}\n\n`
                      
                      if (isIOS) {
                        errorMsg += '📱 iOS Device:\n• Flip the silent switch (side of device)\n• Turn up volume with buttons\n• Ensure audio isn\'t muted\n• Try refreshing the page'
                      } else if (isSafari) {
                        errorMsg += '🦁 Safari Browser:\n• Go to Safari → Preferences → Websites → Auto-Play\n• Set to "Allow All Auto-Play"\n• Refresh the page and try again'
                      } else {
                        errorMsg += 'Try:\n• Using Chrome or Firefox instead\n• Checking browser audio settings\n• Clicking elsewhere on page first'
                      }
                      
                      alert(errorMsg)
                    }
                  }}
                  className="bg-yellow-600/20 border border-yellow-500/40 text-yellow-300 px-4 py-2 rounded-lg text-sm hover:bg-yellow-600/30 transition-all duration-200"
                >
                  🔊 Test Audio (iOS MP3 Format)
                </button>
              </div>

              {/* Sound pack categories */}
              {['multi_press', 'single_sprite', 'multi_press_release'].map(type => {
                const packsOfType = soundPacks.filter(pack => pack.type === type)
                if (packsOfType.length === 0) return null

                return (
                  <div key={type} className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{getSoundTypeIcon(type)}</span>
                      <div>
                        <h3 className="text-white font-medium capitalize">
                          {type.replace('_', ' ')} Sounds
                        </h3>
                        <p className="text-slate-400 text-xs">
                          {getSoundTypeDescription(type)}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-3">
                      {packsOfType.map((pack) => (
                        <div
                          key={pack.id}
                          className={`bg-slate-900/40 border rounded-xl p-4 transition-all duration-200 ${
                            selectedPack?.id === pack.id
                              ? 'border-blue-500/50 bg-blue-500/10'
                              : 'border-slate-700/50 hover:bg-slate-900/60 hover:border-slate-600/50'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center space-x-3 mb-2">
                                <h4 className="font-medium text-white text-sm truncate">
                                  {pack.name}
                                </h4>
                                {pack.author && (
                                  <span className="text-slate-500 text-xs">
                                    by {pack.author}
                                  </span>
                                )}
                              </div>
                              
                              {pack.description && (
                                <p className="text-slate-400 text-xs mb-2 line-clamp-2">
                                  {pack.description}
                                </p>
                              )}

                              {pack.tags && pack.tags.length > 0 && (
                                <div className="flex space-x-1 mb-2">
                                  {pack.tags.map((tag, index) => (
                                    <span
                                      key={index}
                                      className="px-2 py-1 bg-slate-800/60 text-slate-300 text-xs rounded"
                                    >
                                      {tag}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>

                            <div className="flex items-center space-x-2 ml-4">
                              {/* Play/Stop button */}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  if (currentlyPlaying === pack.id) {
                                    stopSound()
                                  } else {
                                    playSound(pack)
                                  }
                                }}
                                className={`p-2 rounded-lg transition-all duration-200 ${
                                  currentlyPlaying === pack.id
                                    ? 'bg-red-500/20 border border-red-400/40 text-red-400 hover:bg-red-500/30'
                                    : 'bg-green-500/20 border border-green-400/40 text-green-400 hover:bg-green-500/30'
                                }`}
                              >
                                {currentlyPlaying === pack.id ? (
                                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                  </svg>
                                ) : (
                                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                                  </svg>
                                )}
                              </button>

                              {/* Select button */}
                              <button
                                onClick={() => {
                                  setSelectedPack(pack)
                                  if (onSelectSoundPack) {
                                    onSelectSoundPack(pack)
                                  }
                                }}
                                className={`px-3 py-1.5 text-xs rounded-lg transition-all duration-200 ${
                                  selectedPack?.id === pack.id
                                    ? 'bg-blue-500/20 border border-blue-400/40 text-blue-400'
                                    : 'bg-slate-800/60 border border-slate-600/40 text-slate-300 hover:bg-slate-800/80'
                                }`}
                              >
                                {selectedPack?.id === pack.id ? 'Selected' : 'Select'}
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-800/50 bg-slate-950/80">
          <div className="flex space-x-3">
            <button 
              onClick={onClose}
              className="flex-1 bg-slate-900/60 border border-slate-700/50 text-slate-300 font-medium py-3 px-4 rounded-xl hover:bg-slate-900/80 transition-all duration-200"
            >
              Close
            </button>
            {selectedPack && (
              <button 
                onClick={() => {
                  if (onSelectSoundPack && selectedPack) {
                    onSelectSoundPack(selectedPack)
                  }
                  onClose()
                }}
                className="flex-1 bg-blue-600 text-white font-medium py-3 px-4 rounded-xl hover:bg-blue-700 transition-all duration-200"
              >
                Use "{selectedPack.name}"
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
