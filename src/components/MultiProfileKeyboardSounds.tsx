import React, { useState, useRef, useEffect } from 'react';
import { AISwitchSoundSelector } from './AISwitchSoundSelector';

// Sound cache to prevent re-loading
const soundCache = new Map();

// Load sound profile from CDN
const loadSoundProfile = async (profileName: string) => {
  console.log(`🔍 CDN DEBUG: Starting loadSoundProfile for: ${profileName}`);
  
  // Return cached version if available
  if (soundCache.has(profileName)) {
    const cached = soundCache.get(profileName);
    console.log(`🔍 CDN DEBUG: Found cached data for ${profileName}:`, {
      hasSounds: !!cached,
      soundsCount: cached?.generic?.length || 0
    });
    return cached;
  }

  const CDN_BASE = import.meta.env.VITE_CDN_BASE_URL || '';
  console.log(`🔍 CDN DEBUG: CDN_BASE:`, CDN_BASE);
  console.log(`🔍 CDN DEBUG: All env vars:`, import.meta.env);
  
  if (!CDN_BASE) {
    console.warn('🔍 CDN DEBUG: No CDN configured for sound profiles');
    return { generic: [] };
  }
  
  const fullUrl = `${CDN_BASE}/sound-components/${profileName}.ts`;
  console.log(`🔍 CDN DEBUG: Fetching from URL:`, fullUrl);
  
  try {
    console.log(`🔍 CDN DEBUG: Starting fetch for ${profileName}...`);
    const response = await fetch(fullUrl);
    console.log(`🔍 CDN DEBUG: Fetch response:`, {
      ok: response.ok,
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries())
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    console.log(`🔍 CDN DEBUG: Reading response text...`);
    const tsContent = await response.text();
    console.log(`🔍 CDN DEBUG: Response length:`, tsContent.length);
    console.log(`🔍 CDN DEBUG: Response preview:`, tsContent.substring(0, 200) + '...');
    
    // Extract the exported object from TypeScript content
    console.log(`🔍 CDN DEBUG: Looking for export pattern...`);
    // Look for the main object structure, be more flexible with the pattern
    let match = tsContent.match(/export const [A-Z_]+ = (\{[\s\S]*?\n\})/);
    console.log(`🔍 CDN DEBUG: Main regex match found:`, !!match);
    
    if (!match) {
      // Try simpler pattern that finds object with generic array
      console.log(`🔍 CDN DEBUG: Trying simpler pattern...`);
      match = tsContent.match(/= (\{[\s\S]*?generic:\s*\[[\s\S]*?\][\s\S]*?\})/);
      console.log(`🔍 CDN DEBUG: Simpler regex match found:`, !!match);
    }
    
    if (!match) {
      // Try most basic pattern - just find the object after the export
      console.log(`🔍 CDN DEBUG: Trying basic pattern...`);
      match = tsContent.match(/export const [A-Z_]+ = ([\s\S]*)/);
      if (match) {
        // Extract just the object part before any trailing content
        const objectMatch = match[1].match(/(\{[\s\S]*?\n\});?/);
        if (objectMatch) {
          match[1] = objectMatch[1];
        }
      }
      console.log(`🔍 CDN DEBUG: Basic regex match found:`, !!match);
    }
    
    if (match) {
      console.log(`🔍 CDN DEBUG: Matched content length:`, match[1].length);
      console.log(`🔍 CDN DEBUG: Matched content preview:`, match[1].substring(0, 200) + '...');
      console.log(`🔍 CDN DEBUG: Raw match object:`, match[1]);
      
      try {
        // Extract sound data using regex patterns instead of eval
        console.log(`🔍 CDN DEBUG: Extracting sound data using regex...`);
        
        // Extract the generic array content
        const genericMatch = match[1].match(/generic:\s*\[([\s\S]*?)\]/);
        console.log(`🔍 CDN DEBUG: Generic match found:`, !!genericMatch);
        
        let soundData = { generic: [] };
        
        if (genericMatch) {
          console.log(`🔍 CDN DEBUG: Generic content length:`, genericMatch[1].length);
          
          // Extract individual sound strings from the array
          const soundStrings = [];
          const soundMatches = genericMatch[1].match(/'data:audio\/[^']*'/g);
          
          if (soundMatches) {
            console.log(`🔍 CDN DEBUG: Found ${soundMatches.length} sound strings`);
            soundStrings.push(...soundMatches.map(s => s.slice(1, -1))); // Remove quotes
          }
          
          soundData = {
            generic: soundStrings.map(data => ({ data }))
          };
          
          console.log(`🔍 CDN DEBUG: Regex extraction successful:`, {
            type: typeof soundData,
            keys: Object.keys(soundData || {}),
            hasGeneric: !!soundData?.generic,
            genericLength: soundData?.generic?.length || 0
          });
        }
        
        if (soundData?.generic?.length > 0) {
          console.log(`🔍 CDN DEBUG: First sound preview:`, {
            hasData: !!soundData.generic[0]?.data,
            dataType: typeof soundData.generic[0]?.data,
            dataLength: soundData.generic[0]?.data?.length || 0,
            dataPreview: soundData.generic[0]?.data?.substring(0, 50) + '...'
          });
        }
        
        soundCache.set(profileName, soundData); // Cache it
        console.log(`✅ CDN DEBUG: Successfully loaded ${profileName} with ${soundData.generic?.length || 0} sounds`);
        return soundData;
      } catch (evalError) {
        console.error(`❌ CDN DEBUG: JavaScript evaluation failed:`, evalError);
        throw evalError;
      }
    } else {
      console.error(`❌ CDN DEBUG: No export pattern found in content`);
      throw new Error('No valid export pattern found in TypeScript file');
    }
  } catch (error) {
    console.error(`❌ CDN DEBUG: Failed to load sound profile ${profileName}:`, error);
    console.error(`❌ CDN DEBUG: Error details:`, {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
  }
  
  // Return static fallback sounds from SOUND_PROFILES
  console.log(`🔍 CDN DEBUG: Using static fallback sounds for ${profileName}`);
  const profileConfig = SOUND_PROFILES[profileName as keyof typeof SOUND_PROFILES];
  const fallback = profileConfig?.sounds || { generic: [] };
  console.log(`🔍 CDN DEBUG: Fallback sounds:`, {
    profileExists: !!profileConfig,
    hasGeneric: !!fallback.generic,
    soundCount: fallback.generic?.length || 0
  });
  soundCache.set(profileName, fallback);
  return fallback;
};

// Static sound profiles configuration with fallback sounds
const SOUND_PROFILES = {
  'holy-pandas': {
    id: 'holy-pandas',
    name: 'Holy Pandas',
    description: 'Tactile switches with distinct "thock" sound',
    sounds: { 
      generic: [
        // Fallback test sound - simple sine wave beep
        { data: 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwfBjiS2PCyeSMFJHfJ8N2QQAoUXrTp66hVFApGn+DyvmwfBjiS2PCyeSMFJHfJ8N2QQAoUXrTp66hVFApGn+DyvmwfBjiS2PCyeSMFJHfJ8N2QQAoUXrTp66hVFApGn+DyvmwfBjiS2PCyeSMFJHfJ8N2QQAoUXrTp66hVFApGn+DyvmwfBTcF' }
      ]
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
      generic: [
        { data: 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwfBjiS2PCyeSMFJHfJ8N2QQAoUXrTp66hVFApGn+DyvmwfBjiS2PCyeSMFJHfJ8N2QQAoUXrTp66hVFApGn+DyvmwfBjiS2PCyeSMFJHfJ8N2QQAoUXrTp66hVFApGn+DyvmwfBjiS2PCyeSMFJHfJ8N2QQAoUXrTp66hVFApGn+DyvmwfBTcF' }
      ]
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
      generic: [
        { data: 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwfBjiS2PCyeSMFJHfJ8N2QQAoUXrTp66hVFApGn+DyvmwfBjiS2PCyeSMFJHfJ8N2QQAoUXrTp66hVFApGn+DyvmwfBjiS2PCyeSMFJHfJ8N2QQAoUXrTp66hVFApGn+DyvmwfBjiS2PCyeSMFJHfJ8N2QQAoUXrTp66hVFApGn+DyvmwfBTcF' }
      ]
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
      generic: [
        { data: 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwfBjiS2PCyeSMFJHfJ8N2QQAoUXrTp66hVFApGn+DyvmwfBjiS2PCyeSMFJHfJ8N2QQAoUXrTp66hVFApGn+DyvmwfBjiS2PCyeSMFJHfJ8N2QQAoUXrTp66hVFApGn+DyvmwfBjiS2PCyeSMFJHfJ8N2QQAoUXrTp66hVFApGn+DyvmwfBTcF' }
      ]
    },
    hasSpecialKeys: true,
    color: 'blue',
    cdnFile: 'SteelSeriesSounds'
  },
  'tealios': {
    id: 'tealios',
    name: 'Tealios V2 on PBT',
    description: 'Premium linear switches with smooth keystrokes',
    sounds: { 
      generic: [
        { data: 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwfBjiS2PCyeSMFJHfJ8N2QQAoUXrTp66hVFApGn+DyvmwfBjiS2PCyeSMFJHfJ8N2QQAoUXrTp66hVFApGn+DyvmwfBjiS2PCyeSMFJHfJ8N2QQAoUXrTp66hVFApGn+DyvmwfBjiS2PCyeSMFJHfJ8N2QQAoUXrTp66hVFApGn+DyvmwfBTcF' }
      ]
    },
    hasSpecialKeys: true,
    color: 'teal',
    cdnFile: 'TealiosSounds'
  }
};

interface MultiProfileKeyboardSoundsProps {
  className?: string;
  compactMode?: boolean;
  onSoundPlay?: (key: string) => void;
  enableAISelector?: boolean;
  externalProfile?: string;
  onProfileChange?: (profileId: string) => void;
  externalAudioEnabled?: boolean;
  onAudioStateChange?: (enabled: boolean) => void;
  hideAudioControls?: boolean;
  autoInitialize?: boolean;
  onVirtualKeyPress?: (key: string, code: string) => void;
}

export function MultiProfileKeyboardSounds({ 
  className = '', 
  compactMode = false,
  onSoundPlay,
  enableAISelector = false,
  externalProfile,
  onProfileChange,
  externalAudioEnabled,
  onAudioStateChange,
  hideAudioControls = false,
  autoInitialize = false,
  onVirtualKeyPress
}: MultiProfileKeyboardSoundsProps) {
  
  const [selectedProfile, setSelectedProfile] = useState<keyof typeof SOUND_PROFILES>('holy-pandas');
  const [audioMuted, setAudioMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [loadedSounds, setLoadedSounds] = useState<Record<string, any>>({});
  const [isLoadingSounds, setIsLoadingSounds] = useState(false);

  const currentProfile = SOUND_PROFILES[selectedProfile];

  // Load sounds for the current profile
  useEffect(() => {
    const loadProfileSounds = async () => {
      console.log(`🔍 DEBUG: Starting sound load for profile: ${selectedProfile}`);
      console.log(`🔍 DEBUG: Current loadedSounds:`, Object.keys(loadedSounds));
      
      const profile = SOUND_PROFILES[selectedProfile];
      console.log(`🔍 DEBUG: Profile config:`, profile);
      
      if (!profile.cdnFile) {
        console.warn(`🔍 DEBUG: No CDN file specified for ${selectedProfile}`);
        return;
      }
      
      if (loadedSounds[selectedProfile]?.generic?.length > 0) {
        console.log(`🔍 DEBUG: Sounds already loaded for ${selectedProfile}:`, loadedSounds[selectedProfile]?.generic?.length);
        return;
      } else if (loadedSounds[selectedProfile]) {
        console.log(`🔍 DEBUG: Empty sounds cached for ${selectedProfile}, will reload`);
      }

      console.log(`🔍 DEBUG: Starting to load sounds for ${selectedProfile}...`);
      setIsLoadingSounds(true);
      
      try {
        const soundData = await loadSoundProfile(profile.cdnFile);
        console.log(`🔍 DEBUG: Raw sound data received:`, soundData);
        console.log(`🔍 DEBUG: Sound data type:`, typeof soundData);
        console.log(`🔍 DEBUG: Sound data keys:`, Object.keys(soundData || {}));
        console.log(`🔍 DEBUG: Generic sounds count:`, soundData?.generic?.length || 0);
        
        if (soundData?.generic?.length > 0) {
          console.log(`🔍 DEBUG: First sound sample:`, soundData.generic[0]);
          console.log(`🔍 DEBUG: First sound has data:`, !!soundData.generic[0]?.data);
          console.log(`🔍 DEBUG: First sound data length:`, soundData.generic[0]?.data?.length || 0);
        }
        
        setLoadedSounds(prev => {
          const updated = {
            ...prev,
            [selectedProfile]: soundData
          };
          console.log(`🔍 DEBUG: Updated loadedSounds:`, Object.keys(updated));
          return updated;
        });
        
        console.log(`✅ DEBUG: Successfully loaded sounds for ${selectedProfile}`);
      } catch (error) {
        console.error(`❌ DEBUG: Failed to load sounds for ${selectedProfile}:`, error);
        console.error(`❌ DEBUG: Error stack:`, error.stack);
      } finally {
        setIsLoadingSounds(false);
        console.log(`🔍 DEBUG: Finished loading process for ${selectedProfile}`);
      }
    };

    loadProfileSounds();
  }, [selectedProfile]); // Only run when profile changes

  // Initialize audio context
  const initializeAudio = async () => {
    if (audioContext) return audioContext;

    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // iOS requires user interaction to unlock audio
      if (ctx.state === 'suspended') {
        await ctx.resume();
      }
      
      setAudioContext(ctx);
      console.log('🔊 Audio context initialized');
      return ctx;
    } catch (error) {
      console.error('Failed to initialize audio:', error);
      return null;
    }
  };

  const handleProfileChange = (profileId: keyof typeof SOUND_PROFILES) => {
    console.log('🔄 Profile change requested:', profileId);
    setSelectedProfile(profileId);
    
    if (onProfileChange) {
      onProfileChange(profileId);
    }
  };

  const handleAIProfileSelected = (profileId: string, analysisResult: any) => {
    console.log('🤖 AI selected profile:', profileId, analysisResult);
    handleProfileChange(profileId as keyof typeof SOUND_PROFILES);
  };

  // Expose sound function globally for virtual keyboard - moved to end to avoid initialization issues
  useEffect(() => {
    const exposedFunctions = {
      playKeyboardSound: async (key: string) => {
        console.log(`🔍 WINDOW DEBUG: playKeyboardSound called for key: ${key}`);
        console.log(`🔍 WINDOW DEBUG: audioMuted: ${audioMuted}`);
        console.log(`🔍 WINDOW DEBUG: selectedProfile: ${selectedProfile}`);
        console.log(`🔍 WINDOW DEBUG: loadedSounds keys:`, Object.keys(loadedSounds));
        
        if (audioMuted) {
          console.log('🔇 WINDOW DEBUG: Audio is muted, skipping sound');
          return;
        }

        try {
          setIsPlaying(true);
          console.log(`🔍 WINDOW DEBUG: Starting sound playback...`);
          
          // Initialize audio if needed
          console.log(`🔍 WINDOW DEBUG: Initializing audio context...`);
          const ctx = await initializeAudio();
          console.log(`🔍 WINDOW DEBUG: Audio context:`, {
            available: !!ctx,
            state: ctx?.state,
            sampleRate: ctx?.sampleRate
          });
          
          if (!ctx) {
            throw new Error('Failed to initialize audio context');
          }

          // Get sounds for current profile
          const profileSounds = loadedSounds[selectedProfile];
          console.log(`🔍 WINDOW DEBUG: Profile sounds:`, {
            exists: !!profileSounds,
            type: typeof profileSounds,
            keys: profileSounds ? Object.keys(profileSounds) : [],
            hasGeneric: !!profileSounds?.generic,
            genericCount: profileSounds?.generic?.length || 0
          });
          
          if (!profileSounds || !profileSounds.generic || profileSounds.generic.length === 0) {
            console.warn(`🔍 WINDOW DEBUG: No sounds available for profile: ${selectedProfile}`);
            console.warn(`🔍 WINDOW DEBUG: Profile sounds detail:`, profileSounds);
            return;
          }

          // Pick a random sound from generic sounds
          const soundIndex = Math.floor(Math.random() * profileSounds.generic.length);
          const soundData = profileSounds.generic[soundIndex];
          
          console.log(`🔍 WINDOW DEBUG: Selected sound ${soundIndex}:`, {
            exists: !!soundData,
            hasData: !!soundData?.data,
            dataType: typeof soundData?.data,
            dataLength: soundData?.data?.length || 0
          });
          
          if (soundData && soundData.data) {
            console.log(`🔍 WINDOW DEBUG: Playing base64 sound...`);
            await playBase64Sound(soundData.data, ctx);
            console.log(`✅ WINDOW DEBUG: Successfully played sound ${soundIndex} for ${key}`);
          } else {
            console.warn(`🔍 WINDOW DEBUG: No sound data available for key: ${key}`);
            console.warn(`🔍 WINDOW DEBUG: Sound data details:`, soundData);
          }

          if (onSoundPlay) {
            onSoundPlay(key);
          }

        } catch (error) {
          console.error(`❌ WINDOW DEBUG: Failed to play keyboard sound:`, error);
          console.error(`❌ WINDOW DEBUG: Error stack:`, error.stack);
        } finally {
          setIsPlaying(false);
          console.log(`🔍 WINDOW DEBUG: Finished playback attempt`);
        }
      }
    };
    
    (window as any).multiProfileKeyboardSounds = exposedFunctions;
    console.log('🔍 DEBUG: Exposed sound function to window');
    
    return () => {
      delete (window as any).multiProfileKeyboardSounds;
    };
  }, [audioMuted, selectedProfile, loadedSounds, onSoundPlay]); // Dependencies for the inline function

  // Play sound from base64 data
  const playBase64Sound = async (base64Data: string, ctx: AudioContext) => {
    try {
      // Remove data URL prefix if present
      const base64Audio = base64Data.replace(/^data:audio\/[^;]+;base64,/, '');
      
      // Decode base64 to array buffer
      const binaryString = window.atob(base64Audio);
      const arrayBuffer = new ArrayBuffer(binaryString.length);
      const uint8Array = new Uint8Array(arrayBuffer);
      
      for (let i = 0; i < binaryString.length; i++) {
        uint8Array[i] = binaryString.charCodeAt(i);
      }
      
      // Decode audio data
      const audioBuffer = await ctx.decodeAudioData(arrayBuffer);
      
      // Create and play source
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

  const playKeyboardSound = async (key: string) => {
    console.log(`🔍 AUDIO DEBUG: playKeyboardSound called for key: ${key}`);
    console.log(`🔍 AUDIO DEBUG: audioMuted: ${audioMuted}`);
    console.log(`🔍 AUDIO DEBUG: selectedProfile: ${selectedProfile}`);
    console.log(`🔍 AUDIO DEBUG: loadedSounds keys:`, Object.keys(loadedSounds));
    
    if (audioMuted) {
      console.log('🔇 AUDIO DEBUG: Audio is muted, skipping sound');
      return;
    }

    try {
      setIsPlaying(true);
      console.log(`🔍 AUDIO DEBUG: Starting sound playback...`);
      
      // Initialize audio if needed
      console.log(`🔍 AUDIO DEBUG: Initializing audio context...`);
      const ctx = await initializeAudio();
      console.log(`🔍 AUDIO DEBUG: Audio context:`, {
        available: !!ctx,
        state: ctx?.state,
        sampleRate: ctx?.sampleRate
      });
      
      if (!ctx) {
        throw new Error('Failed to initialize audio context');
      }

      // Get sounds for current profile
      const profileSounds = loadedSounds[selectedProfile];
      console.log(`🔍 AUDIO DEBUG: Profile sounds:`, {
        exists: !!profileSounds,
        type: typeof profileSounds,
        keys: profileSounds ? Object.keys(profileSounds) : [],
        hasGeneric: !!profileSounds?.generic,
        genericCount: profileSounds?.generic?.length || 0
      });
      
      if (!profileSounds || !profileSounds.generic || profileSounds.generic.length === 0) {
        console.warn(`🔍 AUDIO DEBUG: No sounds available for profile: ${selectedProfile}`);
        console.warn(`🔍 AUDIO DEBUG: Profile sounds detail:`, profileSounds);
        return;
      }

      // Pick a random sound from generic sounds
      const soundIndex = Math.floor(Math.random() * profileSounds.generic.length);
      const soundData = profileSounds.generic[soundIndex];
      
      console.log(`🔍 AUDIO DEBUG: Selected sound ${soundIndex}:`, {
        exists: !!soundData,
        hasData: !!soundData?.data,
        dataType: typeof soundData?.data,
        dataLength: soundData?.data?.length || 0
      });
      
      if (soundData && soundData.data) {
        console.log(`🔍 AUDIO DEBUG: Playing base64 sound...`);
        await playBase64Sound(soundData.data, ctx);
        console.log(`✅ AUDIO DEBUG: Successfully played sound ${soundIndex} for ${key}`);
      } else {
        console.warn(`🔍 AUDIO DEBUG: No sound data available for key: ${key}`);
        console.warn(`🔍 AUDIO DEBUG: Sound data details:`, soundData);
      }

      if (onSoundPlay) {
        onSoundPlay(key);
      }

    } catch (error) {
      console.error(`❌ AUDIO DEBUG: Failed to play keyboard sound:`, error);
      console.error(`❌ AUDIO DEBUG: Error stack:`, error.stack);
    } finally {
      setIsPlaying(false);
      console.log(`🔍 AUDIO DEBUG: Finished playback attempt`);
    }
  };

  if (compactMode) {
    return (
      <div className={`p-4 bg-slate-900/60 border border-slate-700/50 rounded-xl ${className}`}>
        <div className="text-center">
          <h3 className="text-white font-medium mb-2">Sound Profile</h3>
          <p className="text-slate-400 text-sm">{currentProfile.name}</p>
          {isLoadingSounds ? (
            <p className="text-xs text-blue-400 mt-1">🎵 Loading sounds...</p>
          ) : loadedSounds[selectedProfile] ? (
            <p className="text-xs text-green-400 mt-1">✅ Sounds ready</p>
          ) : (
            <p className="text-xs text-slate-500 mt-1">🔇 No sounds loaded</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* AI Selector */}
      {enableAISelector && (
        <AISwitchSoundSelector 
          onProfileSelected={handleAIProfileSelected}
          currentProfile={selectedProfile}
          className="mb-6"
        />
      )}

      {/* Profile Selector */}
      <div className="bg-slate-900/60 border border-slate-700/50 rounded-xl p-6">
        <h3 className="text-white font-semibold mb-4">Sound Profile</h3>
        <div className="grid grid-cols-1 gap-3">
          {Object.values(SOUND_PROFILES).map((profile) => (
            <button
              key={profile.id}
              onClick={() => handleProfileChange(profile.id as keyof typeof SOUND_PROFILES)}
              className={`p-3 rounded-lg border text-left transition-all ${
                selectedProfile === profile.id
                  ? 'bg-blue-600/20 border-blue-500/50 text-white'
                  : 'bg-slate-800/50 border-slate-600/50 text-slate-300 hover:bg-slate-700/50'
              }`}
            >
              <div className="font-medium">{profile.name}</div>
              <div className="text-sm text-slate-400">{profile.description}</div>
            </button>
          ))}
        </div>
        
        {/* Audio Controls */}
        <div className="mt-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-slate-300 text-sm">Audio</span>
            <button
              onClick={() => setAudioMuted(!audioMuted)}
              className={`p-2 rounded-lg transition-all ${
                audioMuted
                  ? 'bg-red-600/20 border border-red-500/40 text-red-400'
                  : 'bg-green-600/20 border border-green-500/40 text-green-400'
              }`}
            >
              {audioMuted ? '🔇' : '🔊'}
            </button>
          </div>

          {/* Test Sound Button */}
          <button
            onClick={() => playKeyboardSound('test')}
            disabled={audioMuted || isPlaying || isLoadingSounds}
            className="w-full bg-blue-600/20 border border-blue-500/40 text-blue-400 px-3 py-2 rounded-lg text-sm hover:bg-blue-600/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPlaying ? '🎵 Playing...' : isLoadingSounds ? '⏳ Loading...' : '🎵 Test Sound'}
          </button>

          {/* Status */}
          <div className="text-xs text-center">
            {isLoadingSounds ? (
              <span className="text-blue-400">Loading sounds from CDN...</span>
            ) : loadedSounds[selectedProfile] ? (
              <span className="text-green-400">
                ✅ {loadedSounds[selectedProfile].generic?.length || 0} sounds loaded
              </span>
            ) : (
              <span className="text-slate-500">🔇 No sounds available</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}