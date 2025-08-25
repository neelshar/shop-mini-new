import React, { useState, useEffect } from 'react';

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
    
    // Convert character to browser key code for 3D animation
    const keyCode = charToBrowserKeyCode(key);
    if (keyCode) {
      // Dispatch synthetic keydown event for 3D KeySim only (mark as synthetic to avoid sound duplication)
      const keydownEvent = new KeyboardEvent('keydown', {
        code: keyCode,
        key: key,
        bubbles: true
      });
      // Mark as synthetic to prevent sound system from processing it
      (keydownEvent as any).isSynthetic = true;
      document.dispatchEvent(keydownEvent);
      
      // Dispatch keyup event after a short delay to complete the animation
      setTimeout(() => {
        const keyupEvent = new KeyboardEvent('keyup', {
          code: keyCode,
          key: key,
          bubbles: true
        });
        // Mark as synthetic to prevent sound system from processing it
        (keyupEvent as any).isSynthetic = true;
        document.dispatchEvent(keyupEvent);
      }, 100);
    }
    
    // Clear pressed state after animation
    setTimeout(() => setPressedKey(null), 150);
  };

  // Helper function to convert character to browser key code
  const charToBrowserKeyCode = (char: string): string | null => {
    if (char === ' ') return 'Space';
    if (char.length === 1 && char.match(/[a-zA-Z]/)) {
      return `Key${char.toUpperCase()}`;
    }
    return null;
  };

  // Helper function to convert browser key code to virtual keyboard character
  const browserKeyCodeToChar = (code: string): string | null => {
    if (code === 'Space') return ' ';
    if (code.startsWith('Key') && code.length === 4) {
      const char = code.substring(3).toLowerCase();
      // Check if this character exists in our virtual keyboard layout
      const allKeys = [...keys.row1, ...keys.row2, ...keys.row3];
      if (allKeys.includes(char)) {
        return char.toUpperCase();
      }
    }
    return null;
  };

  const keys = {
    row1: ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
    row2: ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
    row3: ['z', 'x', 'c', 'v', 'b', 'n', 'm']
  };

  // Listen for physical keyboard events to sync with virtual keyboard visual feedback
  useEffect(() => {
    if (!isAudioEnabled) return;

    const handlePhysicalKeyDown = (event: KeyboardEvent) => {
      const char = browserKeyCodeToChar(event.code);
      if (char) {
        console.log('👀 VirtualKeyboard: Physical key pressed, syncing visual:', event.code, '→', char);
        setPressedKey(char);
        // Don't interfere with sound system - this is visual only
      }
    };

    const handlePhysicalKeyUp = (event: KeyboardEvent) => {
      const char = browserKeyCodeToChar(event.code);
      if (char) {
        console.log('👀 VirtualKeyboard: Physical key released, clearing visual:', event.code, '→', char);
        // Clear the pressed state after a brief moment to show the press
        setTimeout(() => setPressedKey(null), 50);
        // Don't interfere with sound system - this is visual only
      }
    };

    // Add event listeners with capture: true and passive: true to avoid interfering with sound system
    document.addEventListener('keydown', handlePhysicalKeyDown as EventListener, { capture: true, passive: true } as AddEventListenerOptions);
    document.addEventListener('keyup', handlePhysicalKeyUp as EventListener, { capture: true, passive: true } as AddEventListenerOptions);

    // Cleanup
    return () => {
      document.removeEventListener('keydown', handlePhysicalKeyDown as EventListener, { capture: true, passive: true } as AddEventListenerOptions);
      document.removeEventListener('keyup', handlePhysicalKeyUp as EventListener, { capture: true, passive: true } as AddEventListenerOptions);
    };
  }, [isAudioEnabled]);

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
          Tap keys to test sounds • Syncs with your physical keyboard
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