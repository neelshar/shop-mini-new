import React, { Component, ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
    
    // If this is the specific "NotFoundError: The object can not be found here" error
    // that happens when KeySim tries to manipulate DOM that React is managing,
    // we log it but DON'T fallback - we want the real KeySim!
    if ((error.name === 'NotFoundError' || error.message.includes('NotFoundError')) && 
        error.message.includes('object can not be found')) {
      console.log('⚠️ Detected DOM conflict - will retry KeySim initialization')
      // Don't trigger fallback - just retry
      setTimeout(() => {
        window.location.reload() // Last resort - reload to clear DOM state
      }, 2000)
    }
  }

  render() {
    if (this.state.hasError) {
      console.log('🛡️ ErrorBoundary rendering fallback for error:', this.state.error?.message)
      return this.props.fallback || (
        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-900/60 to-slate-800/60 border border-slate-700/50 backdrop-blur-sm rounded-2xl">
          <div className="text-center text-slate-400">
            <div className="text-4xl mb-4">⚠️</div>
            <div className="text-lg mb-2">3D Viewer Error</div>
            <div className="text-sm">Switching to safe mode...</div>
            <div className="text-xs mt-2 opacity-70">
              Detected: {this.state.error?.name || 'Unknown Error'}
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
