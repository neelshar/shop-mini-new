import React, { useState } from 'react';

interface VirtualKeyboardProps {
  onKeyPress: (key: string) => void;
  isAudioEnabled: boolean;
  className?: string;
}

export function VirtualKeyboard({ onKeyPress, isAudioEnabled, className = '' }: VirtualKeyboardProps) {
  const [pressedKey, setPressedKey] = useState<string | null>(null);

  const handleKeyPress = (key: string) => {
    if (!isAudioEnabled) return;
    
    console.log('🎹 Virtual keyboard key pressed:', key);
    setPressedKey(key);
    onKeyPress(key);
    
    // Clear pressed state after animation
    setTimeout(() => setPressedKey(null), 150);
  };

  const getKeyClass = (key: string) => {
    const isPressed = pressedKey === key;
    return `
      w-12 h-12 rounded-full
      transition-all duration-150 ease-out
      font-medium text-center cursor-pointer
      select-none flex items-center justify-center
      ${isAudioEnabled 
        ? 'active:scale-95 hover:bg-slate-700/80' 
        : 'opacity-50 cursor-not-allowed'
      }
      ${isPressed 
        ? 'bg-blue-600 text-white transform scale-95 shadow-lg' 
        : 'bg-slate-800/90 text-slate-200 shadow-md'
      }
    `.replace(/\s+/g, ' ').trim();
  };

  const getSpaceKeyClass = () => {
    const isPressed = pressedKey === ' ';
    return `
      h-12 rounded-full flex-1 mx-4
      transition-all duration-150 ease-out
      font-medium text-center cursor-pointer
      select-none flex items-center justify-center
      ${isAudioEnabled 
        ? 'active:scale-95 hover:bg-slate-700/80' 
        : 'opacity-50 cursor-not-allowed'
      }
      ${isPressed 
        ? 'bg-blue-600 text-white transform scale-95 shadow-lg' 
        : 'bg-slate-800/90 text-slate-400 shadow-md'
      }
    `.replace(/\s+/g, ' ').trim();
  };

  const keys = {
    row1: ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
    row2: ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
    row3: ['z', 'x', 'c', 'v', 'b', 'n', 'm']
  };

  if (!isAudioEnabled) {
    return (
      <div className={`p-6 bg-slate-900/50 rounded-2xl border border-slate-700/50 ${className}`}>
        <div className="text-center">
          <h3 className="text-white text-lg font-medium mb-2">Virtual Keyboard</h3>
          <p className="text-slate-400 text-sm">
            Enable audio to use the virtual keyboard for testing sounds
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`p-6 bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl border border-slate-700/50 ${className}`}>
      {/* Header */}
      <div className="text-center mb-6">
        <h3 className="text-white text-lg font-bold mb-1">Virtual Keyboard</h3>
        <p className="text-slate-400 text-sm">
          Tap keys to test keyboard sounds • Perfect for mobile devices
        </p>
      </div>

      {/* Simple 3-Row QWERTY Layout */}
      <div className="space-y-3 select-none max-w-lg mx-auto">
        {/* Row 1 - QWERTY */}
        <div className="flex justify-center gap-2">
          {keys.row1.map((key) => (
            <button
              key={key}
              onClick={() => handleKeyPress(key.toUpperCase())}
              className={getKeyClass(key.toUpperCase())}
              disabled={!isAudioEnabled}
            >
              {key}
            </button>
          ))}
        </div>

        {/* Row 2 - ASDF */}
        <div className="flex justify-center gap-2">
          {keys.row2.map((key) => (
            <button
              key={key}
              onClick={() => handleKeyPress(key.toUpperCase())}
              className={getKeyClass(key.toUpperCase())}
              disabled={!isAudioEnabled}
            >
              {key}
            </button>
          ))}
        </div>

        {/* Row 3 - ZXCV */}
        <div className="flex justify-center gap-2">
          {keys.row3.map((key) => (
            <button
              key={key}
              onClick={() => handleKeyPress(key.toUpperCase())}
              className={getKeyClass(key.toUpperCase())}
              disabled={!isAudioEnabled}
            >
              {key}
            </button>
          ))}
        </div>

        {/* Row 4 - Space bar */}
        <div className="flex justify-center items-center">
          <button
            onClick={() => handleKeyPress(' ')}
            className={getSpaceKeyClass()}
            disabled={!isAudioEnabled}
          >
            space
          </button>
        </div>
      </div>

      {/* Footer Info */}
      <div className="mt-6 text-center">
        <p className="text-slate-500 text-xs">
          {pressedKey && (
            <span className="text-blue-400 font-medium">
              Playing: {pressedKey === ' ' ? 'Space' : pressedKey} • 
            </span>
          )} Real mechanical keyboard sounds
        </p>
      </div>
    </div>
  );
}