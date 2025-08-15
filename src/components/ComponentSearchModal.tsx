import { useState, useEffect } from 'react'
import { useProductSearch } from '@shopify/shop-minis-react'

interface ComponentSearchModalProps {
  isOpen: boolean
  onClose: () => void
  componentType: 'keycaps' | 'switches' | 'case' | null
  currentConfig: any
  onProductSelect: (product: any, componentType: 'keycaps' | 'switches' | 'case') => void
  selectedProduct: any | null
}

export function ComponentSearchModal({ 
  isOpen, 
  onClose, 
  componentType, 
  currentConfig, 
  onProductSelect, 
  selectedProduct 
}: ComponentSearchModalProps) {
  const [searchQuery, setSearchQuery] = useState('')

  // Generate search query based on component type (no prebuilt filters)
  const getSearchQuery = () => {
    if (!componentType) return ''
    
    const baseQueries = {
      keycaps: 'keycaps',
      switches: 'switches', 
      case: 'mechanical keyboard 75% case'
    }
    
    return searchQuery || baseQueries[componentType]
  }

  const { products, loading } = useProductSearch({
    query: getSearchQuery(),
    first: 12
  })

  // Debug: Log the first product to see the structure
  useEffect(() => {
    if (products && products.length > 0) {
      console.log('First product structure:', products[0])
      console.log('Price data:', {
        priceRange: products[0].priceRange,
        variants: products[0].variants,
        minVariantPrice: products[0].priceRange?.minVariantPrice
      })
    }
  }, [products])

  useEffect(() => {
    if (isOpen && componentType) {
      setSearchQuery('')
    }
  }, [isOpen, componentType])

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      // Save current scroll position
      const scrollY = window.scrollY
      
      // Disable body scroll
      document.body.style.position = 'fixed'
      document.body.style.top = `-${scrollY}px`
      document.body.style.width = '100%'
      
      return () => {
        // Re-enable body scroll and restore position
        document.body.style.position = ''
        document.body.style.top = ''
        document.body.style.width = ''
        window.scrollTo(0, scrollY)
      }
    }
  }, [isOpen])

  if (!isOpen || !componentType) {
    return null
  }

  const componentIcons = {
    keycaps: '🎛️',
    switches: '⚙️', 
    case: '📦'
  }

  const componentColors = {
    keycaps: 'blue',
    switches: 'amber',
    case: 'slate'
  }

  const color = componentColors[componentType]

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end"
      onClick={(e) => {
        // Close modal when clicking backdrop
        if (e.target === e.currentTarget) {
          onClose()
        }
      }}
      style={{ touchAction: 'none' }}
    >
      <div 
        className="w-full bg-slate-950 rounded-t-3xl border-t border-slate-700/50 max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
        style={{ touchAction: 'auto' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-800/50">
          <div>
            <h2 className="text-xl font-semibold text-white flex items-center space-x-3">
              <span className="text-2xl">{componentIcons[componentType]}</span>
              <span>Shop {componentType.charAt(0).toUpperCase() + componentType.slice(1)}</span>
            </h2>
            <p className="text-slate-400 text-sm">
              Find the perfect {componentType} for your build
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-700/50 text-slate-300 hover:text-white hover:bg-slate-900/80 transition-all duration-200"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Search Input */}
        <div className="p-6 border-b border-slate-800/50">
          <div className="relative">
            <input
              type="text"
              placeholder={`Search ${componentType}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900/60 border border-slate-700/50 text-white placeholder-slate-400 rounded-xl py-3 px-4 pr-12 focus:outline-none focus:border-blue-500/50"
            />
            <svg className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        {/* Selected Product Display */}
        {selectedProduct && (
          <div className={`p-4 mx-6 mt-4 bg-${color}-900/20 border border-${color}-500/30 rounded-xl`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`w-12 h-12 bg-${color}-500/20 rounded-lg flex items-center justify-center`}>
                  <span className="text-xl">{componentIcons[componentType]}</span>
                </div>
                <div>
                  <h3 className={`text-${color}-300 font-medium text-sm`}>Currently Selected</h3>
                  <p className="text-white text-xs">{selectedProduct.title}</p>
                  <p className={`text-${color}-400 text-xs`}>
                    ${selectedProduct.priceRange?.minVariantPrice?.amount || 'N/A'}
                  </p>
                </div>
              </div>
              <div className={`text-${color}-400`}>
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>
        )}

        {/* Products Grid - Mobile Scroll Fix */}
        <div className="flex-1 overflow-y-auto overscroll-contain p-6" style={{
          WebkitOverflowScrolling: 'touch',
          touchAction: 'pan-y'
        }}>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-slate-300 text-sm">Searching products...</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 pb-4">
              {products?.map((product) => (
                <div
                  key={product.id}
                  className="bg-slate-900/40 border border-slate-700/50 rounded-xl p-4 hover:bg-slate-900/60 hover:border-slate-600/50 transition-all duration-200"
                  style={{ touchAction: 'auto' }}
                >
                  {/* Product Image */}
                  {product.featuredImage && (
                    <img
                      src={product.featuredImage.url}
                      alt={product.title}
                      className="w-full h-32 object-cover rounded-lg mb-3"
                    />
                  )}
                  
                  {/* Product Info */}
                  <div className="space-y-2">
                    <h3 className="text-white font-medium text-sm line-clamp-2">
                      {product.title}
                    </h3>
                    
                    <p className="text-green-400 font-medium text-sm">
                      ${(() => {
                        // Try different possible price field structures based on Shopify API docs
                        const price = 
                          product.priceRange?.minVariantPrice?.amount ||
                          product.priceRange?.min?.amount ||
                          product.variants?.[0]?.priceV2?.amount ||
                          product.variants?.[0]?.price ||
                          product.price?.amount ||
                          product.price ||
                          'N/A'
                        console.log('Price for', product.title, ':', {
                          priceRange: product.priceRange,
                          variants: product.variants,
                          extractedPrice: price
                        })
                        return price
                      })()}
                    </p>
                    
                    {product.vendor && (
                      <p className="text-slate-500 text-xs">{product.vendor}</p>
                    )}
                  </div>

                  {/* Select Button */}
                  <button
                    onClick={() => {
                      onProductSelect(product, componentType)
                      onClose()
                    }}
                    className={`w-full mt-3 py-2 px-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                      selectedProduct?.id === product.id
                        ? `bg-${color}-500/20 border border-${color}-400/40 text-${color}-300`
                        : 'bg-slate-800/60 border border-slate-600/40 text-slate-300 hover:bg-slate-800/80'
                    }`}
                  >
                    {selectedProduct?.id === product.id ? (
                      <span className="flex items-center justify-center space-x-2">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        <span>Selected</span>
                      </span>
                    ) : (
                      'Select'
                    )}
                  </button>
                </div>
              ))}
            </div>
          )}

          {!loading && products?.length === 0 && (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">🔍</div>
              <p className="text-slate-300 text-sm">No products found</p>
              <p className="text-slate-500 text-xs">Try adjusting your search terms</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-800/50 bg-slate-950/80">
          <button 
            onClick={onClose}
            className="w-full bg-slate-900/60 border border-slate-700/50 text-slate-300 font-medium py-3 px-4 rounded-xl hover:bg-slate-900/80 transition-all duration-200"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
