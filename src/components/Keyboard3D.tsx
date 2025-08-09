import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Text, RoundedBox } from '@react-three/drei'
import * as THREE from 'three'

interface KeyboardConfig {
  layout: string
  switches: string
  keycaps: string
  case: string
}

interface Keyboard3DProps {
  config: KeyboardConfig
  exploded?: boolean
}

// KeySim-inspired keyboard layout generator
function generateKeyLayout(layout: string) {
  const layouts = {
    'tkl': {
      rows: 6,
      keyCount: 87,
      width: 18,
      height: 6.5,
      keys: [
        // Row 1 - Function keys
        [1, 1, 1, 1, 0.5, 1, 1, 1, 1, 0.5, 1, 1, 1, 1, 0.25, 1, 1, 1],
        // Row 2 - Number row
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 0.25, 1, 1, 1],
        // Row 3 - QWERTY row
        [1.5, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1.5, 0.25, 1, 1, 1],
        // Row 4 - ASDF row
        [1.75, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2.25, 0, 0, 0, 0, 0],
        // Row 5 - ZXCV row
        [2.25, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2.75, 0, 0, 1, 0, 0],
        // Row 6 - Bottom row
        [1.25, 1.25, 1.25, 6.25, 1.25, 1.25, 1.25, 1.25, 0.25, 1, 1, 1]
      ]
    },
    '60': {
      rows: 5,
      keyCount: 61,
      width: 15,
      height: 5,
      keys: [
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2],
        [1.5, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1.5],
        [1.75, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2.25],
        [2.25, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2.75],
        [1.25, 1.25, 1.25, 6.25, 1.25, 1.25, 1.25, 1.25]
      ]
    },
    'full': {
      rows: 6,
      keyCount: 104,
      width: 22.5,
      height: 6.5,
      keys: [
        [1, 1, 1, 1, 0.5, 1, 1, 1, 1, 0.5, 1, 1, 1, 1, 0.25, 1, 1, 1, 0.25, 1, 1, 1, 1],
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 0.25, 1, 1, 1, 0.25, 1, 1, 1, 1],
        [1.5, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1.5, 0.25, 1, 1, 1, 0.25, 1, 1, 1, 1],
        [1.75, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2.25, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1],
        [2.25, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2.75, 0, 0, 1, 0, 0, 0, 1, 1, 1, 1],
        [1.25, 1.25, 1.25, 6.25, 1.25, 1.25, 1.25, 1.25, 0.25, 1, 1, 1, 0.25, 1, 1, 1]
      ]
    }
  }
  
  return layouts[layout as keyof typeof layouts] || layouts.tkl
}

// Individual keycap component
function Keycap({ position, size, material, profile }: { 
  position: [number, number, number]
  size: [number, number] 
  material: string
  profile: string
}) {
  const meshRef = useRef<THREE.Mesh>(null)
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.5) * 0.02
      meshRef.current.rotation.z = Math.cos(state.clock.elapsedTime * 0.7) * 0.01
    }
  })

  const keycapHeight = profile === 'sa' ? 0.4 : profile === 'cherry' ? 0.25 : 0.3
  const keycapColor = material === 'white' ? '#f8f9fa' : 
                      material === 'black' ? '#212529' : 
                      material === 'purple' ? '#8b5cf6' : '#e9ecef'

  return (
    <group position={position}>
      <RoundedBox
        ref={meshRef}
        args={[size[0], keycapHeight, size[1]]}
        radius={0.05}
        smoothness={4}
      >
        <meshStandardMaterial 
          color={keycapColor}
          roughness={0.2}
          metalness={0.1}
        />
      </RoundedBox>
      
      {/* Keycap shine effect */}
      <RoundedBox
        args={[size[0] * 0.8, keycapHeight + 0.001, size[1] * 0.8]}
        radius={0.03}
        position={[0, keycapHeight/2 + 0.001, 0]}
      >
        <meshStandardMaterial 
          color={keycapColor}
          roughness={0.1}
          metalness={0.3}
          transparent
          opacity={0.8}
        />
      </RoundedBox>
    </group>
  )
}

