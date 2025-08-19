import { useState, useEffect } from 'react';

// Sound cache to prevent re-loading
const soundCache = new Map();

// Load sound profile from CDN
const loadSoundProfile = async (profileName: string) => {
  // Check cache first
  if (soundCache.has(profileName)) {
    return soundCache.get(profileName);
  }

  const CDN_BASE = import.meta.env.VITE_CDN_BASE_URL;
  if (!CDN_BASE) {
    return { generic: [] };
  }
  
  const fullUrl = `${CDN_BASE}/sound-components/${profileName}.ts`;
  
  try {
    const response = await fetch(fullUrl);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const tsContent = await response.text();
    
    // Extract the exported object from TypeScript content
    let match = tsContent.match(/export const [A-Z_]+ = (\{[\s\S]*?\n\})/);
    
    if (!match) {
      match = tsContent.match(/= (\{[\s\S]*?generic:\s*\[[\s\S]*?\][\s\S]*?\})/);
    }
    
    if (!match) {
      match = tsContent.match(/export const [A-Z_]+ = ([\s\S]*)/);
      if (match) {
        const objectMatch = match[1].match(/(\{[\s\S]*?\n\});?/);
        if (objectMatch) {
          match[1] = objectMatch[1];
        }
      }
    }
    
    if (match) {
      // Extract sound data using regex patterns instead of eval
      const genericMatch = match[1].match(/generic:\s*\[([\s\S]*?)\]/);
      let soundData = { generic: [] };
      
      if (genericMatch) {
        const soundMatches = genericMatch[1].match(/'data:audio\/[^']*'/g);
        if (soundMatches) {
          const soundStrings = soundMatches.map(s => s.slice(1, -1)); // Remove quotes
          soundData = {
            generic: soundStrings.map(data => ({ data }))
          };
        }
      }
      
      soundCache.set(profileName, soundData);
      return soundData;
    } else {
      throw new Error('No valid export pattern found in TypeScript file');
    }
  } catch (error) {
    // Return static fallback sounds from SOUND_PROFILES
    const profileConfig = SOUND_PROFILES[profileName as keyof typeof SOUND_PROFILES];
    const fallback = profileConfig?.sounds || { generic: [] };
    soundCache.set(profileName, fallback);
    return fallback;
  }
};

// Static sound profiles configuration
const SOUND_PROFILES = {
  'holy-pandas': {
    id: 'holy-pandas',
    name: 'Holy Pandas',
    description: 'Tactile switches with distinct "thock" sound',
    sounds: { 
      generic: []
    },
    hasSpecialKeys: true,
    color: 'purple',
    cdnFile: 'HolyPandasSounds'
  },
  'banana-split': {
    id: 'banana-split',
    name: 'Banana Split (Lubed)',
    description: 'Smooth, deep tactile switches',
    sounds: { 
      generic: []
    },
    hasSpecialKeys: false,
    color: 'yellow',
    cdnFile: 'BananaSplitSounds'
  },
  'cherrymx-blue-pbt': {
    id: 'cherrymx-blue-pbt',
    name: 'Cherry MX Blue PBT',
    description: 'Classic clicky switches with tactile bump and audible click',
    sounds: { 
      generic: []
    },
    hasSpecialKeys: false,
    color: 'blue',
    cdnFile: 'CherrymxBluePbtSounds'
  },
  'steelseries': {
    id: 'steelseries',
    name: 'SteelSeries Apex Pro TKL',
    description: 'Mechanical gaming switches with crisp actuation',
    sounds: { 
      generic: []
    },
    hasSpecialKeys: false,
    color: 'red',
    cdnFile: 'SteelSeriesSounds'
  },
  'tealios': {
    id: 'tealios',
    name: 'Tealios V2 on PBT',
    description: 'Premium linear switches with smooth keystrokes',
    sounds: { 
      generic: []
    },
    hasSpecialKeys: false,
    color: 'teal',
    cdnFile: 'TealiosSounds'
  },
  'gateron-yellows': {
    id: 'gateron-yellows',
    name: 'Gateron Yellows',
    description: 'Linear switches, smooth and fast',
    sounds: { 
      generic: []
    },
    hasSpecialKeys: false,
    color: 'yellow',
    cdnFile: 'GateronYellowSounds'
  },
  'cherrymx-brown-pbt': {
    id: 'cherrymx-brown-pbt',
    name: 'Cherry MX Brown PBT',
    description: 'Tactile switches with subtle bump',
    sounds: { 
      generic: []
    },
    hasSpecialKeys: false,
    color: 'brown',
    cdnFile: 'CherrymxBrownPbtSounds'
  },
  'cherrymx-red-pbt': {
    id: 'cherrymx-red-pbt',
    name: 'Cherry MX Red PBT',
    description: 'Linear switches for gaming',
    sounds: { 
      generic: []
    },
    hasSpecialKeys: false,
    color: 'red',
    cdnFile: 'CherrymxRedPbtSounds'
  },
  'mx-speed-silver': {
    id: 'mx-speed-silver',
    name: 'MX Speed Silver',
    description: 'Ultra-fast linear switches',
    sounds: { 
      generic: []
    },
    hasSpecialKeys: false,
    color: 'silver',
    cdnFile: 'MxSpeedSilverSounds'
  },
  'topre-purple-hybrid-pbt': {
    id: 'topre-purple-hybrid-pbt',
    name: 'Topre Purple Hybrid PBT',
    description: 'Electro-capacitive switches with unique feel',
    sounds: { 
      generic: []
    },
    hasSpecialKeys: false,
    color: 'purple',
    cdnFile: 'ToprePurpleHybridPbtSounds'
  }
};

