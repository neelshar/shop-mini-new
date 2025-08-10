// Three.js compatibility layer for newer versions
import * as THREE_BASE from 'three'

// Legacy Geometry class that mimics old Three.js Geometry API
class LegacyGeometry {
  constructor() {
    this.vertices = []
    this.faces = []
    this.faceVertexUvs = [[]]
    this.type = 'Geometry'
  }

  // Convert to BufferGeometry when needed
  toBufferGeometry() {
    const bufferGeometry = new THREE_BASE.BufferGeometry()
    
    if (this.vertices.length > 0) {
      const positions = []
      const uvs = []
      const indices = []
      
      // Convert vertices
      this.vertices.forEach(vertex => {
        positions.push(vertex.x, vertex.y, vertex.z)
      })
      
      // Convert faces and UVs
      const materialGroups = new Map()
      
      this.faces.forEach((face, faceIndex) => {
        indices.push(face.a, face.b, face.c)
        
        // Track material groups
        const matIndex = face.materialIndex || 0
        if (!materialGroups.has(matIndex)) {
          materialGroups.set(matIndex, [])
        }
        materialGroups.get(matIndex).push(faceIndex)
        
        // Add UVs if they exist
        if (this.faceVertexUvs[0] && this.faceVertexUvs[0][faceIndex]) {
          const faceUvs = this.faceVertexUvs[0][faceIndex]
          faceUvs.forEach(uv => {
            uvs.push(uv.x, uv.y)
          })
        } else {
          // Default UVs
          uvs.push(0, 0, 1, 0, 1, 1)
        }
      })
      
      bufferGeometry.setAttribute('position', new THREE_BASE.Float32BufferAttribute(positions, 3))
      if (uvs.length > 0) {
        bufferGeometry.setAttribute('uv', new THREE_BASE.Float32BufferAttribute(uvs, 2))
      }
      if (indices.length > 0) {
        bufferGeometry.setIndex(indices)
      }
      
      // Add material groups
      bufferGeometry.clearGroups()
      materialGroups.forEach((faces, materialIndex) => {
        faces.forEach(faceIndex => {
          bufferGeometry.addGroup(faceIndex * 3, 3, materialIndex)
        })
      })
      
      bufferGeometry.computeVertexNormals()
    }
    
    return bufferGeometry
  }

  // Compatibility methods
  computeFaceNormals() {
    // Legacy method - no-op for compatibility
  }

  rotateX(angle) {
    this.vertices.forEach(vertex => {
      const y = vertex.y
      const z = vertex.z
      vertex.y = y * Math.cos(angle) - z * Math.sin(angle)
      vertex.z = y * Math.sin(angle) + z * Math.cos(angle)
    })
    return this
  }

  translate(x, y, z) {
    this.vertices.forEach(vertex => {
      vertex.x += x
      vertex.y += y
      vertex.z += z
    })
    return this
  }

  clone() {
    const cloned = new LegacyGeometry()
    cloned.vertices = this.vertices.map(v => v.clone())
    cloned.faces = this.faces.map(f => f.clone())
    cloned.faceVertexUvs = this.faceVertexUvs.map(layer => 
      layer.map(faceUvs => faceUvs.map(uv => uv.clone()))
    )
    return cloned
  }

  toBufferGeometry() {
    console.log('🔄 Converting LegacyGeometry to BufferGeometry with UV mapping...')
    
    const bufferGeometry = new THREE_BASE.BufferGeometry()
    
    // Convert vertices
    const positions = []
    const uvs = []
    const indices = []
    
    this.faces.forEach((face, faceIndex) => {
      const a = this.vertices[face.a]
      const b = this.vertices[face.b] 
      const c = this.vertices[face.c]
      
      // Add vertices
      const startIndex = positions.length / 3
      positions.push(a.x, a.y, a.z)
      positions.push(b.x, b.y, b.z)
      positions.push(c.x, c.y, c.z)
      
      // Add indices
      indices.push(startIndex, startIndex + 1, startIndex + 2)
      
      // Add UV coordinates - FLIP Y TO FIX UPSIDE-DOWN TEXT
      if (this.faceVertexUvs && this.faceVertexUvs[0] && this.faceVertexUvs[0][faceIndex]) {
        const faceUvs = this.faceVertexUvs[0][faceIndex]
        faceUvs.forEach(uv => {
          // FLIP Y coordinate to fix upside-down text (1.0 - y)
          uvs.push(uv.x, 1.0 - uv.y)
        })
        console.log('✅ Added FLIPPED UV coordinates for face', faceIndex, ':', faceUvs.map(uv => `(${uv.x},${1.0 - uv.y})`))
      } else {
        // Default UV coordinates with Y flipped to fix orientation
        uvs.push(0, 0) // top-left (was bottom-left)
        uvs.push(1, 0) // top-right (was bottom-right)  
        uvs.push(0.5, 1) // bottom-center (was top-center)
        console.log('⚠️ Using default FLIPPED UV coordinates for face', faceIndex)
      }
    })
    
    // Set attributes
    bufferGeometry.setAttribute('position', new THREE_BASE.Float32BufferAttribute(positions, 3))
    bufferGeometry.setAttribute('uv', new THREE_BASE.Float32BufferAttribute(uvs, 2))
    bufferGeometry.setIndex(indices)
    
    // Copy material groups if they exist
    if (this.faces.length > 0) {
      bufferGeometry.clearGroups()
      this.faces.forEach((face, i) => {
        bufferGeometry.addGroup(i * 3, 3, face.materialIndex || 0)
      })
    }
    
    bufferGeometry.computeVertexNormals()
    console.log('✅ BufferGeometry conversion complete with', uvs.length/2, 'UV coordinates')
    
    return bufferGeometry
  }
}

// Create a new object that extends THREE with compatibility constants
const THREE = {
  ...THREE_BASE,
  // Add compatibility for removed constants
  LinearEncoding: THREE_BASE.LinearEncoding || 3000,
  sRGBEncoding: THREE_BASE.sRGBEncoding || 3001,
  // Use our legacy geometry class
  Geometry: LegacyGeometry,
  // Keep Face3 for compatibility
  Face3: function Face3(a, b, c, normal, color, materialIndex) {
    this.a = a
    this.b = b
    this.c = c
    this.normal = normal || new THREE_BASE.Vector3()
    this.color = color || new THREE_BASE.Color()
    this.materialIndex = materialIndex || 0
    
    this.clone = function() {
      return new THREE.Face3(this.a, this.b, this.c, this.normal.clone(), this.color.clone(), this.materialIndex)
    }
  }
}

// Export everything
export * from 'three'
export { THREE as default }

// Also export named exports for common usage
export const {
  LinearEncoding,
  sRGBEncoding,
  Geometry,
  Face3,
  WebGLRenderer,
  Scene,
  PerspectiveCamera,
  Object3D,
  Mesh,
  BufferGeometry,
  Material,
  MeshStandardMaterial,
  Vector2,
  Vector3,
  Color,
  TextureLoader,
  CubeTextureLoader,
  Raycaster
} = THREE
