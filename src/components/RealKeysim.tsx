import React, { useRef, useEffect } from 'react'
import { store } from '../keysim/store'

interface RealKeysimProps {
  layout?: string
  caseColor?: string
  keycapColor?: string
  switchColor?: string
  className?: string
}

export function RealKeysim({ 
  layout = '80',
  caseColor = '#eeeeee',
  keycapColor = '#f5f5f5', 
  switchColor = '#ff6b6b',
  className = ''
}: RealKeysimProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const keysimInitialized = useRef(false)

  useEffect(() => {
    const initKeysim = async () => {
      if (!containerRef.current || keysimInitialized.current) {
        console.log('🚫 Skipping KeySim init - already initialized or no container')
        return
      }

      try {
        console.log('🚀 Initializing REAL KeySim from GitHub...')
        
        // Clear container first to prevent conflicts
        containerRef.current.innerHTML = ''
        
        // Update store with colors and ensure case is visible
        store.updateState('case', {
          layout: layout,
          primaryColor: caseColor,
          colorSecondary: caseColor,
          style: 'CASE_1', // Use CASE_1 style (should be visible)
          material: 'brushed' // Use brushed material like in defaults
        })
        
        console.log('🏗️ Case configuration:', {
          layout,
          primaryColor: caseColor,
          colorSecondary: caseColor,
          style: 'CASE_1',
          material: 'brushed'
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

        // Import KeySim
        const KeysimApp = await import('../keysim/index.js')
        
        if (KeysimApp.default && containerRef.current) {
          // Initialize KeySim directly in our container
          const keysimInstance = await KeysimApp.default(containerRef.current)
          keysimInitialized.current = true
          console.log('✅ Real KeySim loaded successfully!')
        }
      } catch (error) {
        console.error('Failed to load KeySim:', error)
        // Don't retry on this specific error to prevent loop
        if (!error.message.includes('Can\'t find variable: l')) {
          setTimeout(initKeysim, 3000)
        }
      }
    }

    // Only initialize once
    const timeoutId = setTimeout(initKeysim, 100)

    // Cleanup function
    return () => {
      clearTimeout(timeoutId)
      if (containerRef.current) {
        // Clear container but don't destroy WebGL context aggressively
        try {
          containerRef.current.innerHTML = ''
        } catch (e) {
          console.log('Cleanup completed')
        }
      }
    }
  }, [])

  return (
    <div 
      ref={containerRef}
      className={`w-full h-full ${className}`}
      style={{ 
        minHeight: '300px',
        background: 'transparent',
        position: 'relative'
      }}
    />
  )
}
