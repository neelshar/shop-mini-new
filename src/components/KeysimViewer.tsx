import React, { useRef, useEffect, useState } from 'react'
import ReactDOM from 'react-dom'
import { store } from '../keysim/store'
import { MinimalKeysim } from './MinimalKeysim'
import { ErrorBoundary } from './ErrorBoundary'
import { checkWebGLSupport, isWebGLContextLost } from '../keysim/webgl-check'

interface KeysimViewerProps {
  layout?: string
  caseColor?: string
  keycapColor?: string
  switchColor?: string
  className?: string
}

export function KeysimViewer({ 
  layout = '80', // Use KeySim's layout naming
  caseColor = '#eeeeee',
  keycapColor = '#f5f5f5', 
  switchColor = '#ff6b6b',
  className = ''
}: KeysimViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const threeAppRef = useRef<any>(null)
  const keysimInstanceRef = useRef<any>(null)
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'fallback'>('loading')
  const [errorMessage, setErrorMessage] = useState<string>('')
  const [retryCount, setRetryCount] = useState<number>(0)
  const [forceFallback, setForceFallback] = useState<boolean>(false)

  useEffect(() => {
    if (!containerRef.current) return

    const initKeysim = async () => {
      try {
        setStatus('loading')
        
        // Clear any existing KeySim instance
        if (keysimInstanceRef.current) {
          try {
            // Clean up any existing Three.js resources
            if (keysimInstanceRef.current.dispose) {
              keysimInstanceRef.current.dispose()
            }
          } catch (e) {
            console.warn('Error disposing existing KeySim:', e)
          }
          keysimInstanceRef.current = null
        }
        
        // Clear any existing content first
        const container = containerRef.current!
        
        // Safely clear container
        while (container.firstChild) {
          try {
            container.removeChild(container.firstChild)
          } catch (e) {
            console.warn('Error removing child:', e)
            break
          }
        }
        
        // Check WebGL support before proceeding
        const webglCheck = checkWebGLSupport()
        if (!webglCheck.supported) {
          throw new Error(webglCheck.reason + ' - falling back to safe mode')
        }
        
        // Wait multiple frames to ensure DOM is stable
        await new Promise(resolve => setTimeout(resolve, 300))
        
        // Double check container still exists after delay
        if (!containerRef.current) {
          throw new Error('Container was removed during initialization')
        }
        
        // Create a wrapper div to COMPLETELY isolate KeySim from React
        const keysimWrapper = document.createElement('div')
        keysimWrapper.style.width = '100%'
        keysimWrapper.style.height = '100%'
        keysimWrapper.style.position = 'absolute'
        keysimWrapper.style.top = '0'
        keysimWrapper.style.left = '0'
        keysimWrapper.style.overflow = 'hidden'
        keysimWrapper.style.background = 'transparent'
        keysimWrapper.style.pointerEvents = 'auto'
        keysimWrapper.style.zIndex = '1'
        keysimWrapper.id = 'keysim-wrapper-' + Date.now()
        
        // Mark this element to prevent React from touching it
        Object.defineProperty(keysimWrapper, '_reactInternalFiber', {
          get: () => undefined,
          set: () => {},
          configurable: false
        })
        Object.defineProperty(keysimWrapper, '_reactInternalInstance', {
          get: () => undefined,
          set: () => {},
          configurable: false
        })
        
        // Add WebGL context loss handlers
        keysimWrapper.addEventListener('webglcontextlost', (event) => {
          console.warn('WebGL context lost, preventing default and attempting recovery')
          event.preventDefault()
          // Try to restore context
          setTimeout(() => {
            if (containerRef.current) {
              console.log('Attempting to restore WebGL context...')
              const canvas = keysimWrapper.querySelector('canvas') as HTMLCanvasElement
              if (canvas) {
                const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
                if (gl && !(gl as WebGLRenderingContext).isContextLost()) {
                  console.log('✅ WebGL context restored!')
                } else {
                  console.log('⏳ Retrying KeySim initialization...')
                  setRetryCount(0)
                  initKeysim()
                }
              }
            }
          }, 500)
        })
        
        keysimWrapper.addEventListener('webglcontextrestored', (event) => {
          console.log('WebGL context restored')
          // Context restored, but we'll stay in current state for stability
        })
        
        // Add additional error event listeners
        keysimWrapper.addEventListener('error', (event) => {
          console.warn('KeySim wrapper error:', event)
          if (containerRef.current) {
            setStatus('fallback')
          }
        })
        
        containerRef.current.appendChild(keysimWrapper)
        
        // Update store with current props first
        store.updateState('case', {
          layout: layout,
          primaryColor: caseColor,
          colorSecondary: caseColor
        })
        
        store.updateState('colorways', {
          active: 'custom',
          custom: [{
            case: caseColor,
            keycaps: keycapColor,
            switches: switchColor,
            accent: switchColor
          }]
        })
        
        // Import and initialize KeySim
        const KeysimApp = await import('../keysim/index.js')
        
        // Final check before initialization
        if (!containerRef.current || !keysimWrapper.parentNode) {
          throw new Error('Container was removed during initialization')
        }
        
        // Initialize KeySim with our isolated wrapper
        if (KeysimApp.default) {
          // Wrap KeySim initialization in additional error handling
          try {
            const keysimInstance = await KeysimApp.default(keysimWrapper)
            
            // Verify the initialization actually worked
            if (!keysimWrapper.querySelector('canvas')) {
              throw new Error('KeySim failed to create canvas')
            }
            
            keysimInstanceRef.current = keysimInstance
            threeAppRef.current = keysimWrapper
            setStatus('success')
            setRetryCount(0)
            
            // Set up a watchdog to detect if KeySim stops working
            const watchdog = setTimeout(() => {
              const canvas = keysimWrapper.querySelector('canvas') as HTMLCanvasElement
              if (isWebGLContextLost(canvas)) {
                console.warn('WebGL context lost detected by watchdog')
                setStatus('fallback')
              }
            }, 5000)
            
            // Store watchdog for cleanup
            if (keysimInstanceRef.current) {
              keysimInstanceRef.current.watchdog = watchdog
            }
          } catch (initError) {
            console.error('KeySim initialization failed:', initError)
            throw initError
          }
        } else {
          throw new Error('KeySim module not found')
        }
      } catch (error) {
        console.error('Failed to load KeySim (attempt ' + (retryCount + 1) + '):', error)
        
        // ALWAYS retry KeySim - we want the real thing!
        if (retryCount < 3) {
          console.log('🔄 Retrying KeySim initialization (attempt ' + (retryCount + 2) + '/4)...')
          setRetryCount(prev => prev + 1)
          setTimeout(() => {
            if (containerRef.current) {
              initKeysim()
            }
          }, 1500)
        } else {
          // After 4 attempts, keep trying but slower
          console.log('⏳ Will retry KeySim in 5 seconds...')
          setTimeout(() => {
            if (containerRef.current) {
              setRetryCount(0)
              initKeysim()
            }
          }, 5000)
        }
      }
    }

    // Listen for force fallback events
    const handleForceFallback = (event: any) => {
      console.log('🔄 Force fallback triggered:', event.detail?.reason)
      setForceFallback(true)
      setStatus('fallback')
      setErrorMessage('Switched to safe mode: ' + (event.detail?.reason || 'Unknown'))
    }
    
    window.addEventListener('keysim-force-fallback', handleForceFallback)
    
    // Add a small delay to ensure component is fully mounted
    const timeoutId = setTimeout(initKeysim, 100)

    // Cleanup function
    return () => {
      clearTimeout(timeoutId)
      window.removeEventListener('keysim-force-fallback', handleForceFallback)
      
      // Clean up KeySim instance
      if (keysimInstanceRef.current) {
        try {
          // Clear watchdog
          if (keysimInstanceRef.current.watchdog) {
            clearTimeout(keysimInstanceRef.current.watchdog)
          }
          
          // Dispose Three.js resources
          if (keysimInstanceRef.current.dispose) {
            keysimInstanceRef.current.dispose()
          }
        } catch (e) {
          console.warn('Error disposing KeySim instance:', e)
        }
        keysimInstanceRef.current = null
      }
      
      // Clean up DOM safely
      if (containerRef.current) {
        try {
          const container = containerRef.current
          // Use a safer approach to clear children
          const children = Array.from(container.children)
          children.forEach(child => {
            try {
              if (child.parentNode === container) {
                container.removeChild(child)
              }
            } catch (e) {
              console.warn('Error removing child during cleanup:', e)
            }
          })
        } catch (e) {
          console.warn('Cleanup error:', e)
        }
      }
      
      threeAppRef.current = null
    }
  }, []) // Only run once on mount

  // Update colors when props change (only for KeySim, not fallback)
  useEffect(() => {
    if (threeAppRef.current && status === 'success') {
      try {
        store.updateState('case', {
          layout: layout,
          primaryColor: caseColor,
          colorSecondary: caseColor
        })
      } catch (e) {
        console.warn('Error updating case colors:', e)
      }
    }
  }, [layout, caseColor, status])

  useEffect(() => {
    if (threeAppRef.current && status === 'success') {
      try {
        store.updateState('colorways', {
          active: 'custom',
          custom: [{
            case: caseColor,
            keycaps: keycapColor,
            switches: switchColor,
            accent: switchColor
          }]
        })
      } catch (e) {
        console.warn('Error updating colorways:', e)
      }
    }
  }, [caseColor, keycapColor, switchColor, status])

  const renderContent = () => {
    if (status === 'loading') {
      return (
        <div style={{
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          height: '100%', 
          color: '#64748b', 
          fontSize: '14px',
          background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
          borderRadius: '1rem',
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ marginBottom: '8px', fontSize: '2rem' }}>⌨️</div>
            <div>Loading High-Quality KeySim...</div>
            <div style={{ fontSize: '12px', marginTop: '4px' }}>Initializing 3D engine...</div>
          </div>
        </div>
      )
    }

    if (status === 'error') {
      return (
        <div style={{
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          height: '100%', 
          color: '#ef4444', 
          fontSize: '14px',
          background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
          borderRadius: '1rem',
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ marginBottom: '8px', fontSize: '2rem' }}>❌</div>
            <div>KeySim Failed to Load</div>
            <div style={{ fontSize: '12px', marginTop: '4px' }}>Error: {errorMessage}</div>
          </div>
        </div>
      )
    }

    return null // KeySim canvas will be rendered here
  }

  // Never show fallback - always try to show real KeySim
  if (status === 'fallback') {
    console.log('🔄 Status is fallback but we want real KeySim - retrying...')
    setTimeout(() => {
      setStatus('loading')
      setRetryCount(0)
    }, 1000)
  }

  // Use a callback ref to ensure DOM stability
  const setContainerRef = (node: HTMLDivElement | null) => {
    if (node && !containerRef.current) {
      // Use type assertion to bypass readonly restriction
      (containerRef as React.MutableRefObject<HTMLDivElement | null>).current = node
      // Initialize KeySim once the DOM is ready
      setTimeout(() => {
        const initKeysim = async () => {
          try {
            const KeysimApp = await import('../keysim/index.js')
            if (KeysimApp.default && containerRef.current) {
              // Create wrapper inside the stable container
              const wrapper = document.createElement('div')
              wrapper.style.width = '100%'
              wrapper.style.height = '100%'
              containerRef.current.appendChild(wrapper)
              
              await KeysimApp.default(wrapper)
              setStatus('success')
              console.log('✅ KeySim initialized successfully!')
            }
          } catch (error) {
            console.error('KeySim initialization error:', error)
            setRetryCount(prev => prev + 1)
          }
        }
        initKeysim()
      }, 500)
    }
  }

  return (
    <div 
      ref={setContainerRef}
      className={`w-full h-full ${className}`}
      style={{ 
        minHeight: '300px',
        background: 'transparent',
        position: 'relative'
      }}
      data-keysim-container="true"
    >
      {status === 'loading' && renderContent()}
    </div>
  )
}
