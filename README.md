# 🎹 Custom Keyboard Builder - Shop Mini

A sophisticated **Shopify Shop Mini** application for building custom mechanical keyboards with real-time 3D visualization, authentic keyboard sounds, and seamless e-commerce integration.

## 🚀 Features

### 🎨 **3D Keyboard Visualization**
- **Real-time 3D rendering** using Three.js and React Three Fiber
- **Interactive KeySim engine** with realistic keyboard models
- **Live color customization** for cases and keycaps
- **Multiple layout support** (60%, 65%, TKL, Full-size)
- **Physical keyboard sync** - your typing reflects in the 3D model

### 🔊 **Authentic Keyboard Sounds**
- **Multiple switch sound profiles**: Holy Pandas, Cherry MX variants, Tealios, Steel Series
- **AI-powered switch matching** based on product selection
- **Real-time audio playback** with Web Audio API
- **Physical + Virtual keyboard support** with sound synchronization
- **Mobile-optimized** audio handling with fallbacks

### 🛒 **E-commerce Integration**
- **Shopify Shop Mini integration** using `@shopify/shop-minis-react`
- **Product search and selection** for keycaps, switches, and cases
- **Smart cart management** with multi-item support
- **Professional checkout flow** with confirmation pages
- **Real-time pricing** and inventory integration

### 🎯 **Advanced UI/UX**
- **Multi-page navigation**: Welcome → Preferences → Builder → Customizers
- **Color analysis system** using OpenAI vision API
- **Responsive design** optimized for mobile and desktop
- **Loading states and error handling** throughout
- **Professional animations** with Tailwind CSS

## 🏗️ Technical Architecture

### **Core Technologies**
```typescript
// Frontend Framework
React 18.2.0 + TypeScript 5.8.3
Vite 7.1.1 (Build tool)

// 3D Graphics
Three.js 0.178.0
@react-three/fiber 8.17.10
@react-three/drei 9.114.3

// Shopify Integration
@shopify/shop-minis-react 0.0.30
@shopify/shop-minis-cli 0.0.175

// Styling
Tailwind CSS 4.1.8
@tailwindcss/vite 4.1.8
```

### **Project Structure**
```
src/
├── components/                    # React components
│   ├── RealKeysim.tsx            # 3D keyboard renderer
│   ├── VirtualKeyboard.tsx       # On-screen keyboard with sync
│   ├── MultiProfileKeyboardSounds.tsx  # Audio system
│   ├── ComponentSearchModal.tsx   # Product search interface
│   ├── AutoSwitchMatcher.tsx     # AI switch recommendation
│   ├── MinimalAudioToggle.tsx    # Audio control component
│   └── ErrorBoundary.tsx         # Error handling
├── keysim/                       # 3D KeySim engine
│   ├── sceneManager.js           # Three.js scene management
│   ├── key/                      # Individual key rendering
│   ├── case/                     # Keyboard case models
│   └── store.js                  # KeySim state management
├── keysim-config/                # Keyboard configurations
│   ├── layouts/                  # Keyboard layouts (60%, TKL, etc.)
│   ├── colorways/               # Color schemes (GMK sets, etc.)
│   ├── keymaps/                 # Key mapping definitions
│   └── legends/                 # Key legends and fonts
├── utils/                        # Utility functions
│   ├── colorAnalysis.js         # OpenAI vision integration
│   └── switchSoundMatcher.js    # AI switch matching logic
└── App.tsx                      # Main application component
```

## 🎛️ Key Components

### **RealKeysim.tsx**
- Renders 3D keyboard using the KeySim engine
- Handles color updates and layout changes
- Integrates with physical keyboard events
- Manages WebGL context and fallbacks

### **VirtualKeyboard.tsx** 
- On-screen keyboard for mobile devices
- **Dual functionality**: Sound playback + 3D animation sync
- **Smart event handling**: Synthetic events for 3D, callbacks for sound
- **Physical keyboard sync**: Visual feedback when typing

### **MultiProfileKeyboardSounds.tsx**
- Manages multiple switch sound profiles
- **AI integration**: Automatic switch-sound matching
- **Global keyboard listener**: Captures all physical key presses
- **Audio context management**: Handles browser audio policies

