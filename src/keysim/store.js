// Simplified Redux-like store for KeySim compatibility
class SimpleStore {
  constructor() {
    this.state = {
      settings: {
        mute: true,
        debug: false,
        testing: false,
        mode: "sidebar",
        sceneAutoColor: true,
        sceneColor: "#cccccc",
        glowColor: "#ffffff",
        highContrast: false,
        paintWithKeys: false
      },
      case: {
        autoColor: true,
        primaryColor: "#eeeeee",
        colorSecondary: "#eeeeee",
        style: "CASE_2",
        bezel: 1,
        layout: "80_default",
        profile: "high",
        material: "brushed"
      },
      keys: {
        visible: true,
        profile: "mx",
        legendPrimaryStyle: "cherry",
        legendSecondaryStyle: "",
        activeBackground: "#51cf59",
        activeColor: "#ffffff"
      },
      switches: {
        stemColor: "red",
        bodyColor: "blue",
        soundProfile: "default"
      },
      colorways: {
        editing: false,
        activeSwatch: "accent",
        active: "modern_dolch",
        custom: []
      }
    }
    this.subscribers = new Map()
  }

  getState() {
    return this.state
  }

  setState(newState) {
    this.state = { ...this.state, ...newState }
    this.notifySubscribers()
  }

  updateState(path, value) {
    const pathArray = path.split('.')
    const newState = { ...this.state }
    let current = newState
    
    for (let i = 0; i < pathArray.length - 1; i++) {
      current[pathArray[i]] = { ...current[pathArray[i]] }
      current = current[pathArray[i]]
    }
    
    current[pathArray[pathArray.length - 1]] = value
    this.state = newState
    this.notifySubscribers(path)
  }

  subscribe(path, callback) {
    if (!this.subscribers.has(path)) {
      this.subscribers.set(path, [])
    }
    this.subscribers.get(path).push(callback)
    
    // Return unsubscribe function
    return () => {
      const callbacks = this.subscribers.get(path)
      if (callbacks) {
        const index = callbacks.indexOf(callback)
        if (index > -1) {
          callbacks.splice(index, 1)
        }
      }
    }
  }

  notifySubscribers(changedPath = null) {
    this.subscribers.forEach((callbacks, path) => {
      if (!changedPath || changedPath.startsWith(path) || path.startsWith(changedPath)) {
        callbacks.forEach(callback => {
          try {
            callback(this.state)
          } catch (error) {
            console.warn('Subscriber callback error:', error)
          }
        })
      }
    })
  }
}

// Create global store instance
export const store = new SimpleStore()

// Compatibility function for KeySim's subscribe
export const subscribe = (path, callback) => {
  return store.subscribe(path, callback)
}

export default store
