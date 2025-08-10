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
      case: 'case'
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

  if (!isOpen || !componentType) {
    console.log('Modal not showing:', { isOpen, componentType })
    return null
  }
  
  console.log('Modal is showing for:', componentType)

  const componentIcons = {
    keycaps: <div className="w-4 h-4 bg-black rounded-sm" />,
    switches: <div className="w-4 h-4 rounded-full bg-black" />, 
    case: <div className="w-4 h-4 bg-black rounded-sm" />
  }

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-end">
      <div className="w-full minimal-card rounded-t-3xl max-h-[90vh] overflow-hidden animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-light">
          <div>
            <h2 className="text-heading text-primary flex items-center space-x-3">
              <div className="w-8 h-8 rounded-xl bg-quaternary flex items-center justify-center">
                {componentIcons[componentType]}
              </div>
              <span>Shop {componentType.charAt(0).toUpperCase() + componentType.slice(1)}</span>
            </h2>
            <p className="text-body text-secondary">
              Find the perfect {componentType} for your build
            </p>
          </div>
          <button
            onClick={onClose}
            className="minimal-button p-3"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Search Input */}
        <div className="p-6 border-b border-light">
          <div className="relative">
            <input
              type="text"
              placeholder={`Search ${componentType}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="minimal-input w-full pr-12"
            />
            <svg className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        {/* Selected Product Display */}
        {selectedProduct && (
          <div className="p-4 mx-6 mt-4 minimal-card">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-quaternary rounded-lg flex items-center justify-center">
                  {componentIcons[componentType]}
                </div>
                <div>
                  <h3 className="text-secondary font-medium text-sm">Currently Selected</h3>
                  <p className="text-primary text-xs">{selectedProduct.title}</p>
                  <p className="text-secondary text-xs">
                    ${selectedProduct.priceRange?.minVariantPrice?.amount || 'N/A'}
                  </p>
                </div>
              </div>
              <div className="text-dark">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>
        )}

        {/* Products Grid */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="w-8 h-8 border-2 border-dark border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-secondary text-sm">Searching products...</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {products?.map((product) => (
                <div
                  key={product.id}
                  className="minimal-card p-4"
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
                    <h3 className="text-primary font-medium text-sm line-clamp-2">
                      {product.title}
                    </h3>
                    
                    <p className="text-dark font-medium text-sm">
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
                      <p className="text-muted text-xs">{product.vendor}</p>
                    )}
                  </div>

                  {/* Select Button */}
                  <button
                    onClick={() => {
                      onProductSelect(product, componentType)
                      onClose()
                    }}
                    className={`w-full mt-3 py-2 px-3 text-sm font-medium transition-all duration-200 ${
                      selectedProduct?.id === product.id
                        ? 'minimal-button-primary'
                        : 'minimal-button'
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
              <div className="w-16 h-16 mx-auto mb-4 bg-quaternary rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <p className="text-secondary text-sm">No products found</p>
              <p className="text-muted text-xs">Try adjusting your search terms</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-light">
          <button 
            onClick={onClose}
            className="minimal-button w-full py-3 px-4"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}