import React, { useRef, useEffect } from 'react'
import { store } from '../keysim/store'

interface KeysimPortalProps {
  layout?: string
  caseColor?: string
  keycapColor?: string
  switchColor?: string
}

export function KeysimPortal({ 
  layout = '80',
  caseColor = '#eeeeee',
  keycapColor = '#f5f5f5', 
  switchColor = '#ff6b6b'
}: KeysimPortalProps) {
  const portalRef = useRef<HTMLDivElement | null>(null)
  const keysimRef = useRef<any>(null)

  useEffect(() => {
    // Create a portal div outside React's control
    const portalDiv = document.createElement('div')
    portalDiv.id = 'keysim-portal-' + Date.now()
    portalDiv.style.position = 'fixed'
    portalDiv.style.top = '0'
    portalDiv.style.left = '0'
    portalDiv.style.width = '100vw'
    portalDiv.style.height = '100vh'
    portalDiv.style.pointerEvents = 'none'
    portalDiv.style.zIndex = '9999'
    
    // Add to body
    document.body.appendChild(portalDiv)
    portalRef.current = portalDiv

    // Initialize KeySim after a delay
    const initTimer = setTimeout(async () => {
      try {
        // Update store
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
        if (KeysimApp.default && portalDiv) {
          keysimRef.current = await KeysimApp.default(portalDiv)
          console.log('✅ KeySim initialized in portal!')
        }
      } catch (error) {
        console.error('Failed to initialize KeySim in portal:', error)
      }
    }, 500)

    // Cleanup
    return () => {
      clearTimeout(initTimer)
      if (portalRef.current) {
        document.body.removeChild(portalRef.current)
      }
    }
  }, [])

  // Update colors
  useEffect(() => {
    if (keysimRef.current) {
      store.updateState('case', {
        layout: layout,
        primaryColor: caseColor,
        colorSecondary: caseColor
      })
    }
  }, [layout, caseColor])

  useEffect(() => {
    if (keysimRef.current) {
      store.updateState('colorways', {
        active: 'custom',
        custom: [{
          case: caseColor,
          keycaps: keycapColor,
          switches: switchColor,
          accent: switchColor
        }]
      })
    }
  }, [caseColor, keycapColor, switchColor])

  return null // Portal renders outside React tree
}
