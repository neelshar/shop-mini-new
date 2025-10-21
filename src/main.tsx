import {StrictMode} from 'react'
import React from 'react'
import {createRoot} from 'react-dom/client'
import './index.css'
import {MinisContainer} from '@shopify/shop-minis-react'
import '@fontsource/orbitron/400.css'
import '@fontsource/orbitron/700.css'
import '@fontsource/orbitron/900.css'
import '@fontsource/space-grotesk/300.css'
import '@fontsource/space-grotesk/400.css'
import '@fontsource/space-grotesk/500.css'

import {App} from './App'

// Error boundary component to catch JavaScript errors
interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

interface ErrorBoundaryProps {
  children: React.ReactNode
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('App Error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-slate-950 to-zinc-950 p-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-red-400 mb-4">
              ⚠️ App Error
            </h1>
            <p className="text-slate-400 text-lg mb-8">
              Something went wrong loading the app
            </p>
            <div className="bg-red-600/20 border border-red-500/40 text-red-300 font-medium py-4 px-6 rounded-xl max-w-2xl mx-auto">
              <pre className="text-left text-sm">{this.state.error?.toString()}</pre>
            </div>
            <button 
              onClick={() => window.location.reload()}
              className="mt-4 bg-blue-600 text-white px-4 py-2 rounded"
            >
              Reload App
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <MinisContainer>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </MinisContainer>
  </StrictMode>
)
