// WebGL capability checking utility
export function checkWebGLSupport() {
  try {
    const canvas = document.createElement('canvas')
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
    
    if (!gl) {
      return { supported: false, reason: 'WebGL not available' }
    }
    
    // Test basic WebGL functionality
    try {
      gl.getShaderPrecisionFormat(gl.VERTEX_SHADER, gl.HIGH_FLOAT)
      gl.getExtension('OES_standard_derivatives')
      
      // Test if we can create a basic shader
      const vertexShader = gl.createShader(gl.VERTEX_SHADER)
      const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER)
      
      if (!vertexShader || !fragmentShader) {
        return { supported: false, reason: 'Cannot create shaders' }
      }
      
      // Clean up test shaders
      gl.deleteShader(vertexShader)
      gl.deleteShader(fragmentShader)
      
      return { supported: true }
    } catch (e) {
      return { supported: false, reason: 'WebGL context unstable: ' + e.message }
    }
  } catch (e) {
    return { supported: false, reason: 'WebGL check failed: ' + e.message }
  }
}

export function isWebGLContextLost(canvas) {
  if (!canvas) return true
  
  try {
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
    return !gl || gl.isContextLost()
  } catch (e) {
    return true
  }
}