### **App.tsx - State Management**
```typescript
interface KeyboardConfig {
  layout: 'ansi' | 'iso' | '60' | '65' | 'tkl' | 'full'
  switches: 'linear' | 'tactile' | 'clicky'
  keycaps: 'cherry' | 'oem' | 'sa' | 'xda'
  case: 'aluminum' | 'plastic' | 'wood' | 'carbon'
  case_color: string      // Hex color for case
  keycap_color: string    // Hex color for keycaps  
  switch_color: string    // Hex color for switches
}
```

## 🔧 Advanced Features

### **Audio System Implementation**
```typescript
// Global keyboard event capture
document.addEventListener('keydown', (event) => {
  const { key, code } = event
  
  // Convert browser codes to sound triggers
  if (code === 'Space') playKeyboardSound('Space')
  else if (code.startsWith('Key')) playKeyboardSound(key.toUpperCase())
  
  // Handle special keys (Enter, Backspace, etc.)
})

// Synthetic event handling for virtual keyboard
const syntheticEvent = new KeyboardEvent('keydown', {
  code: keyCode,
  key: key,
  bubbles: true
})
// Mark to prevent double sound triggering
syntheticEvent.isSynthetic = true
document.dispatchEvent(syntheticEvent)
```

### **3D-Audio-Virtual Keyboard Sync**
1. **Physical keyboard press** → Sound + 3D animation + Virtual keyboard highlight
2. **Virtual keyboard tap** → Sound via callback + 3D via synthetic events
3. **No double-triggering** via synthetic event filtering

### **Smart Cart Management**
```typescript
const handleAddToCart = async () => {
  // Add multiple products in parallel
  const cartPromises = [
    addToCart(keycapsParams),
    addToCart(switchesParams), 
    addToCart(caseParams)
  ]
  
  await Promise.allSettled(cartPromises)
  
  // Navigate to confirmation page
  setCurrentPage('cart-confirmation')
}
```

### **AI Integration**
- **OpenAI Vision API**: Analyze uploaded images for color extraction
- **Switch matching**: AI recommendations based on product descriptions
- **Color analysis**: Smart color application to 3D models

## 🎨 UI/UX Features

### **Page Flow**
1. **Welcome** - Animated landing with floating keycap
2. **Preferences** - Initial keyboard configuration
3. **Builder** - Main 3D view with product selection
4. **Customizer** - Keycap color customization
5. **Case Customizer** - Case color customization
6. **Cart Confirmation** - Professional checkout flow

### **Responsive Design**
- **Mobile-first approach** with touch-optimized controls
- **Progressive enhancement** for desktop features
- **Adaptive layouts** based on screen size and device capabilities

### **Performance Optimizations**
- **Lazy loading** of 3D assets and audio files
- **Error boundaries** for graceful failure handling
- **Memory management** for WebGL contexts
- **Efficient re-rendering** with React optimization patterns

## 🔊 Audio Profiles Included

- **Holy Pandas** - Tactile premium switches
- **Cherry MX variants** - Linear, tactile, clicky
- **Tealios V2** - Smooth linear switches  
- **Steel Series** - Gaming-optimized switches
- **Banana Split** - Lubed tactile switches

Each profile includes:
- Multiple sound variations per key type
- Special sounds for spacebar, enter, backspace
- Configurable volume and audio processing

## 🛠️ Development Commands

```bash
# Install dependencies
npm install

# Start development server
npm start

# Build for production  
npm run build

# Type checking
npx tsc --noEmit
```

## 🚀 Deployment

This Shop Mini is designed to be deployed through the Shopify Partner Dashboard:

1. Build the application: `npm run build`
2. Upload through Shop Minis CLI
3. Configure product collections and tags
4. Test on mobile devices through Shopify app

## 🔮 Future Enhancements

- **Curated product collections** for better product management
- **Advanced switch customization** with spring weights and lubing options
- **Group buy integration** for custom keycap sets
- **AR visualization** for real-world keyboard placement
- **Community features** with build sharing and ratings

## 🏆 Technical Achievements

- **Real-time 3D rendering** with 60fps performance
- **Seamless audio-visual sync** across multiple input methods
- **Professional e-commerce integration** with Shopify
- **AI-powered product recommendations** 
- **Mobile-optimized** experience with native app feel
- **Comprehensive error handling** and graceful degradation
- **Type-safe** codebase with TypeScript throughout

---

Built with ❤️ for the mechanical keyboard community. This project demonstrates advanced React patterns, 3D graphics programming, audio processing, and e-commerce integration in a cohesive, production-ready application.