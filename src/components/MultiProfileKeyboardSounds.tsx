import React, { useState, useRef, useEffect } from 'react';
import { AISwitchSoundSelector } from './AISwitchSoundSelector';

// Static sound profiles - no dynamic loading to prevent infinite loops
const SOUND_PROFILES = {
  'holy-pandas': {
    id: 'holy-pandas',
    name: 'Holy Pandas',
    description: 'Tactile switches with distinct "thock" sound',
    sounds: { generic: [] },
    hasSpecialKeys: true,
    color: 'purple'
  },
  'banana-split': {
    id: 'banana-split',
    name: 'Banana Split (Lubed)',
    description: 'Smooth, deep tactile switches',
    sounds: { generic: [] },
    hasSpecialKeys: false,
    color: 'yellow'
  },
  'cherrymx-blue-pbt': {
    id: 'cherrymx-blue-pbt',
    name: 'Cherry MX Blue PBT',
    description: 'Classic clicky switches with tactile bump and audible click',
    sounds: { generic: [] },
    hasSpecialKeys: false,
    color: 'blue'
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

  const currentProfile = SOUND_PROFILES[selectedProfile];

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

  const playKeyboardSound = async (key: string) => {
    console.log('🎵 Sound play requested for key:', key, '(sounds temporarily disabled)');
    if (onSoundPlay) {
      onSoundPlay(key);
    }
  };

  if (compactMode) {
    return (
      <div className={`p-4 bg-slate-900/60 border border-slate-700/50 rounded-xl ${className}`}>
        <div className="text-center">
          <h3 className="text-white font-medium mb-2">Sound Profile</h3>
          <p className="text-slate-400 text-sm">{currentProfile.name}</p>
          <p className="text-xs text-slate-500 mt-1">Sounds temporarily disabled</p>
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
        
        <div className="mt-4 p-3 bg-yellow-900/20 border border-yellow-600/30 rounded-lg">
          <p className="text-yellow-200 text-sm">
            🔧 Sound functionality temporarily disabled during CDN migration
          </p>
        </div>
      </div>
    </div>
  );
}