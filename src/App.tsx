import { useState, useEffect } from 'react'
import { RealKeysim } from './components/RealKeysim'
import { ComponentSearchModal } from './components/ComponentSearchModal'

// Types for our keyboard configuration
interface KeyboardConfig {
  layout: 'ansi' | 'iso' | '60' | '65' | 'tkl' | 'full'
  switches: 'linear' | 'tactile' | 'clicky'
  keycaps: 'cherry' | 'oem' | 'sa' | 'xda'
  case: 'aluminum' | 'plastic' | 'wood' | 'carbon'
  plate: 'steel' | 'aluminum' | 'brass' | 'pc'
  stabilizers: 'cherry' | 'durock' | 'zeal'
  case_color: string
  keycap_color: string
  switch_color: string
}

type AppPage = 'welcome' | 'preferences' | 'builder' | 'customizer'



export function App() {
  const [currentPage, setCurrentPage] = useState<AppPage>('welcome')
  const [keyboardConfig, setKeyboardConfig] = useState<KeyboardConfig>({
    layout: 'tkl',
    switches: 'tactile',
    keycaps: 'cherry',
    case: 'aluminum',
    plate: 'aluminum',
    stabilizers: 'durock',
    case_color: '#f5f5f5', // Light grey case
    keycap_color: '#ffffff', // Pure white keycaps
    switch_color: '#2a2a2a' // Dark grey switches
  })
  const [isLoaded, setIsLoaded] = useState(false)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [nextPage, setNextPage] = useState<AppPage | null>(null)
  
  // Product search/select states
  const [selectedComponent, setSelectedComponent] = useState<'keycaps' | 'switches' | 'case' | null>(null)
  const [selectedProducts, setSelectedProducts] = useState<{
    keycaps: any | null
    switches: any | null
    case: any | null
  }>({
    keycaps: null,
    switches: null,
    case: null
  })

  // Simple cart state
  const [isCartOpen, setIsCartOpen] = useState(false)

  useEffect(() => {
    // Trigger animations after component mounts
    const timer = setTimeout(() => setIsLoaded(true), 100)
    return () => clearTimeout(timer)
  }, [])

  // Smooth page transition function
  const navigateToPage = (page: AppPage) => {
    if (page === currentPage || isTransitioning) return
    
    setIsTransitioning(true)
    setNextPage(page)
    
    // Delay to show exit animation, then change page
    setTimeout(() => {
      setCurrentPage(page)
      setIsTransitioning(false)
      setNextPage(null)
    }, 300)
  }

  // Handle product selection
  const handleProductSelect = (product: any, componentType: 'keycaps' | 'switches' | 'case') => {
    console.log(`Selected ${componentType}:`, product)
    console.log('Product price structure:', {
      priceRange: product.priceRange,
      minVariantPrice: product.priceRange?.minVariantPrice,
      amount: product.priceRange?.minVariantPrice?.amount
    })
    setSelectedProducts(prev => ({
      ...prev,
      [componentType]: product
    }))
  }

  // Simple cart calculation
  const calculateCartTotal = () => {
    let total = 0
    
    const getPrice = (product: any) => {
      if (!product) return 0
      const price = product.priceRange?.minVariantPrice?.amount ||
                   product.priceRange?.min?.amount ||
                   product.variants?.[0]?.priceV2?.amount ||
                   product.variants?.[0]?.price ||
                   product.price?.amount ||
                   product.price
      return price ? parseFloat(price) : 0
    }
    
    if (selectedProducts.keycaps) total += getPrice(selectedProducts.keycaps)
    if (selectedProducts.switches) total += getPrice(selectedProducts.switches)
    if (selectedProducts.case) total += getPrice(selectedProducts.case)
    
    return total > 0 ? total : 399
  }

  // Welcome Page - Clean Minimalistic Design with Blue Accents
  if (currentPage === 'welcome') {
    return (
      <div className={`min-h-screen bg-gradient-subtle-blue ${isTransitioning ? 'page-exit' : 'page-enter-zoom'}`}>
        <div className="section-padding max-w-4xl mx-auto">
          {/* Hero Section */}
            <div className="text-center mb-16">
            {/* Clean Logo */}
            <div className={`mb-8 transform transition-all duration-700 ${
              isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}>
              <div className="w-20 h-20 mx-auto minimal-card flex items-center justify-center animate-float">
                <div className="w-8 h-8 bg-dark rounded-md flex items-center justify-center">
                  <span className="text-white font-bold text-lg">K</span>
                      </div>
                    </div>
                  </div>
                  
            {/* Clean Typography */}
            <div className={`mb-6 transform transition-all duration-700 delay-200 ${
              isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}>
              <h1 className="text-display text-primary mb-4">
                Custom Keyboards
                </h1>
              <p className="text-body text-secondary max-w-md mx-auto">
                Design and build your perfect mechanical keyboard with precision and style
              </p>
              </div>
              
            {/* CTA Button */}
            <div className={`transform transition-all duration-700 delay-400 ${
                isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}>
              <button
                onClick={() => navigateToPage('preferences')}
                className="bg-gradient-deep-blue text-white font-medium text-lg px-8 py-4 rounded-xl hover:shadow-xl hover:shadow-blue-500/20 transition-all duration-300 relative overflow-hidden hover:scale-105 active:scale-95"
              >
                <span className="relative z-10">Start Building</span>
                <div className="absolute inset-0 bg-gradient-ocean-blue opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
              </button>
            </div>
            </div>

          {/* Feature Grid */}
          <div className={`grid grid-cols-1 md:grid-cols-3 gap-6 mb-16 transform transition-all duration-700 delay-600 ${
            isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}>
            {[
              {
                  title: "3D Visualization",
                description: "Real-time rendering of every component",
                icon: (
                  <div className="w-6 h-6 bg-quaternary rounded-md flex items-center justify-center">
                    <div className="w-3 h-2 bg-dark rounded-sm"></div>
                  </div>
                )
              },
              {
                  title: "Authentic Sound",
                description: "Experience realistic typing feedback",
                icon: (
                  <div className="w-6 h-6 bg-quaternary rounded-full flex items-center justify-center">
                    <div className="w-3 h-3 bg-dark rounded-full"></div>
                  </div>
                )
              },
              {
                title: "Premium Parts",
                description: "Curated switches, keycaps, and cases",
                  icon: (
                  <div className="w-6 h-6 bg-quaternary rounded-md flex items-center justify-center">
                    <div className="grid grid-cols-2 gap-0.5 w-3 h-3">
                      <div className="bg-dark rounded-sm"></div>
                      <div className="bg-dark rounded-sm"></div>
                      <div className="bg-dark rounded-sm"></div>
                      <div className="bg-dark rounded-sm"></div>
                    </div>
                  </div>
                )
                }
              ].map((feature, index) => (
              <div key={index} className="minimal-card p-6 text-center">
                <div className="mb-4 flex justify-center">
                      {feature.icon}
                    </div>
                <h3 className="text-subheading text-primary mb-2">{feature.title}</h3>
                <p className="text-small text-secondary">{feature.description}</p>
                </div>
              ))}
            </div>

          {/* Trust Indicators */}
          <div className={`text-center transform transition-all duration-700 delay-800 ${
            isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}>
            <div className="flex items-center justify-center space-x-8 text-xs text-muted">
              {[
                "Free Shipping",
                "30-Day Returns", 
                "2-Year Warranty"
                ].map((item, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-dark rounded-full"></div>
                  <span>{item}</span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Preferences Page - Clean Minimalistic Design
  if (currentPage === 'preferences') {
    return (
      <div className={`min-h-screen bg-secondary ${isTransitioning ? 'page-exit' : 'page-enter'}`}>
        <div className="section-padding max-w-3xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigateToPage('welcome')}
                className="minimal-button p-3 hover:scale-110 active:scale-95 transition-transform duration-200"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div>
                <h1 className="text-heading text-primary">Preferences</h1>
                <p className="text-body text-secondary">Tell us your preferences for personalized recommendations</p>
              </div>
            </div>
          </div>

          {/* Configuration Sections */}
          <div className="space-y-8 animate-fade-in">
            {/* Layout Selection */}
            <div>
              <h2 className="text-subheading text-primary mb-4">Preferred Layout</h2>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { id: 'tkl', name: 'TKL', desc: '87 keys' },
                  { id: '60', name: '60%', desc: '61 keys' },
                  { id: 'full', name: 'Full', desc: '104 keys' },
                ].map((layout) => (
                  <button
                    key={layout.id}
                    onClick={() => setKeyboardConfig(prev => ({ ...prev, layout: layout.id as any }))}
                    className={`minimal-card p-4 text-center ${
                      keyboardConfig.layout === layout.id
                        ? 'border-dark bg-gradient-subtle-blue'
                        : ''
                    }`}
                  >
                    <div className="text-body font-medium text-primary mb-1">{layout.name}</div>
                    <div className="text-xs text-secondary">{layout.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Switch Type */}
            <div>
              <h2 className="text-subheading text-primary mb-4">Switch Type Preference</h2>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { id: 'linear', name: 'Linear', desc: 'Smooth & Fast' },
                  { id: 'tactile', name: 'Tactile', desc: 'Bumpy Feel' },
                  { id: 'clicky', name: 'Clicky', desc: 'Audible Click' },
                ].map((switch_) => (
                  <button
                    key={switch_.id}
                    onClick={() => setKeyboardConfig(prev => ({ ...prev, switches: switch_.id as any }))}
                    className={`minimal-card p-4 text-center ${
                      keyboardConfig.switches === switch_.id
                        ? 'border-dark bg-gradient-subtle-blue'
                        : ''
                    }`}
                  >
                    <div className="text-body font-medium text-primary mb-1">{switch_.name}</div>
                    <div className="text-xs text-secondary">{switch_.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Case Material */}
            <div>
              <h2 className="text-subheading text-primary mb-4">Case Material Preference</h2>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { id: 'aluminum', name: 'Aluminum', desc: 'Premium & Durable' },
                  { id: 'plastic', name: 'Plastic', desc: 'Lightweight' },
                  { id: 'wood', name: 'Wood', desc: 'Natural & Warm' },
                  { id: 'carbon', name: 'Carbon Fiber', desc: 'Ultra Premium' },
                ].map((material) => (
                  <button
                    key={material.id}
                    onClick={() => setKeyboardConfig(prev => ({ ...prev, case: material.id as any }))}
                    className={`minimal-card p-4 text-left ${
                      keyboardConfig.case === material.id
                        ? 'border-dark bg-gradient-subtle-blue'
                        : ''
                    }`}
                  >
                    <div className="text-body font-medium text-primary mb-1">{material.name}</div>
                    <div className="text-xs text-secondary">{material.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Keycap Profile */}
            <div>
              <h2 className="text-subheading text-primary mb-4">Keycap Profile</h2>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { id: 'cherry', name: 'Cherry', desc: 'Low profile, comfortable' },
                  { id: 'oem', name: 'OEM', desc: 'Standard height' },
                  { id: 'sa', name: 'SA', desc: 'High profile, sculpted' },
                  { id: 'xda', name: 'XDA', desc: 'Uniform, flat' },
                ].map((profile) => (
                  <button
                    key={profile.id}
                    onClick={() => setKeyboardConfig(prev => ({ ...prev, keycaps: profile.id as any }))}
                    className={`minimal-card p-4 text-left ${
                      keyboardConfig.keycaps === profile.id
                        ? 'border-dark bg-gradient-subtle-blue'
                        : ''
                    }`}
                  >
                    <div className="text-body font-medium text-primary mb-1">{profile.name}</div>
                    <div className="text-xs text-secondary">{profile.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Fixed Bottom Actions */}
          <div className="fixed bottom-0 left-0 right-0 bg-primary border-t border-light p-4">
            <div className="flex space-x-3 max-w-3xl mx-auto">
              <button 
                onClick={() => navigateToPage('welcome')}
                className="minimal-button flex-1 py-3 px-4 hover:scale-105 active:scale-95 transition-transform duration-200"
              >
                Back
              </button>
              <button 
                onClick={() => navigateToPage('builder')}
                className="bg-gradient-sky-blue text-white font-medium flex-1 py-3 px-4 rounded-xl hover:shadow-lg hover:shadow-blue-500/20 transition-all duration-200 relative overflow-hidden hover:scale-105 active:scale-95"
              >
                <span className="relative z-10">See Recommendations</span>
                <div className="absolute inset-0 bg-gradient-ocean-blue opacity-0 hover:opacity-100 transition-opacity duration-200"></div>
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Builder Page - Clean Minimalistic Design
  if (currentPage === 'builder') {
  return (
    <div className={`min-h-screen bg-secondary ${isTransitioning ? 'page-exit' : 'page-enter'}`}>
      <div className="section-padding max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigateToPage('preferences')}
              className="minimal-button p-3 hover:scale-110 active:scale-95 transition-transform duration-200"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div>
              <h1 className="text-heading text-primary">Your Keyboard</h1>
              <p className="text-body text-secondary">Based on your preferences</p>
            </div>
          </div>
          
          <button 
            onClick={() => setIsCartOpen(true)}
            className="minimal-button p-3"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13h10m-5 5a1 1 0 100 2 1 1 0 000-2zm5 0a1 1 0 100 2 1 1 0 000-2z" />
            </svg>
          </button>
        </div>

        {/* 3D KeySim Viewer */}
        <div className="mb-8 h-80 minimal-card relative overflow-hidden animate-scale-in">
          <div className="absolute inset-0 bg-gradient-light-blue opacity-8"></div>
            <RealKeysim
              layout="80"
              caseColor={keyboardConfig.case_color}
              keycapColor={keyboardConfig.keycap_color}
              switchColor={keyboardConfig.switch_color}
            />
            
            {/* Touch to rotate hint */}
          <div className="absolute bottom-4 left-4 text-xs text-muted">
              Drag to rotate • Pinch to zoom
            </div>
          </div>

          {/* Component Details */}
          <div className="space-y-4 mb-8 animate-slide-up">
            <div className="grid grid-cols-3 gap-4">
              {/* Keycaps - Clickable */}
              <button 
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  console.log('Keycaps button clicked!')
                  setSelectedComponent('keycaps')
                }}
                onTouchStart={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  console.log('Keycaps button touched!')
                  setSelectedComponent('keycaps')
                }}
                className="minimal-card p-4 text-left group cursor-pointer"
              >
                <div className="flex items-center space-x-2 mb-2">
                  <div className="w-3 h-3 bg-gradient-sky-blue rounded-sm"></div>
                  <h3 className="text-body font-medium text-primary">Keycaps</h3>
                  <svg className="w-3 h-3 text-muted ml-auto opacity-0 group-hover:opacity-100 transition-all duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
                {selectedProducts.keycaps ? (
                  <>
                    <p className="text-xs text-primary font-medium">{selectedProducts.keycaps.title}</p>
                    <p className="text-xs text-secondary mt-1">${(() => {
                      const product = selectedProducts.keycaps
                      return product.priceRange?.minVariantPrice?.amount ||
                             product.priceRange?.min?.amount ||
                             product.variants?.[0]?.priceV2?.amount ||
                             product.variants?.[0]?.price ||
                             product.price?.amount ||
                             product.price ||
                             'N/A'
                    })()}</p>
                  </>
                ) : (
                  <>
                    <p className="text-xs text-secondary">{keyboardConfig.keycaps.toUpperCase()} Profile</p>
                    <p className="text-xs text-muted mt-1">Click to shop</p>
                  </>
                )}
              </button>
              
              {/* Switches - Clickable */}
              <button 
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  console.log('Switches button clicked!')
                  setSelectedComponent('switches')
                }}
                onTouchStart={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  console.log('Switches button touched!')
                  setSelectedComponent('switches')
                }}
                className="minimal-card p-4 text-left group cursor-pointer"
              >
                <div className="flex items-center space-x-2 mb-2">
                  <div className="w-3 h-3 bg-gradient-ocean-blue rounded-full"></div>
                  <h3 className="text-body font-medium text-primary">Switches</h3>
                  <svg className="w-3 h-3 text-muted ml-auto opacity-0 group-hover:opacity-100 transition-all duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
                {selectedProducts.switches ? (
                  <>
                    <p className="text-xs text-primary font-medium">{selectedProducts.switches.title}</p>
                    <p className="text-xs text-secondary mt-1">${(() => {
                      const product = selectedProducts.switches
                      return product.priceRange?.minVariantPrice?.amount ||
                             product.priceRange?.min?.amount ||
                             product.variants?.[0]?.priceV2?.amount ||
                             product.variants?.[0]?.price ||
                             product.price?.amount ||
                             product.price ||
                             'N/A'
                    })()}</p>
                  </>
                ) : (
                  <>
                    <p className="text-xs text-secondary">{keyboardConfig.switches} Type</p>
                    <p className="text-xs text-muted mt-1">Click to shop</p>
                  </>
                )}
              </button>
              
              {/* Case - Clickable */}
              <button 
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  console.log('Case button clicked!')
                  setSelectedComponent('case')
                }}
                onTouchStart={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  console.log('Case button touched!')
                  setSelectedComponent('case')
                }}
                className="minimal-card p-4 text-left group cursor-pointer"
              >
                <div className="flex items-center space-x-2 mb-2">
                  <div className="w-3 h-3 bg-dark-tertiary rounded-sm"></div>
                  <h3 className="text-body font-medium text-primary">Case</h3>
                  <svg className="w-3 h-3 text-muted ml-auto opacity-0 group-hover:opacity-100 transition-all duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
                {selectedProducts.case ? (
                  <>
                    <p className="text-xs text-primary font-medium">{selectedProducts.case.title}</p>
                    <p className="text-xs text-secondary mt-1">${(() => {
                      const product = selectedProducts.case
                      return product.priceRange?.minVariantPrice?.amount ||
                             product.priceRange?.min?.amount ||
                             product.variants?.[0]?.priceV2?.amount ||
                             product.variants?.[0]?.price ||
                             product.price?.amount ||
                             product.price ||
                             'N/A'
                    })()}</p>
                  </>
                ) : (
                  <>
                    <p className="text-xs text-secondary">{keyboardConfig.case} Material</p>
                    <p className="text-xs text-muted mt-1">Click to shop</p>
                  </>
                )}
              </button>
            </div>
          </div>
          
          {/* Fixed Bottom Actions */}
          <div className="fixed bottom-0 left-0 right-0 bg-primary border-t border-light p-4">
            <div className="flex space-x-3 max-w-4xl mx-auto">
              <button 
                onClick={() => navigateToPage('customizer')}
                className="minimal-button py-3 px-6 hover:scale-105 active:scale-95 transition-transform duration-200"
              >
                Customize Colors
              </button>
              <button
                onClick={() => setIsCartOpen(true)}
                className="flex-1 bg-gradient-deep-blue text-white font-medium py-3 px-6 rounded-xl hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-200 relative overflow-hidden"
              >
                <span className="relative z-10">Add to Cart - ${calculateCartTotal().toFixed(2)}</span>
                <div className="absolute inset-0 bg-gradient-ocean-blue opacity-0 hover:opacity-100 transition-opacity duration-200"></div>
              </button>
            </div>
          </div>
        </div>

        {/* Component Search Modal */}
        <ComponentSearchModal
          isOpen={selectedComponent !== null}
          onClose={() => setSelectedComponent(null)}
          componentType={selectedComponent}
          currentConfig={keyboardConfig}
          onProductSelect={handleProductSelect}
          selectedProduct={selectedComponent ? selectedProducts[selectedComponent] : null}
        />

        {/* Clean Cart Summary Modal */}
        {isCartOpen && (
          <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="minimal-card w-full max-w-md overflow-hidden animate-scale-in">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-light">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-sky-blue rounded-xl flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.1 5H17M9 19.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM20 19.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-heading text-primary">Cart Summary</h2>
                    <p className="text-body text-secondary">Your keyboard build</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="minimal-button p-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Cart Items */}
              <div className="p-6 space-y-4">
                {selectedProducts.keycaps && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-dark-tertiary rounded-sm"></div>
                      <span className="text-primary text-sm">Keycaps</span>
                    </div>
                    <span className="text-dark font-medium text-sm">
                      ${(() => {
                        const price = selectedProducts.keycaps.priceRange?.minVariantPrice?.amount ||
                                     selectedProducts.keycaps.priceRange?.min?.amount ||
                                     selectedProducts.keycaps.variants?.[0]?.priceV2?.amount ||
                                     selectedProducts.keycaps.variants?.[0]?.price ||
                                     selectedProducts.keycaps.price?.amount ||
                                     selectedProducts.keycaps.price
                        return price ? parseFloat(price).toFixed(2) : '0.00'
                      })()}
                    </span>
                  </div>
                )}
                
                {selectedProducts.switches && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-dark-secondary rounded-full"></div>
                      <span className="text-primary text-sm">Switches</span>
                    </div>
                    <span className="text-dark font-medium text-sm">
                      ${(() => {
                        const price = selectedProducts.switches.priceRange?.minVariantPrice?.amount ||
                                     selectedProducts.switches.priceRange?.min?.amount ||
                                     selectedProducts.switches.variants?.[0]?.priceV2?.amount ||
                                     selectedProducts.switches.variants?.[0]?.price ||
                                     selectedProducts.switches.price?.amount ||
                                     selectedProducts.switches.price
                        return price ? parseFloat(price).toFixed(2) : '0.00'
                      })()}
                    </span>
                  </div>
                )}
                
                {selectedProducts.case && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-dark-tertiary rounded-sm"></div>
                      <span className="text-primary text-sm">Case</span>
                    </div>
                    <span className="text-dark font-medium text-sm">
                      ${(() => {
                        const price = selectedProducts.case.priceRange?.minVariantPrice?.amount ||
                                     selectedProducts.case.priceRange?.min?.amount ||
                                     selectedProducts.case.variants?.[0]?.priceV2?.amount ||
                                     selectedProducts.case.variants?.[0]?.price ||
                                     selectedProducts.case.price?.amount ||
                                     selectedProducts.case.price
                        return price ? parseFloat(price).toFixed(2) : '0.00'
                      })()}
                    </span>
                  </div>
                )}

                {/* Totals */}
                <div className="border-t border-light pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-secondary">Subtotal</span>
                    <span className="text-primary">${calculateCartTotal().toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-secondary">Tax (8%)</span>
                    <span className="text-primary">${(calculateCartTotal() * 0.08).toFixed(2)}</span>
                  </div>
                  <div className="border-t border-medium pt-2 flex justify-between">
                    <span className="text-primary font-semibold">Total</span>
                    <span className="text-primary font-semibold text-lg">${(calculateCartTotal() * 1.08).toFixed(2)}</span>
                  </div>
                </div>

                {/* Checkout Button */}
                <button className="bg-gradient-deep-blue text-white font-medium w-full py-4 px-6 rounded-xl hover:shadow-xl hover:shadow-blue-500/20 transition-all duration-300 relative overflow-hidden">
                  <span className="relative z-10">Proceed to Checkout</span>
                  <div className="absolute inset-0 bg-gradient-ocean-blue opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  // Color Customizer Page
  if (currentPage === 'customizer') {
    const colorOptions = [
      { name: 'Grey', value: '#6b7280' },
      { name: 'Black', value: '#1f2937' },
      { name: 'White', value: '#f3f4f6' },
      { name: 'Blue', value: '#3b82f6' },
      { name: 'Red', value: '#ef4444' },
      { name: 'Green', value: '#10b981' },
      { name: 'Purple', value: '#8b5cf6' },
      { name: 'Orange', value: '#f97316' },
      { name: 'Pink', value: '#ec4899' },
      { name: 'Cyan', value: '#06b6d4' },
    ]

    return (
      <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-slate-950 to-zinc-950">
        <div className="pt-4 px-4 pb-24">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setCurrentPage('builder')}
                className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-700/50 text-slate-300 hover:text-white hover:bg-slate-900/80 transition-all duration-200"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div>
                <h1 className="text-xl font-semibold text-white">Customize Colors</h1>
                <p className="text-slate-400 text-sm">Make it uniquely yours</p>
              </div>
            </div>
          </div>

          {/* 3D KeySim Preview */}
          <div className="mb-6 h-64 rounded-2xl bg-gradient-to-br from-slate-900/60 to-slate-800/60 border border-slate-700/50 backdrop-blur-sm relative overflow-hidden">
            <KeysimViewer
              layout="80"
              caseColor={keyboardConfig.case_color}
              keycapColor={keyboardConfig.keycap_color}
              switchColor={keyboardConfig.switch_color}
            />
            </div>
            
          {/* Color Customization */}
          <div className="space-y-6">
            {/* Case Color */}
            <div>
              <h3 className="text-white font-medium mb-3">Case Color</h3>
              <div className="grid grid-cols-5 gap-3">
                {colorOptions.map((color) => (
                  <button
                    key={`case-${color.value}`}
                    onClick={() => setKeyboardConfig(prev => ({ ...prev, case_color: color.value }))}
                    className={`aspect-square rounded-xl border-2 transition-all duration-200 ${
                      keyboardConfig.case_color === color.value
                        ? 'border-white scale-110'
                        : 'border-slate-600 hover:border-slate-400 hover:scale-105'
                    }`}
                    style={{ backgroundColor: color.value }}
                  >
                    <span className="sr-only">{color.name}</span>
                  </button>
                ))}
              </div>
            </div>
            
            {/* Keycap Color */}
            <div>
              <h3 className="text-white font-medium mb-3">Keycap Color</h3>
              <div className="grid grid-cols-5 gap-3">
                {colorOptions.map((color) => (
                  <button
                    key={`keycap-${color.value}`}
                    onClick={() => setKeyboardConfig(prev => ({ ...prev, keycap_color: color.value }))}
                    className={`aspect-square rounded-xl border-2 transition-all duration-200 ${
                      keyboardConfig.keycap_color === color.value
                        ? 'border-white scale-110'
                        : 'border-slate-600 hover:border-slate-400 hover:scale-105'
                    }`}
                    style={{ backgroundColor: color.value }}
                  >
                    <span className="sr-only">{color.name}</span>
                  </button>
                ))}
              </div>
            </div>
            
            {/* Switch Color */}
            <div>
              <h3 className="text-white font-medium mb-3">Switch Color</h3>
              <div className="grid grid-cols-5 gap-3">
                {colorOptions.map((color) => (
                  <button
                    key={`switch-${color.value}`}
                    onClick={() => setKeyboardConfig(prev => ({ ...prev, switch_color: color.value }))}
                    className={`aspect-square rounded-xl border-2 transition-all duration-200 ${
                      keyboardConfig.switch_color === color.value
                        ? 'border-white scale-110'
                        : 'border-slate-600 hover:border-slate-400 hover:scale-105'
                    }`}
                    style={{ backgroundColor: color.value }}
                  >
                    <span className="sr-only">{color.name}</span>
                  </button>
                ))}
            </div>
          </div>
        </div>

        {/* Fixed Bottom Actions */}
        <div className="fixed bottom-0 left-0 right-0 bg-slate-950/90 backdrop-blur-sm border-t border-slate-800/50 p-4">
          <div className="flex space-x-3">
              <button 
                onClick={() => setCurrentPage('builder')}
                className="flex-1 bg-slate-900/60 border border-slate-700/50 text-slate-300 font-medium py-3 px-4 rounded-xl hover:bg-slate-900/80 transition-all duration-200"
              >
                Back
            </button>
            <button className="flex-1 bg-white text-slate-950 font-medium py-3 px-4 rounded-xl hover:shadow-lg transition-all duration-200">
              Add to Cart - $399
            </button>
          </div>
        </div>
      </div>
    </div>
  )
  }

  // This should never be reached, but just in case
  return null
}