interface MultiProfileKeyboardSoundsProps {
  compactMode?: boolean;
  enableAISelector?: boolean;
  externalProfile?: keyof typeof SOUND_PROFILES;
  onProfileChange?: (profile: keyof typeof SOUND_PROFILES) => void;
  externalAudioEnabled?: boolean;
  onAudioStateChange?: (enabled: boolean) => void;
  hideAudioControls?: boolean;
  autoInitialize?: boolean;
  className?: string;
  onSoundPlay?: (key: string) => void;
  onVirtualKeyPress?: (key: string, code: string) => void;
}

export function MultiProfileKeyboardSounds({
  compactMode = false,
  enableAISelector = true,
  externalProfile,
  onProfileChange,
  externalAudioEnabled,
  onAudioStateChange,
  hideAudioControls = false,
  autoInitialize = false,
  className = '',
  onSoundPlay,
  onVirtualKeyPress
}: MultiProfileKeyboardSoundsProps) {
  const [selectedProfile, setSelectedProfile] = useState<keyof typeof SOUND_PROFILES>(
    externalProfile || 'holy-pandas'
  );
  const [audioMuted, setAudioMuted] = useState(externalAudioEnabled !== undefined ? !externalAudioEnabled : true);
  const [loadedSounds, setLoadedSounds] = useState<Record<string, any>>({});
  const [isLoadingSounds, setIsLoadingSounds] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  // Sync with external audio state
  useEffect(() => {
    if (externalAudioEnabled !== undefined) {
      setAudioMuted(!externalAudioEnabled);
    }
  }, [externalAudioEnabled]);

  // Sync with external profile changes
  useEffect(() => {
    if (externalProfile && externalProfile !== selectedProfile) {
      setSelectedProfile(externalProfile);
    }
  }, [externalProfile]);

  // Load sounds for the current profile
  useEffect(() => {
    const loadProfileSounds = async () => {
      const profile = SOUND_PROFILES[selectedProfile];
      
      if (!profile.cdnFile) {
        return;
      }
      
      if (loadedSounds[selectedProfile]?.generic?.length > 0) {
        return;
      }

      setIsLoadingSounds(true);
      
      try {
        const soundData = await loadSoundProfile(profile.cdnFile);
        
        setLoadedSounds(prev => {
          const updated = {
            ...prev,
            [selectedProfile]: soundData
          };
          return updated;
        });
      } catch (error) {
        console.error(`Failed to load sounds for ${selectedProfile}:`, error);
      } finally {
        setIsLoadingSounds(false);
      }
    };
    
    loadProfileSounds();
  }, [selectedProfile]);

  // Handle profile change
  const handleProfileChange = (profileId: keyof typeof SOUND_PROFILES) => {
    setSelectedProfile(profileId);
    if (onProfileChange) {
      onProfileChange(profileId);
    }
  };

  // Initialize audio context
  const initializeAudio = async (): Promise<AudioContext | null> => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      if (audioContext.state === 'suspended') {
        await audioContext.resume();
      }
      
      return audioContext;
    } catch (error) {
      console.error('Failed to initialize audio context:', error);
      return null;
    }
  };

  // Play sound from base64 data
  const playBase64Sound = async (base64Data: string, ctx: AudioContext) => {
    try {
      // Remove data URL prefix if present
      const base64Audio = base64Data.replace(/^data:audio\/[^;]+;base64,/, '');
      
      // Convert base64 to array buffer
      const binaryString = window.atob(base64Audio);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      
      // Decode audio data
      const audioBuffer = await ctx.decodeAudioData(bytes.buffer);
      
      // Create and play audio source
      const source = ctx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(ctx.destination);
      source.start(0);
      
      return source;
    } catch (error) {
      console.error('Failed to play base64 sound:', error);
      throw error;
    }
  };

  // Main sound playing function
  const playKeyboardSound = async (key: string) => {
    if (audioMuted) {
      return;
    }

    try {
      setIsPlaying(true);
      
      // Initialize audio if needed
      const ctx = await initializeAudio();
      if (!ctx) {
        throw new Error('Failed to initialize audio context');
      }

      // Get sounds for current profile
      const profileSounds = loadedSounds[selectedProfile];
      
      if (!profileSounds || !profileSounds.generic || profileSounds.generic.length === 0) {
        return;
      }

      // Pick a random sound from generic sounds
      const soundIndex = Math.floor(Math.random() * profileSounds.generic.length);
      const soundData = profileSounds.generic[soundIndex];
      
      if (soundData && soundData.data) {
        await playBase64Sound(soundData.data, ctx);
      }

      if (onSoundPlay) {
        onSoundPlay(key);
      }

    } catch (error) {
      console.error(`Failed to play keyboard sound:`, error);
    } finally {
      setIsPlaying(false);
    }
  };

  // Expose sound function globally for virtual keyboard
  useEffect(() => {
    const exposedFunctions = {
      playKeyboardSound: async (key: string) => {
        if (audioMuted) {
          return;
        }

        try {
          setIsPlaying(true);
          
          // Initialize audio if needed
          const ctx = await initializeAudio();
          if (!ctx) {
            throw new Error('Failed to initialize audio context');
          }

          // Get sounds for current profile
          const profileSounds = loadedSounds[selectedProfile];
          
          if (!profileSounds || !profileSounds.generic || profileSounds.generic.length === 0) {
            return;
          }

          // Pick a random sound from generic sounds
          const soundIndex = Math.floor(Math.random() * profileSounds.generic.length);
          const soundData = profileSounds.generic[soundIndex];
          
          if (soundData && soundData.data) {
            await playBase64Sound(soundData.data, ctx);
          }

          if (onSoundPlay) {
            onSoundPlay(key);
          }

        } catch (error) {
          console.error(`Failed to play keyboard sound:`, error);
        } finally {
          setIsPlaying(false);
        }
      }
    };
    
    (window as any).multiProfileKeyboardSounds = exposedFunctions;
    
    return () => {
      delete (window as any).multiProfileKeyboardSounds;
    };
  }, [audioMuted, selectedProfile, loadedSounds, onSoundPlay]);

  const handleAudioToggle = () => {
    const newMutedState = !audioMuted;
    setAudioMuted(newMutedState);
    
    if (onAudioStateChange) {
      onAudioStateChange(!newMutedState);
    }
  };

  const handleTestSound = async () => {
    await playKeyboardSound('test');
  };

  const currentProfile = SOUND_PROFILES[selectedProfile];
  const soundCount = loadedSounds[selectedProfile]?.generic?.length || 0;

  return (
    <div className={`bg-gray-800 rounded-lg p-6 ${className}`}>
      {/* Profile Selector */}
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-white mb-2">
          {currentProfile.name}
        </h3>
        <p className="text-gray-300 text-sm mb-3">
          {currentProfile.description}
        </p>
        
        {!compactMode && (
          <div className="grid grid-cols-2 gap-2 mb-4">
            {Object.entries(SOUND_PROFILES).map(([key, profile]) => (
              <button
                key={key}
                onClick={() => handleProfileChange(key as keyof typeof SOUND_PROFILES)}
                className={`p-2 rounded text-sm transition-colors ${
                  selectedProfile === key
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {profile.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Audio Controls */}
      {!hideAudioControls && (
        <div className="flex items-center gap-4 mb-4">
          <button
            onClick={handleAudioToggle}
            className={`p-2 rounded transition-colors ${
              audioMuted 
                ? 'bg-red-600 hover:bg-red-700 text-white' 
                : 'bg-green-600 hover:bg-green-700 text-white'
            }`}
          >
            {audioMuted ? '🔇' : '🔊'}
          </button>
          
          <button
            onClick={handleTestSound}
            disabled={audioMuted || isPlaying}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white px-4 py-2 rounded transition-colors"
          >
            🎵 Test Sound
          </button>
          
          <div className="text-sm text-gray-300">
            ✅ {soundCount} sounds loaded
          </div>
        </div>
      )}
      
      {isLoadingSounds && (
        <div className="text-blue-400 text-sm">
          Loading sounds...
        </div>
      )}
    </div>
  );
}