// Switch component
function Switch({ position, type }: { position: [number, number, number], type: string }) {
  const meshRef = useRef<THREE.Mesh>(null)
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 2 + position[0]) * 0.02
    }
  })

  const switchColor = type === 'linear' ? '#ef4444' : 
                      type === 'tactile' ? '#f59e0b' : 
                      type === 'clicky' ? '#3b82f6' : '#6b7280'

  return (
    <group position={position}>
      {/* Switch housing */}
      <RoundedBox
        ref={meshRef}
        args={[0.6, 0.3, 0.6]}
        radius={0.02}
      >
        <meshStandardMaterial 
          color="#2d3748"
          roughness={0.3}
          metalness={0.7}
        />
      </RoundedBox>
      
      {/* Switch stem */}
      <RoundedBox
        args={[0.2, 0.4, 0.2]}
        radius={0.01}
        position={[0, 0.2, 0]}
      >
        <meshStandardMaterial 
          color={switchColor}
          roughness={0.4}
          metalness={0.2}
        />
      </RoundedBox>
    </group>
  )
}

// Main keyboard case
function KeyboardCase({ layout, material, exploded }: { 
  layout: ReturnType<typeof generateKeyLayout>
  material: string 
  exploded: boolean
}) {
  const meshRef = useRef<THREE.Mesh>(null)
  
  useFrame((state) => {
    if (meshRef.current && exploded) {
      meshRef.current.position.y = -2 + Math.sin(state.clock.elapsedTime * 0.8) * 0.1
    }
  })

  const caseColor = material === 'aluminum' ? '#64748b' :
                    material === 'plastic' ? '#374151' :
                    material === 'wood' ? '#92400e' :
                    material === 'carbon' ? '#111827' : '#64748b'

  const metalness = material === 'aluminum' ? 0.9 : 
                    material === 'carbon' ? 0.8 : 0.2

  return (
    <group position={exploded ? [0, -2, 0] : [0, -0.5, 0]}>
      {/* Main case body */}
      <RoundedBox
        ref={meshRef}
        args={[layout.width, 0.8, layout.height]}
        radius={0.3}
      >
        <meshStandardMaterial 
          color={caseColor}
          roughness={0.3}
          metalness={metalness}
        />
      </RoundedBox>
      
      {/* Case interior */}
      <RoundedBox
        args={[layout.width - 0.4, 0.6, layout.height - 0.4]}
        radius={0.2}
        position={[0, 0.1, 0]}
      >
        <meshStandardMaterial 
          color="#1a1a1a"
          roughness={0.8}
          metalness={0.1}
        />
      </RoundedBox>
    </group>
  )
}

// Main 3D Keyboard component
export function Keyboard3D({ config, exploded = false }: Keyboard3DProps) {
  const groupRef = useRef<THREE.Group>(null)
  const layout = useMemo(() => generateKeyLayout(config.layout), [config.layout])
  
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.2) * 0.1
    }
  })

  // Generate key positions from layout
  const keyPositions = useMemo(() => {
    const positions: Array<{ pos: [number, number, number], size: [number, number] }> = []
    let globalY = 0
    
    layout.keys.forEach((row, rowIndex) => {
      let currentX = -layout.width / 2
      
      row.forEach((keyWidth) => {
        if (keyWidth > 0) {
          positions.push({
            pos: [currentX + (keyWidth / 2), globalY, 0],
            size: [keyWidth * 0.9, 0.9]
          })
        }
        currentX += keyWidth
      })
      
      globalY -= 1
    })
    
    return positions
  }, [layout])

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      {/* Keyboard Case */}
      <KeyboardCase 
        layout={layout} 
        material={config.case} 
        exploded={exploded}
      />
      
      {/* Switches */}
      {keyPositions.map((key, index) => (
        <Switch
          key={`switch-${index}`}
          position={[
            key.pos[0], 
            exploded ? 1 : -0.1, 
            key.pos[2]
          ]}
          type={config.switches}
        />
      ))}
      
      {/* Keycaps */}
      {keyPositions.map((key, index) => (
        <Keycap
          key={`keycap-${index}`}
          position={[
            key.pos[0], 
            exploded ? 3 : 0.2, 
            key.pos[2]
          ]}
          size={key.size}
          material={config.keycaps}
          profile={config.keycaps}
        />
      ))}
      
      {/* Assembly guides when exploded */}
      {exploded && (
        <>
          {/* Vertical connection lines */}
          {keyPositions.slice(0, 5).map((key, index) => (
            <group key={`guide-${index}`}>
              <mesh position={[key.pos[0], 1.5, key.pos[2]]}>
                <cylinderGeometry args={[0.005, 0.005, 3.5]} />
                <meshBasicMaterial 
                  color="#60a5fa" 
                  transparent 
                  opacity={0.4}
                />
              </mesh>
            </group>
          ))}
        </>
      )}
    </group>
  )
} 