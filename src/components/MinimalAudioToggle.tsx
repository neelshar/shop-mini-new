import React, { useState, useEffect } from 'react';

interface MinimalAudioToggleProps {
  onAudioStateChange: (enabled: boolean) => void;
  isAudioEnabled: boolean;
  hasSelectedSwitch: boolean;
  currentSwitchName?: string;
  className?: string;
}

export function MinimalAudioToggle({
  onAudioStateChange,
  isAudioEnabled,
  hasSelectedSwitch,
  currentSwitchName,
  className = ''
}: MinimalAudioToggleProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Show the toggle when there's a selected switch
  useEffect(() => {
    console.log('🔊 MinimalAudioToggle visibility check:', {
      hasSelectedSwitch,
      currentSwitchName,
      isAudioEnabled,
      willBeVisible: hasSelectedSwitch
    });
    
    if (hasSelectedSwitch) {
      console.log('✅ Showing audio toggle for switch:', currentSwitchName);
      // Small delay for smooth appearance
      const timer = setTimeout(() => setIsVisible(true), 300);
      return () => clearTimeout(timer);
    } else {
      console.log('❌ Hiding audio toggle - no switch selected');
      setIsVisible(false);
    }
  }, [hasSelectedSwitch, currentSwitchName]);

  // Don't render if not visible
  if (!isVisible) {
    return null;
  }

  return (
    <div className={`fixed bottom-4 left-4 z-50 ${className}`}>
      <div
        className={`
          transition-all duration-300 ease-out
          ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}
        `}
      >
        <button
          onClick={() => {
            console.log('🔊 MinimalAudioToggle clicked! Current state:', isAudioEnabled, '-> New state:', !isAudioEnabled);
            onAudioStateChange(!isAudioEnabled);
          }}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className={`
            group relative flex items-center space-x-2 px-3 py-2 rounded-lg
            backdrop-blur-md border transition-all duration-200
            ${isAudioEnabled 
              ? 'bg-green-600/90 border-green-500/50 hover:bg-green-600 text-white' 
              : 'bg-slate-800/90 border-slate-600/50 hover:bg-slate-700/90 text-slate-300 hover:text-white'
            }
            shadow-lg hover:shadow-xl transform hover:scale-105
          `}
          title={isAudioEnabled ? 'Mute keyboard sounds' : 'Unmute keyboard sounds'}
        >
          {/* Audio Icon */}
          <div className="relative">
            {isAudioEnabled ? (
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>
              </svg>
            )}
            
            {/* Sound wave animation when enabled */}
            {isAudioEnabled && (
              <div className="absolute -right-1 -top-1">
                <div className="flex space-x-px">
                  <div className="w-0.5 h-2 bg-white/60 rounded-full animate-pulse"></div>
                  <div className="w-0.5 h-3 bg-white/40 rounded-full animate-pulse" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-0.5 h-1 bg-white/60 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            )}
          </div>

          {/* Expanded state text */}
          <div className={`
            overflow-hidden transition-all duration-200 ease-out
            ${isHovered ? 'max-w-48 opacity-100' : 'max-w-0 opacity-0'}
          `}>
            <span className="text-xs font-medium whitespace-nowrap">
              {isAudioEnabled ? 'Sounds ON' : 'Sounds OFF'}
            </span>
          </div>
        </button>

        {/* Switch info tooltip on hover */}
        {isHovered && currentSwitchName && (
          <div className="absolute bottom-full left-0 mb-2 px-2 py-1 bg-slate-900/95 text-white text-xs rounded-md whitespace-nowrap border border-slate-600/50 backdrop-blur-sm">
            <div className="flex items-center space-x-1">
              <span className="text-slate-400">🔊</span>
              <span>{currentSwitchName}</span>
            </div>
            {/* Tooltip arrow */}
            <div className="absolute top-full left-3 w-0 h-0 border-l-2 border-r-2 border-t-2 border-transparent border-t-slate-900/95"></div>
          </div>
        )}
      </div>
    </div>
  );
}