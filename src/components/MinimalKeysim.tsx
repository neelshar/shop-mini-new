import React, { useRef, useEffect } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

interface MinimalKeysimProps {
  layout?: 'tkl' | '60' | '65' | 'full' | 'ansi' | 'iso'
  caseColor?: string
  keycapColor?: string
  switchColor?: string
  className?: string
}

export function MinimalKeysim({ 
  layout = 'tkl',
  caseColor = '#eeeeee',
  keycapColor = '#f5f5f5', 
  switchColor = '#ff6b6b',
  className = ''
}: MinimalKeysimProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<{
    scene: THREE.Scene
    camera: THREE.PerspectiveCamera
    renderer: THREE.WebGLRenderer
    controls: OrbitControls
    animationId?: number
  } | null>(null)

  useEffect(() => {
    if (!containerRef.current) return

    // Clear any existing content
    containerRef.current.innerHTML = ''

    try {
      // Scene setup
      const scene = new THREE.Scene()
      scene.background = new THREE.Color(0x1a1a2e)

      // Camera
      const camera = new THREE.PerspectiveCamera(
        50,
        containerRef.current.clientWidth / containerRef.current.clientHeight,
        0.1,
        1000
      )
      camera.position.set(0, 8, 12)

      // Renderer
      const renderer = new THREE.WebGLRenderer({ 
        antialias: true,
        alpha: true
      })
      renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight)
      renderer.setPixelRatio(window.devicePixelRatio)
      renderer.shadowMap.enabled = true
      renderer.shadowMap.type = THREE.PCFSoftShadowMap
      containerRef.current.appendChild(renderer.domElement)

      // Controls
      const controls = new OrbitControls(camera, renderer.domElement)
      controls.enableDamping = true
      controls.dampingFactor = 0.05
      controls.maxDistance = 25
      controls.minDistance = 5
      controls.maxPolarAngle = Math.PI / 2

      // Lighting
      const ambientLight = new THREE.AmbientLight(0x404040, 0.4)
      scene.add(ambientLight)

      const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8)
      directionalLight.position.set(10, 10, 5)
      directionalLight.castShadow = true
      scene.add(directionalLight)

      const pointLight = new THREE.PointLight(0xffffff, 0.3, 100)
      pointLight.position.set(-10, 10, -10)
      scene.add(pointLight)

      // Keyboard geometry
      const keyboardGroup = new THREE.Group()

      // Case
      const caseGeometry = new THREE.BoxGeometry(18, 1.5, 6)
      const caseMaterial = new THREE.MeshLambertMaterial({ color: caseColor })
      const caseMesh = new THREE.Mesh(caseGeometry, caseMaterial)
      caseMesh.position.y = -0.75
      caseMesh.castShadow = true
      caseMesh.receiveShadow = true
      keyboardGroup.add(caseMesh)

      // Keys layout
      const keySize = 0.9
      const keySpacing = 1
      const layouts = {
        'tkl': { rows: 6, cols: 17 },
        '60': { rows: 5, cols: 15 },
        '65': { rows: 5, cols: 16 },
        'full': { rows: 6, cols: 21 },
        'ansi': { rows: 6, cols: 17 },
        'iso': { rows: 6, cols: 17 }
      }
      
      const currentLayout = layouts[layout]
      
      // Create keys
      for (let row = 0; row < currentLayout.rows; row++) {
        for (let col = 0; col < currentLayout.cols; col++) {
          // Skip some keys for realistic layouts
          if (layout === '60' && row === 0 && col > 14) continue
          if (layout === '60' && row === 5) continue

          // Switch housing
          const switchGeometry = new THREE.BoxGeometry(keySize * 0.8, 0.5, keySize * 0.8)
          const switchMaterial = new THREE.MeshLambertMaterial({ color: switchColor })
          const switchMesh = new THREE.Mesh(switchGeometry, switchMaterial)
          
          // Keycap
          const keycapGeometry = new THREE.BoxGeometry(keySize, 0.3, keySize)
          const keycapMaterial = new THREE.MeshLambertMaterial({ color: keycapColor })
          const keycapMesh = new THREE.Mesh(keycapGeometry, keycapMaterial)
          
          // Position
          const x = (col - currentLayout.cols / 2) * keySpacing
          const z = (row - currentLayout.rows / 2) * keySpacing
          
          switchMesh.position.set(x, 0, z)
          keycapMesh.position.set(x, 0.4, z)
          
          switchMesh.castShadow = true
          keycapMesh.castShadow = true
          keycapMesh.receiveShadow = true
          
          keyboardGroup.add(switchMesh)
          keyboardGroup.add(keycapMesh)
        }
      }

      scene.add(keyboardGroup)

      // Store reference before starting animation
      sceneRef.current = { scene, camera, renderer, controls }

      // Animation
      const animate = () => {
        if (!sceneRef.current) return // Safety check
        
        controls.update()
        
        // Gentle floating animation
        keyboardGroup.position.y = Math.sin(Date.now() * 0.001) * 0.1
        keyboardGroup.rotation.y = Math.sin(Date.now() * 0.0005) * 0.02

        renderer.render(scene, camera)
        sceneRef.current.animationId = requestAnimationFrame(animate)
      }
      animate()

      // Handle resize
      const handleResize = () => {
        if (!containerRef.current) return
        
        camera.aspect = containerRef.current.clientWidth / containerRef.current.clientHeight
        camera.updateProjectionMatrix()
        renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight)
      }
      window.addEventListener('resize', handleResize)



      return () => {
        window.removeEventListener('resize', handleResize)
        if (sceneRef.current?.animationId) {
          cancelAnimationFrame(sceneRef.current.animationId)
        }
        sceneRef.current = null // Clear reference
        if (containerRef.current && renderer.domElement.parentNode) {
          containerRef.current.removeChild(renderer.domElement)
        }
        renderer.dispose()
      }
    } catch (error) {
      console.error('Failed to initialize 3D keyboard:', error)
      // Show error message
      if (containerRef.current) {
        containerRef.current.innerHTML = `
          <div style="
            display: flex; 
            align-items: center; 
            justify-content: center; 
            height: 100%; 
            color: #64748b; 
            font-size: 14px;
            background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
            border-radius: 1rem;
          ">
            <div style="text-align: center;">
              <div style="margin-bottom: 8px; font-size: 2rem;">⌨️</div>
              <div>3D Keyboard Error</div>
              <div style="font-size: 12px; margin-top: 4px;">Check console for details</div>
            </div>
          </div>
        `
      }
    }
  }, [layout])

  // Update colors when props change
  useEffect(() => {
    if (sceneRef.current) {
      // Update materials
      sceneRef.current.scene.traverse((child: any) => {
        if (child instanceof THREE.Mesh) {
          if (child.material instanceof THREE.MeshLambertMaterial) {
            // Simple color update - you could make this more sophisticated
            if (child.geometry instanceof THREE.BoxGeometry) {
              const size = child.geometry.parameters
              if (size.height > 1) {
                // Case
                child.material.color.setStyle(caseColor)
              } else if (size.height > 0.4) {
                // Switch
                child.material.color.setStyle(switchColor)
              } else {
                // Keycap
                child.material.color.setStyle(keycapColor)
              }
            }
          }
        }
      })
    }
  }, [caseColor, keycapColor, switchColor])

  return (
    <div 
      ref={containerRef}
      className={`w-full h-full ${className}`}
      style={{ 
        minHeight: '300px',
        background: 'transparent'
      }}
    />
  )
}
