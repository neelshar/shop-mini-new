import { useState, useEffect } from 'react'
import { useShopCartActions } from '@shopify/shop-minis-react'
import { RealKeysim } from './components/RealKeysim'
import { ComponentSearchModal } from './components/ComponentSearchModal'
import { MultiProfileKeyboardSounds } from './components/MultiProfileKeyboardSounds'
import { AutoSwitchMatcher } from './components/AutoSwitchMatcher'
import { MinimalAudioToggle } from './components/MinimalAudioToggle'
import { VirtualKeyboard } from './components/VirtualKeyboard'
import { PrivacyPolicy } from './components/PrivacyPolicy'
import { TermsOfService } from './components/TermsOfService'
import { colorAnalysis } from './utils/colorAnalysis'

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

type AppPage = 'welcome' | 'preferences' | 'builder' | 'customizer' | 'case-customizer' | 'cart-confirmation' | 'privacy-policy' | 'terms-of-service'



export function App() {
  // Shopify cart actions
  const { addToCart, buyProduct } = useShopCartActions()
  
  const [currentPage, setCurrentPage] = useState<AppPage>('welcome')
  const [keyboardConfig, setKeyboardConfig] = useState<KeyboardConfig>({
    layout: 'tkl',
    switches: 'tactile',
    keycaps: 'cherry',
    case: 'aluminum',
    plate: 'aluminum',
    stabilizers: 'durock',
    case_color: '#666666', // Gray case to match the gray keycaps
    keycap_color: '#666666', // Gray keycaps as shown in the image
    switch_color: '#ffa726' // Default tactile orange
  })
  const [isLoaded, setIsLoaded] = useState(false)
  
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
  const [isAddingToCart, setIsAddingToCart] = useState(false)
  const [isBuying, setIsBuying] = useState(false)
  const [cartConfirmationData, setCartConfirmationData] = useState<{
    items: Array<{name: string, price: number}>,
    total: number
  } | null>(null)

  // Color analysis state
  const [colorAnalysisResult, setColorAnalysisResult] = useState<any>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const [debugMode, setDebugMode] = useState(false)
  const [currentSoundProfile, setCurrentSoundProfile] = useState<string>('holy-pandas')
  const [autoSwitchAnalysisResult, setAutoSwitchAnalysisResult] = useState<any>(null)
  const [isAudioEnabled, setIsAudioEnabled] = useState<boolean>(false) // Start with audio muted
  
  // Simple logging function for development
  const logCartAction = (message: string, data?: any) => {
    console.log(`🛒 ${message}`, data || '')
  }

  // Case color options - used in both customizer and case-customizer
  const caseColorOptions = [
    { name: 'White', value: '#ffffff' },
    { name: 'Black', value: '#000000' },
    { name: 'Red', value: '#ff0000' },
    { name: 'Blue', value: '#0066ff' },
    { name: 'Green', value: '#00ff00' },
    { name: 'Purple', value: '#8b00ff' },
    { name: 'Orange', value: '#ff6600' },
    { name: 'Pink', value: '#ff69b4' },
    { name: 'Cyan', value: '#00ffff' },
    { name: 'Gold', value: '#ffd700' },
  ]

  // DEBUG FUNCTION - Find all objects in the scene
  const debugScene = () => {
    console.log('🔍 === SCENE DEBUG START ===')
    
    // Check what's available globally
    console.log('Available globals:', {
      THREE: !!(window as any).THREE,
      caseManager: !!(window as any).caseManager,
      scene: !!(window as any).scene,
      renderer: !!(window as any).renderer,
      store: !!(window as any).store
    })
    
    // Debug caseManager
    if ((window as any).caseManager) {
      const caseManager = (window as any).caseManager
      console.log('🏠 CaseManager:', {
        color: caseManager.color,
        case: caseManager.case,
        group: caseManager.group,
        scene: caseManager.scene,
        groupChildren: caseManager.group?.children?.length || 0
      })
      
      if (caseManager.group && caseManager.group.children) {
        console.log('📦 Group children:')
        caseManager.group.children.forEach((child: any, i: number) => {
          console.log(`  [${i}] ${child.name || child.type}:`, {
            type: child.type,
            material: child.material,
            materialColor: child.material?.color?.getHex?.() || 'no color',
            visible: child.visible
          })
        })
      }
    }
    
    // Debug scene
    if ((window as any).scene) {
      const scene = (window as any).scene
      console.log('🎬 Scene children:', scene.children.length)
      scene.traverse((object: any) => {
        if (object.name === 'CASE' || (object.material && object.type === 'Mesh')) {
          console.log('🎯 Found mesh object:', {
            name: object.name,
            type: object.type,
            material: object.material,
            materialType: object.material?.constructor?.name,
            color: object.material?.color?.getHex?.(),
            visible: object.visible,
            parent: object.parent?.name
          })
        }
      })
    }
    
    console.log('🔍 === SCENE DEBUG END ===')
  }

  // Update case color (simplified to use reusable function)
  const updateCaseColor = (newColor: string) => {
    console.log('🏠 Updating case color to:', newColor)
    
    // Update React state
    setKeyboardConfig(prev => ({ ...prev, case_color: newColor }))
    
    // Apply to 3D scene using reusable function
    applyCaseColorToScene(newColor)
  }
  
  const tryUpdateCase = (newColor: string, timing: string) => {
    console.log(`🎯 ${timing} - Trying case update...`)
    
    let updatesApplied = 0
    
    // Method 1: caseManager approach
    if ((window as any).caseManager) {
      const caseManager = (window as any).caseManager
      console.log(`  ${timing} - caseManager found:`, {
        hasCase: !!caseManager.case,
        currentColor: caseManager.color,
        hasUpdateMethod: typeof caseManager.updateCaseMaterial === 'function'
      })
      
      try {
        caseManager.color = newColor
        if (caseManager.updateCaseMaterial) {
          caseManager.updateCaseMaterial(newColor)
          updatesApplied++
          console.log(`  ✅ ${timing} - caseManager.updateCaseMaterial called`)
        }
      } catch (error) {
        console.log(`  ❌ ${timing} - caseManager update failed:`, error)
      }
    }
    
    // Method 2: Scene traversal
    if ((window as any).scene) {
      const scene = (window as any).scene
      let sceneUpdates = 0
      
      scene.traverse((object: any) => {
        // Look for any non-key mesh objects
        if (object.material && object.type === 'Mesh') {
          const isKey = object.name?.toLowerCase().includes('key') || 
                       object.parent?.name?.toLowerCase().includes('key')
          
          if (!isKey) {
            try {
              if (Array.isArray(object.material)) {
                object.material.forEach((mat: any) => {
                  if (mat.color) {
                    mat.color.setHex(parseInt(newColor.replace('#', '0x')))
                    mat.needsUpdate = true
                    sceneUpdates++
                  }
                })
              } else if (object.material.color) {
                object.material.color.setHex(parseInt(newColor.replace('#', '0x')))
                object.material.needsUpdate = true
                sceneUpdates++
              }
            } catch (error) {
              // Silent failure for this timing test
            }
          }
        }
      })
      
      console.log(`  ${timing} - Scene traversal: ${sceneUpdates} materials updated`)
      updatesApplied += sceneUpdates
    }
    
    // Method 3: Force render
    if ((window as any).renderer && (window as any).scene && (window as any).camera) {
      try {
        const renderer = (window as any).renderer
        const scene = (window as any).scene  
        const camera = (window as any).camera
        renderer.render(scene, camera)
        console.log(`  ✅ ${timing} - Forced render`)
      } catch (error) {
        console.log(`  ❌ ${timing} - Render failed:`, error)
      }
    }
    
    console.log(`  📊 ${timing} - Total updates applied: ${updatesApplied}`)
    
    return updatesApplied > 0
  }

  useEffect(() => {
    // Trigger animations after component mounts
    const timer = setTimeout(() => setIsLoaded(true), 100)
    return () => clearTimeout(timer)
  }, [])

  // Add keyboard event listener for sound effects
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (!isAudioEnabled) return
      
      // Get the sound component and call its playKeyboardSound function
      const soundComponent = (window as any).multiProfileKeyboardSounds;
      if (soundComponent && soundComponent.playKeyboardSound) {
        soundComponent.playKeyboardSound(event.key);
      }
    };

    // Add event listener
    window.addEventListener('keydown', handleKeyPress);
    
    // Cleanup
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [isAudioEnabled])

  // Handle auto sound profile matching from switch selection
  const handleAutoSoundProfileMatch = (profileId: string, analysisResult: any) => {
    console.log('🤖 Auto-matched sound profile:', profileId, analysisResult);
    setCurrentSoundProfile(profileId);
    setAutoSwitchAnalysisResult(analysisResult);
    
    // Auto-unmute audio when user selects a switch
    if (!isAudioEnabled) {
      console.log('🔊 Auto-unmuting audio due to switch selection');
      setIsAudioEnabled(true);
    }
  };

  // Handle manual sound profile changes from the keyboard component
  const handleSoundProfileChange = (profileId: string) => {
    console.log('🔧 Manual sound profile change:', profileId);
    setCurrentSoundProfile(profileId);
  };

  // Handle audio state changes
  const handleAudioStateChange = (enabled: boolean) => {
    console.log('🔊 App: Audio state change requested:', enabled);
    setIsAudioEnabled(enabled);
  };

  // Always show audio toggle since we auto-initialize (determine if we have meaningful switch info)
  const hasSelectedSwitch = true; // Always show now that we auto-initialize
  
  // Reference to the keyboard sound function
  const [keyboardSoundFunction, setKeyboardSoundFunction] = useState<((key: string) => void) | null>(null);
  const hasMeaningfulSwitch = selectedProducts.switches || keyboardConfig.switches !== 'tactile';
  
  // Get current switch name for display
  const getCurrentSwitchName = () => {
    if (selectedProducts.switches) {
      return selectedProducts.switches.title || selectedProducts.switches.name || 'Selected Switch';
    }
    return `${keyboardConfig.switches.charAt(0).toUpperCase() + keyboardConfig.switches.slice(1)} Switch`;
  };

  // Switch state tracking (debug logging removed for cleaner console)

  // Handle product selection
  const handleProductSelect = (product: any, componentType: 'keycaps' | 'switches' | 'case') => {
    
    const updatedProducts = {
      ...selectedProducts,
      [componentType]: product
    }
    
    setSelectedProducts(updatedProducts)
    
    // Automatically analyze colors when keycaps or case are selected
    if (componentType === 'keycaps') {
      setTimeout(() => {
        handleAnalyzeKeycapColorsWithProducts(updatedProducts)
      }, 100)
    } else if (componentType === 'case') {
      setTimeout(() => {
        handleAnalyzeCaseColorsWithProducts(updatedProducts)
      }, 100)
    }
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

  // Add all selected products to Shopify cart
  const handleAddToCart = async () => {
    if (isAddingToCart) return // Prevent double-clicks
    
    setIsAddingToCart(true)
    
    try {
      logCartAction('Starting add to cart process...')
      logCartAction('Selected products:', selectedProducts)
      logCartAction('Hook functions available:', { 
        addToCart: typeof addToCart, 
        buyProduct: typeof buyProduct 
      })
      
      const cartPromises = []
      let debugInfo = []
      
      // Add keycaps to cart
      if (selectedProducts.keycaps) {
        const keycapsProduct = selectedProducts.keycaps
        logCartAction('Processing keycaps product...', keycapsProduct)
        
        const productId = keycapsProduct.id
        // Get variant ID from defaultVariantId or first variant, NOT product ID
        const variantId = keycapsProduct.defaultVariantId || 
                         keycapsProduct.variants?.[0]?.id || 
                         null // Don't fallback to product ID
        
        logCartAction( { 
          productId, 
          variantId,
          productIdType: typeof productId,
          variantIdType: typeof variantId,
          hasVariants: !!keycapsProduct.variants,
          variantsLength: keycapsProduct.variants?.length,
          firstVariant: keycapsProduct.variants?.[0]
        })
        
        // Validate IDs
        if (!productId) {
          logCartAction( 'Keycaps product ID is missing or invalid')
          throw new Error('Keycaps product ID is missing or invalid')
        }
        if (!variantId) {
          logCartAction( 'Keycaps variant ID is missing or invalid')
          throw new Error('Keycaps variant ID is missing or invalid')
        }
        
        const keycapsCartParams = {
          productId,
          productVariantId: variantId,
          quantity: 1,
        }
        
        logCartAction( keycapsCartParams)
        debugInfo.push({ type: 'keycaps', params: keycapsCartParams })
        
        cartPromises.push(
          addToCart(keycapsCartParams).catch(error => {
            logCartAction( error)
            throw new Error(`Keycaps add to cart failed: ${error.message}`)
          })
        )
      }
      
      // Add switches to cart
      if (selectedProducts.switches) {
        const switchesProduct = selectedProducts.switches
        logCartAction( '========== SWITCHES DEBUG ==========')
        logCartAction( switchesProduct)
        
        const productId = switchesProduct.id
        // Get variant ID from defaultVariantId or first variant, NOT product ID
        const variantId = switchesProduct.defaultVariantId || 
                         switchesProduct.variants?.[0]?.id || 
                         null // Don't fallback to product ID
        
        logCartAction( { 
          productId, 
          variantId,
          productIdType: typeof productId,
          variantIdType: typeof variantId,
          hasVariants: !!switchesProduct.variants,
          variantsLength: switchesProduct.variants?.length,
          firstVariant: switchesProduct.variants?.[0]
        })
        
        // Validate IDs
        if (!productId) {
          logCartAction( 'Switches product ID is missing or invalid')
          throw new Error('Switches product ID is missing or invalid')
        }
        if (!variantId) {
          logCartAction( 'Switches variant ID is missing or invalid')
          throw new Error('Switches variant ID is missing or invalid')
        }
        
        const switchesCartParams = {
          productId,
          productVariantId: variantId,
          quantity: 1,
        }
        
        logCartAction( switchesCartParams)
        debugInfo.push({ type: 'switches', params: switchesCartParams })
        
        cartPromises.push(
          addToCart(switchesCartParams).catch(error => {
            logCartAction( error)
            throw new Error(`Switches add to cart failed: ${error.message}`)
          })
        )
      }
      
      // Add case to cart
      if (selectedProducts.case) {
        const caseProduct = selectedProducts.case
        logCartAction( '========== CASE DEBUG ==========')
        logCartAction( caseProduct)
        
        const productId = caseProduct.id
        // Get variant ID from defaultVariantId or first variant, NOT product ID
        const variantId = caseProduct.defaultVariantId || 
                         caseProduct.variants?.[0]?.id || 
                         null // Don't fallback to product ID
        
        logCartAction( { 
          productId, 
          variantId,
          productIdType: typeof productId,
          variantIdType: typeof variantId,
          hasVariants: !!caseProduct.variants,
          variantsLength: caseProduct.variants?.length,
          firstVariant: caseProduct.variants?.[0]
        })
        
        // Validate IDs
        if (!productId) {
          logCartAction( 'Case product ID is missing or invalid')
          throw new Error('Case product ID is missing or invalid')
        }
        if (!variantId) {
          logCartAction( 'Case variant ID is missing or invalid')
          throw new Error('Case variant ID is missing or invalid')
        }
        
        const caseCartParams = {
          productId,
          productVariantId: variantId,
          quantity: 1,
        }
        
        logCartAction( caseCartParams)
        debugInfo.push({ type: 'case', params: caseCartParams })
        
        cartPromises.push(
          addToCart(caseCartParams).catch(error => {
            logCartAction( error)
            throw new Error(`Case add to cart failed: ${error.message}`)
          })
        )
      }
      
      logCartAction( '========== EXECUTING CART OPERATIONS ==========')
      logCartAction( cartPromises.length)
      logCartAction( debugInfo)
      
      // Execute all cart additions
      const results = await Promise.allSettled(cartPromises)
      
      logCartAction( '========== CART RESULTS ==========')
      results.forEach((result, index) => {
        const resultData = {
          status: result.status,
          value: result.status === 'fulfilled' ? result.value : undefined,
          reason: result.status === 'rejected' ? result.reason : undefined,
          debugInfo: debugInfo[index]
        }
        logCartAction( resultData)
      })
      
      // Check if any failed
      const failures = results.filter(r => r.status === 'rejected')
      if (failures.length > 0) {
        logCartAction( failures)
        throw new Error(`${failures.length} items failed to add to cart`)
      }
      
      console.log('✅ Successfully added all items to cart!')
      
      // Prepare confirmation data
      const confirmationItems = []
      if (selectedProducts.keycaps) {
        confirmationItems.push({
          name: `${selectedProducts.keycaps.title} - Keycaps`,
          price: selectedProducts.keycaps.priceRange?.minVariantPrice?.amount || 149
        })
      }
      if (selectedProducts.switches) {
        confirmationItems.push({
          name: `${selectedProducts.switches.title} - Switches`,
          price: selectedProducts.switches.priceRange?.minVariantPrice?.amount || 129
        })
      }
      if (selectedProducts.case) {
        confirmationItems.push({
          name: `${selectedProducts.case.title} - Case`,
          price: selectedProducts.case.priceRange?.minVariantPrice?.amount || 199
        })
      }
      
      setCartConfirmationData({
        items: confirmationItems,
        total: calculateCartTotal()
      })
      
      // Navigate to confirmation page
      setCurrentPage('cart-confirmation')
      setIsCartOpen(false)
      
    } catch (error) {
      logCartAction('Cart error occurred:', error)
      
      // Show user-friendly error message
      alert('Failed to add items to cart. Please try again or contact support if the issue persists.')
    } finally {
      setIsAddingToCart(false)
    }
  }

  // Buy all selected products directly (skip cart)
  const handleBuyNow = async () => {
    if (isBuying) return // Prevent double-clicks
    
    setIsBuying(true)
    try {
      console.log('💳 Starting buy now process...', selectedProducts)
      
      // For development/demo - simulate successful purchase and redirect to start
      if (selectedProducts.keycaps) {
        const keycapsProduct = selectedProducts.keycaps
        console.log('🎛️ Simulating purchase for demo:', keycapsProduct.title)
        
        // Simulate loading delay
        await new Promise(resolve => setTimeout(resolve, 1500))
        
        // Show success confirmation
        setCartConfirmationData({
          items: [
            { name: keycapsProduct.title, price: 75.00 }
          ],
          total: 75.00
        })
        
        // Redirect to confirmation page, then to welcome
        setCurrentPage('cart-confirmation')
        
        console.log('✅ Demo purchase completed!')
      } else {
        console.log('⚠️ No keycaps selected for purchase')
        alert('Please select keycaps to purchase')
      }
      
    } catch (error) {
      console.error('❌ Error with buy now:', error)
      alert('Failed to process purchase. Please try again.')
    } finally {
      setIsBuying(false)
    }
  }

  // Smart function to detect if keycap set is multi-color
  const isMultiColorKeycapSet = (analysisResult: any) => {
    if (!analysisResult) return false
    
    const { primary, modifier, accent } = analysisResult
    
    // Check if we have valid colors for all three categories
    const hasValidPrimary = primary?.hex && primary?.confidence >= 6
    const hasValidModifier = modifier?.hex && modifier?.confidence >= 6  
    const hasValidAccent = accent?.hex && accent?.confidence >= 6
    
    if (!hasValidPrimary || !hasValidModifier || !hasValidAccent) {
      console.log('🎯 Single-color detection: Missing valid colors for all categories')
      return false
    }
    
    // Calculate color difference between primary and modifier
    const primaryColor = primary.hex
    const modifierColor = modifier.hex
    const accentColor = accent.hex
    
    // Convert hex to RGB for comparison
    const hexToRgb = (hex: string) => {
      const r = parseInt(hex.slice(1, 3), 16)
      const g = parseInt(hex.slice(3, 5), 16) 
      const b = parseInt(hex.slice(5, 7), 16)
      return { r, g, b }
    }
    
    const primaryRgb = hexToRgb(primaryColor)
    const modifierRgb = hexToRgb(modifierColor)
    const accentRgb = hexToRgb(accentColor)
    
    // Calculate color distance using Euclidean distance
    const colorDistance = (c1: any, c2: any) => {
      return Math.sqrt(
        Math.pow(c1.r - c2.r, 2) + 
        Math.pow(c1.g - c2.g, 2) + 
        Math.pow(c1.b - c2.b, 2)
      )
    }
    
    const primaryModifierDistance = colorDistance(primaryRgb, modifierRgb)
    const primaryAccentDistance = colorDistance(primaryRgb, accentRgb)
    
    // If colors are significantly different, it's a multi-color set
    const MIN_COLOR_DIFFERENCE = 50 // Threshold for "significantly different"
    const isMultiColor = primaryModifierDistance > MIN_COLOR_DIFFERENCE || 
                        primaryAccentDistance > MIN_COLOR_DIFFERENCE
    
    console.log('🎯 Multi-color detection:', {
      primaryColor,
      modifierColor, 
      accentColor,
      primaryModifierDistance: Math.round(primaryModifierDistance),
      primaryAccentDistance: Math.round(primaryAccentDistance),
      threshold: MIN_COLOR_DIFFERENCE,
      isMultiColor
    })
    
    return isMultiColor
  }

  // Apply single color to all keycaps
  const applySingleColorToScene = (color: string) => {
    if ((window as any).scene) {
      const scene = (window as any).scene
      let keysUpdated = 0
      
      scene.traverse((object: any) => {
        if (object.material && object.type === 'Mesh') {
          const isKey = object.name?.toLowerCase().includes('key') || 
                       object.parent?.name?.toLowerCase().includes('key') ||
                       object.userData?.isKey === true
          
          if (isKey) {
            console.log('🔑 Updating key:', object.name)
            if (Array.isArray(object.material)) {
              object.material.forEach((mat: any) => {
                mat.color.setHex(parseInt(color.replace('#', '0x')))
                mat.needsUpdate = true
              })
            } else {
              object.material.color.setHex(parseInt(color.replace('#', '0x')))
              object.material.needsUpdate = true
            }
            keysUpdated++
          }
        }
      })
      
      console.log(`🎨 Applied single keycap color ${color} to ${keysUpdated} keys`)
      
      // Force re-render
      if ((window as any).renderer && (window as any).camera) {
        const renderer = (window as any).renderer
        const camera = (window as any).camera
        renderer.render(scene, camera)
      }
    } else {
      console.error('❌ Scene not available!')
    }
  }

  // Apply multi-color scheme to keycaps based on key types
  const applyMultiColorToScene = (colors: {primary: string, modifier: string, accent: string}) => {
    if (!(window as any).scene) {
      console.error('❌ Scene not available!')
      return
    }
    
    const scene = (window as any).scene
    let keysUpdated = 0
    
    // Define key categories based on QMK keycodes
    const keyCategories = {
      // Base keys (letters and numbers) - get primary color
      base: [
        'KC_A', 'KC_B', 'KC_C', 'KC_D', 'KC_E', 'KC_F', 'KC_G', 'KC_H', 'KC_I', 'KC_J', 
        'KC_K', 'KC_L', 'KC_M', 'KC_N', 'KC_O', 'KC_P', 'KC_Q', 'KC_R', 'KC_S', 'KC_T', 
        'KC_U', 'KC_V', 'KC_W', 'KC_X', 'KC_Y', 'KC_Z',
        'KC_1', 'KC_2', 'KC_3', 'KC_4', 'KC_5', 'KC_6', 'KC_7', 'KC_8', 'KC_9', 'KC_0',
        'KC_MINS', 'KC_EQL', 'KC_LBRC', 'KC_RBRC', 'KC_BSLS', 'KC_SCLN', 'KC_QUOT', 
        'KC_GRV', 'KC_COMM', 'KC_DOT', 'KC_SLSH'
      ],
      
      // Modifier keys - get modifier color
      modifier: [
        'KC_LSFT', 'KC_RSFT', 'KC_LCTL', 'KC_RCTL', 'KC_LALT', 'KC_RALT', 
        'KC_LGUI', 'KC_RGUI', 'KC_SPC', 'KC_TAB', 'KC_BSPC', 'KC_CAPS',
        'KC_F1', 'KC_F2', 'KC_F3', 'KC_F4', 'KC_F5', 'KC_F6', 'KC_F7', 'KC_F8', 
        'KC_F9', 'KC_F10', 'KC_F11', 'KC_F12',
        'KC_UP', 'KC_DOWN', 'KC_LEFT', 'KC_RGHT', 'KC_INS', 'KC_DEL', 
        'KC_HOME', 'KC_END', 'KC_PGUP', 'KC_PGDN'
      ],
      
      // Accent keys - get accent color  
      accent: ['KC_ENT', 'KC_ESC', 'KC_GESC']
    }
    
    scene.traverse((object: any) => {
      if (object.material && object.type === 'Mesh') {
        const isKey = object.name?.toLowerCase().includes('key') || 
                     object.parent?.name?.toLowerCase().includes('key') ||
                     object.userData?.isKey === true
        
        if (isKey && object.name) {
          // Try to extract keycode from object name
          const keyCode = object.name.match(/KC_[A-Z0-9_]+/)?.[0]
          
          if (keyCode) {
            let targetColor = colors.primary // Default to primary
            let keyType = 'base'
            
            // Determine which color this key should get
            if (keyCategories.accent.includes(keyCode)) {
              targetColor = colors.accent
              keyType = 'accent'
            } else if (keyCategories.modifier.includes(keyCode)) {
              targetColor = colors.modifier
              keyType = 'modifier'
            }
            
            // Apply the color
            if (Array.isArray(object.material)) {
              object.material.forEach((mat: any) => {
                mat.color.setHex(parseInt(targetColor.replace('#', '0x')))
                mat.needsUpdate = true
              })
            } else {
              object.material.color.setHex(parseInt(targetColor.replace('#', '0x')))
              object.material.needsUpdate = true
            }
            
            console.log(`🎨 Key ${keyCode}: Applied ${targetColor} (${keyType})`)
            keysUpdated++
          }
        }
      }
    })
    
    console.log(`🎨 Applied multi-color scheme to ${keysUpdated} keys:`, colors)
    
    // Force re-render
    if ((window as any).renderer && (window as any).camera) {
      const renderer = (window as any).renderer
      const camera = (window as any).camera
      renderer.render(scene, camera)
    }
  }

  // Smart function to apply keycap colors (single or multi-color)
  const applyKeycapColorToScene = (color: string, analysisResult?: any) => {
    if (analysisResult && isMultiColorKeycapSet(analysisResult)) {
      // Multi-color keycap set - apply different colors to different key types
      console.log('🌈 Detected multi-color keycap set - applying colorway')
      const colors = {
        primary: analysisResult.primary.hex,
        modifier: analysisResult.modifier.hex,  
        accent: analysisResult.accent.hex
      }
      applyMultiColorToScene(colors)
    } else {
      // Single-color keycap set - apply one color to all keys
      console.log('🎨 Detected single-color keycap set - applying uniform color')
      applySingleColorToScene(color)
    }
  }

  // Reusable function to apply case color to 3D scene
  const applyCaseColorToScene = (color: string) => {
    console.log('🏠 Auto-applying case color to 3D scene:', color)
    
    let updatesApplied = 0
    
    // Method 1: caseManager approach (most reliable)
    if ((window as any).caseManager) {
      const caseManager = (window as any).caseManager
      console.log('🏠 Using caseManager to update case color')
      
      try {
        caseManager.color = color
        if (caseManager.updateCaseMaterial) {
          caseManager.updateCaseMaterial(color)
          updatesApplied++
          console.log('✅ caseManager.updateCaseMaterial called')
        }
      } catch (error) {
        console.log('❌ caseManager update failed:', error)
      }
    }
    
    // Method 2: Scene traversal (backup approach)
    if ((window as any).scene) {
      const scene = (window as any).scene
      let sceneUpdates = 0
      
      scene.traverse((object: any) => {
        // Look for non-key mesh objects (case parts)
        if (object.material && object.type === 'Mesh') {
          const isKey = object.name?.toLowerCase().includes('key') || 
                       object.parent?.name?.toLowerCase().includes('key')
          
          if (!isKey) {
            try {
              if (Array.isArray(object.material)) {
                object.material.forEach((mat: any) => {
                  if (mat.color) {
                    mat.color.setHex(parseInt(color.replace('#', '0x')))
                    mat.needsUpdate = true
                    sceneUpdates++
                  }
                })
              } else if (object.material.color) {
                object.material.color.setHex(parseInt(color.replace('#', '0x')))
                object.material.needsUpdate = true
                sceneUpdates++
              }
            } catch (error) {
              // Silent failure for individual objects
            }
          }
        }
      })
      
      console.log(`🏠 Scene traversal: ${sceneUpdates} case materials updated`)
      updatesApplied += sceneUpdates > 0 ? 1 : 0
    }
    
    // Method 3: Force render
    if ((window as any).renderer && (window as any).scene && (window as any).camera) {
      try {
        const renderer = (window as any).renderer
        const scene = (window as any).scene  
        const camera = (window as any).camera
        renderer.render(scene, camera)
        console.log('✅ Forced render for case color update')
      } catch (error) {
        console.log('❌ Render failed:', error)
      }
    }
    
    console.log(`🏠 Total case color updates applied: ${updatesApplied}`)
    return updatesApplied > 0
  }

  // Handle keycap color analysis with specific products (fixes state timing issue)
  const handleAnalyzeKeycapColorsWithProducts = async (products: any) => {
    if (!products.keycaps) {
      console.log('⚠️ No keycaps provided for color analysis')
      return
    }

    setIsAnalyzing(true)
    console.log('🎨 Starting automatic keycap color analysis with products:', products.keycaps.title)
    
    try {
      // Get product image using the provided products
      const productImage = await colorAnalysis.getProductImage(products)
      
      console.log('✅ Got keycap product image:', productImage.substring(0, 50) + '...')
      console.log('🖼️ Image data length:', productImage.length, 'bytes')
      
      // Store the image for display in the UI
      setPreviewImage(productImage)
      
      // Perform AI color analysis
      console.log('🤖 Starting AI color analysis for keycaps...')
      const analysisResult = await colorAnalysis.analyzeColorsWithLLM(productImage, 'keycaps')
      
      console.log('✅ AI keycap analysis completed:', analysisResult)
      setColorAnalysisResult(analysisResult)
      
      // Smart keycap color application - handles both single and multi-color sets
      if (analysisResult && (analysisResult as any).primary && (analysisResult as any).primary.hex) {
        const primaryColor = (analysisResult as any).primary.hex
        console.log('🎨 Auto-applying keycap colors based on analysis:', analysisResult)
        
        // Update React state with primary color (for UI display)
        setKeyboardConfig(prev => ({ ...prev, keycap_color: primaryColor }))
        
        // Apply colors intelligently - pass full analysis result for multi-color detection
        applyKeycapColorToScene(primaryColor, analysisResult)
        
        // Show success message
        if (isMultiColorKeycapSet(analysisResult)) {
          console.log(`🌈 Auto-applied multi-color keycap scheme: Primary: ${(analysisResult as any).primary.name}, Modifier: ${(analysisResult as any).modifier?.name}, Accent: ${(analysisResult as any).accent?.name}`)
        } else {
          console.log(`🎨 Auto-applied single-color keycap scheme: ${(analysisResult as any).primary.name} (${primaryColor})`)
        }
      } else {
        console.log('⚠️ Keycap analysis complete but no primary color found in results')
      }
      
    } catch (error) {
      console.error('❌ Auto keycap color analysis error:', error)
      console.error('Error stack:', error.stack)
      
      // Silent failure for automatic analysis - just log the error
      console.log('❌ Automatic keycap color analysis failed, user can still customize manually')
    } finally {
      setIsAnalyzing(false)
    }
  }

  // Handle case color analysis with specific products
  const handleAnalyzeCaseColorsWithProducts = async (products: any) => {
    console.log('🏠 === CASE COLOR ANALYSIS DEBUG START ===')
    console.log('🔍 Products received:', products)
    console.log('🔍 Case product exists:', !!products.case)
    console.log('🔍 Case product details:', products.case)
    
    if (!products.case) {
      console.log('⚠️ No case provided for color analysis')
      return
    }

    setIsAnalyzing(true)
    console.log('🏠 Starting automatic case color analysis with products:', products.case.title)
    
    try {
      console.log('📸 Step 1: Getting case product image...')
      // Get product image using the provided products (case instead of keycaps)
      const productImage = await colorAnalysis.getProductImage(products)
      
      console.log('✅ Got case product image:', productImage.substring(0, 50) + '...')
      console.log('🖼️ Image data length:', productImage.length, 'bytes')
      
      // Store the image for display in the UI
      setPreviewImage(productImage)
      
      console.log('🤖 Step 2: Starting AI color analysis for case...')
      // Perform AI color analysis with case-specific prompt
      const analysisResult = await colorAnalysis.analyzeColorsWithLLM(productImage, 'case')
      
      console.log('✅ AI case analysis completed:', analysisResult)
      setColorAnalysisResult(analysisResult)
      
      console.log('🎨 Step 3: Applying colors to case...')
      // Extract primary color and apply to case
      if (analysisResult && (analysisResult as any).primary && (analysisResult as any).primary.hex) {
        const primaryColor = (analysisResult as any).primary.hex
        console.log('🏠 Auto-applying primary color to case:', primaryColor)
        
        console.log('🔄 Updating React state...')
        // Update React state
        setKeyboardConfig(prev => ({ ...prev, case_color: primaryColor }))
        
        console.log('🎨 Applying to 3D model...')
        // Apply to 3D model using case color function
        const success = applyCaseColorToScene(primaryColor)
        
        if (success) {
          console.log(`✅ Auto-applied case color: ${(analysisResult as any).primary.name} (${primaryColor})`)
        } else {
          console.log(`⚠️ Case color application may have failed`)
        }
      } else {
        console.log('⚠️ Case analysis complete but no primary color found in results')
        console.log('🔍 Analysis result structure:', JSON.stringify(analysisResult, null, 2))
      }
      
    } catch (error) {
      console.error('❌ Auto case color analysis error:', error)
      console.error('❌ Error name:', error.name)
      console.error('❌ Error message:', error.message)
      console.error('❌ Error stack:', error.stack)
      
      // Silent failure for automatic analysis - just log the error
      console.log('❌ Automatic case color analysis failed, user can still customize manually')
    } finally {
      console.log('🏠 === CASE COLOR ANALYSIS DEBUG END ===')
      setIsAnalyzing(false)
    }
  }

  // Handle color analysis (fallback for backward compatibility)
  const handleAnalyzeColors = async () => {
    if (selectedProducts.keycaps) {
      return handleAnalyzeKeycapColorsWithProducts(selectedProducts)
    } else if (selectedProducts.case) {
      return handleAnalyzeCaseColorsWithProducts(selectedProducts)
    } else {
      console.log('⚠️ No keycaps or case selected for color analysis')
    }
  }

  // Welcome/Landing Page with INSANE animations
  if (currentPage === 'welcome') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-slate-950 to-zinc-950 overflow-hidden">
        {/* Animated background particles */}
        <div className="absolute inset-0">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className={`absolute w-1 h-1 bg-slate-400/20 rounded-full animate-pulse transform transition-all duration-[3000ms] ${
                isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
              }`}
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${i * 150}ms`,
                animationDuration: `${3000 + i * 200}ms`
              }}
            />
          ))}
        </div>

        <div className="relative">
          {/* Gradient overlay with animation */}
          <div className={`absolute inset-0 bg-gradient-to-b from-transparent via-slate-950/30 to-slate-950/60 transition-opacity duration-1000 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          }`} />
          
          <div className="relative pt-16 px-6 pb-12">
            {/* Spinning Keycap Logo - HERO ANIMATION */}
            <div className="text-center mb-16">
              <div className={`relative inline-block mb-8 transform transition-all duration-1000 ${
                isLoaded ? 'opacity-100 translate-y-0 rotate-0 scale-100' : 'opacity-0 translate-y-20 rotate-180 scale-50'
              } animate-float`}>
                {/* 3D Keycap with K letter */}
                <div className="relative w-24 h-24 mx-auto">
                  {/* Outer glow ring */}
                  <div className="absolute -inset-6 bg-gradient-to-r from-blue-500/30 via-purple-500/30 to-cyan-500/30 rounded-full blur-2xl animate-spin-slow" />
                  <div className="absolute -inset-4 bg-gradient-to-r from-purple-500/40 via-blue-500/40 to-violet-500/40 rounded-full blur-xl animate-glow-pulse" />
                  
                  {/* Keycap base with enhanced 3D effect */}
                  <div className="absolute inset-0 bg-gradient-to-br from-slate-600 via-slate-700 to-slate-900 rounded-2xl border border-slate-500/60 shadow-2xl transform rotate-12">
                    <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-black/20 rounded-2xl" />
                  </div>
                  <div className="absolute inset-1 bg-gradient-to-br from-slate-500 via-slate-600 to-slate-800 rounded-xl border border-slate-400/40">
                    <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-black/30 rounded-xl" />
                  </div>
                  
                  {/* Keycap top surface */}
                  <div className="absolute inset-2 bg-gradient-to-br from-slate-400 via-slate-500 to-slate-700 rounded-lg border border-slate-300/50 shadow-inner">
                    <div className="absolute inset-0 bg-gradient-to-br from-white/30 via-white/10 to-transparent rounded-lg" />
                  </div>
                  
                  {/* Epic spinning K letter with multiple effects */}
                  <div className={`absolute inset-0 flex items-center justify-center transform transition-transform duration-2000 ${
                    isLoaded ? 'rotate-[1080deg]' : 'rotate-0'
                  }`}>
                    <div className="relative">
                      {/* Letter shadow */}
                      <span className="absolute inset-0 text-3xl font-black text-black/50 blur-sm transform translate-x-0.5 translate-y-0.5">
                        K
                      </span>
                      {/* Main letter with gradient */}
                      <span className="relative text-3xl font-black bg-gradient-to-br from-white via-blue-200 to-purple-200 bg-clip-text text-transparent filter drop-shadow-lg">
                        K
                      </span>
                      {/* Highlight effect */}
                      <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-transparent to-transparent text-3xl font-black bg-clip-text text-transparent animate-pulse">
                        K
                      </div>
                    </div>
                  </div>
                  
                  {/* Enhanced glow effects */}
                  <div className="absolute -inset-3 bg-gradient-to-r from-cyan-500/20 via-blue-500/20 to-purple-500/20 rounded-3xl blur-lg animate-pulse" />
                  <div className="absolute -inset-1 bg-gradient-to-r from-blue-400/40 to-purple-400/40 rounded-2xl blur-md animate-glow-pulse" />
                  
                  {/* Particle effects */}
                  {[...Array(8)].map((_, i) => (
                    <div
                      key={i}
                      className="absolute w-1 h-1 bg-blue-400 rounded-full animate-ping"
                      style={{
                        top: `${20 + Math.sin(i * 0.785) * 15}%`,
                        left: `${50 + Math.cos(i * 0.785) * 15}%`,
                        animationDelay: `${i * 200}ms`,
                        animationDuration: '2s'
                      }}
                    />
                  ))}
                </div>
              </div>
              
              {/* Animated title with staggered reveal */}
              <div className="overflow-hidden">
                <h1 className={`text-5xl font-light text-white mb-4 tracking-tight transform transition-all duration-1000 delay-300 ${
                  isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
                }`}>
                  Custom
                  <span className={`block font-semibold bg-gradient-to-r from-slate-200 via-white to-slate-300 bg-clip-text text-transparent transform transition-all duration-1000 delay-500 ${
                    isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
                  }`}>
                    Keyboards
                  </span>
                </h1>
              </div>
              
              <p className={`text-slate-400 text-lg font-light max-w-sm mx-auto leading-relaxed transform transition-all duration-1000 delay-700 ${
                isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}>
                Design, visualize, and perfect your ideal mechanical keyboard experience
              </p>
            </div>

            {/* Feature Cards with staggered floating animation */}
            <div className="grid grid-cols-1 gap-4 mb-12 max-w-sm mx-auto">
              {[
                {
                  icon: <div className="w-5 h-3 bg-blue-400 rounded-sm opacity-80 animate-pulse" />,
                  gradient: "from-blue-500/20 to-blue-600/20 border-blue-500/30",
                  title: "3D Visualization",
                  desc: "Real-time rendering of every component and customization",
                  delay: "delay-[900ms]"
                },
                {
                  icon: <div className="w-4 h-4 rounded-full bg-emerald-400 opacity-80 animate-pulse" />,
                  gradient: "from-emerald-500/20 to-emerald-600/20 border-emerald-500/30",
                  title: "Authentic Sound",
                  desc: "Experience realistic switch sounds and typing feedback",
                  delay: "delay-[1100ms]"
                },
                {
                  icon: (
                    <div className="grid grid-cols-2 gap-0.5 w-4 h-4">
                      <div className="bg-violet-400 rounded-sm opacity-80 animate-pulse" />
                      <div className="bg-violet-400 rounded-sm opacity-60 animate-pulse" />
                      <div className="bg-violet-400 rounded-sm opacity-60 animate-pulse" />
                      <div className="bg-violet-400 rounded-sm opacity-80 animate-pulse" />
                    </div>
                  ),
                  gradient: "from-violet-500/20 to-violet-600/20 border-violet-500/30",
                  title: "Premium Components",
                  desc: "Choose from curated switches, keycaps, and materials",
                  delay: "delay-[1300ms]"
                }
              ].map((feature, index) => (
                <div
                  key={index}
                  className={`group p-6 rounded-2xl bg-slate-900/40 border border-slate-800/50 backdrop-blur-sm transition-all duration-700 hover:bg-slate-900/60 hover:scale-105 hover:-translate-y-1 hover:shadow-2xl transform ${feature.delay} ${
                    isLoaded ? 'opacity-100 translate-y-0 rotate-0' : `opacity-0 translate-y-12 rotate-${index * 2 + 1}`
                  }`}
                >
                  <div className="flex items-start space-x-4">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12`}>
                      {feature.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-white text-sm mb-1 transition-colors duration-300 group-hover:text-blue-300">{feature.title}</h3>
                      <p className="text-slate-400 text-xs leading-relaxed transition-colors duration-300 group-hover:text-slate-300">{feature.desc}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Primary CTA with epic entrance */}
            <div className={`space-y-4 max-w-sm mx-auto transform transition-all duration-1000 delay-[1500ms] ${
              isLoaded ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-8 scale-95'
            }`}>
              <button
                onClick={() => setCurrentPage('preferences')}
                className="relative w-full bg-white text-slate-950 font-medium py-4 px-6 rounded-2xl shadow-lg shadow-white/10 hover:shadow-white/30 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] overflow-hidden group"
              >
                {/* Animated background effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-out" />
                <span className="relative z-10">Start Building</span>
              </button>
            </div>

            {/* Trust Indicators with gentle float-in */}
            <div className={`mt-12 pt-8 border-t border-slate-800/50 transform transition-all duration-1000 delay-[1700ms] ${
              isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}>
              <div className="flex items-center justify-center space-x-8 text-xs text-slate-500">
                {[
                  { color: "bg-emerald-400", text: "Free Shipping" },
                  { color: "bg-blue-400", text: "30-Day Returns" },
                  { color: "bg-violet-400", text: "2-Year Warranty" }
                ].map((item, index) => (
                  <div key={index} className="flex items-center space-x-2 transition-all duration-300 hover:text-slate-300">
                    <div className={`w-1.5 h-1.5 ${item.color} rounded-full animate-pulse`} style={{ animationDelay: `${index * 200}ms` }} />
                    <span>{item.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer Links */}
            <div className={`mt-8 pt-4 border-t border-slate-800/30 transform transition-all duration-1000 delay-[1900ms] ${
              isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}>
              <div className="flex items-center justify-center space-x-6 text-xs text-slate-500">
                <button
                  onClick={() => setCurrentPage('privacy-policy')}
                  className="hover:text-slate-300 transition-colors duration-200 underline decoration-slate-600 hover:decoration-slate-400"
                >
                  Privacy Policy
                </button>
                <span className="text-slate-600">•</span>
                <button
                  onClick={() => setCurrentPage('terms-of-service')}
                  className="hover:text-slate-300 transition-colors duration-200 underline decoration-slate-600 hover:decoration-slate-400"
                >
                  Terms of Service
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Preferences Page - No 3D Preview, Just Preference Selection
  if (currentPage === 'preferences') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-slate-950 to-zinc-950">
        <div className="pt-4 px-4 pb-24">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setCurrentPage('welcome')}
                className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-700/50 text-slate-300 hover:text-white hover:bg-slate-900/80 transition-all duration-200"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div>
                <h1 className="text-xl font-semibold text-white">Preferences</h1>
                <p className="text-slate-400 text-sm">Tell us your preferences for personalized recommendations</p>
              </div>
            </div>
          </div>

          {/* Configuration Sections */}
          <div className="space-y-6">
            {/* Layout Selection */}
            <div>
              <h2 className="text-lg font-medium text-white mb-4">Preferred Layout</h2>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: 'tkl', name: 'TKL', desc: '87 keys' },
                  { id: '60', name: '60%', desc: '61 keys' },
                  { id: 'full', name: 'Full', desc: '104 keys' },
                ].map((layout) => (
                  <button
                    key={layout.id}
                    onClick={() => setKeyboardConfig(prev => ({ ...prev, layout: layout.id as any }))}
                    className={`p-4 rounded-xl border transition-all duration-200 ${
                      keyboardConfig.layout === layout.id
                        ? 'bg-white/10 border-white/30 text-white'
                        : 'bg-slate-900/40 border-slate-700/50 text-slate-300 hover:bg-slate-900/60 hover:border-slate-600/50'
                    }`}
                  >
                    <div className="font-medium text-sm mb-1">{layout.name}</div>
                    <div className="text-xs opacity-70">{layout.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Switch Type */}
            <div>
              <h2 className="text-lg font-medium text-white mb-4">Switch Type Preference</h2>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: 'linear', name: 'Linear', desc: 'Smooth & Fast', color: 'from-red-500/30 to-red-600/30 border-red-500/40' },
                  { id: 'tactile', name: 'Tactile', desc: 'Bumpy Feel', color: 'from-amber-500/30 to-amber-600/30 border-amber-500/40' },
                  { id: 'clicky', name: 'Clicky', desc: 'Audible Click', color: 'from-blue-500/30 to-blue-600/30 border-blue-500/40' },
                ].map((switch_) => (
                  <button
                    key={switch_.id}
                    onClick={() => setKeyboardConfig(prev => ({ ...prev, switches: switch_.id as any }))}
                    className={`p-4 rounded-xl border transition-all duration-200 ${
                      keyboardConfig.switches === switch_.id
                        ? `bg-gradient-to-br ${switch_.color} text-white`
                        : 'bg-slate-900/40 border-slate-700/50 text-slate-300 hover:bg-slate-900/60'
                    }`}
                  >
                    <div className="font-medium text-sm mb-1">{switch_.name}</div>
                    <div className="text-xs opacity-70">{switch_.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Case Material */}
            <div>
              <h2 className="text-lg font-medium text-white mb-4">Case Material Preference</h2>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { id: 'aluminum', name: 'Aluminum', desc: 'Premium & Durable' },
                  { id: 'plastic', name: 'Plastic', desc: 'Lightweight' },
                  { id: 'wood', name: 'Wood', desc: 'Natural & Warm' },
                  { id: 'carbon', name: 'Carbon Fiber', desc: 'Ultra Premium' },
                ].map((material) => (
                  <button
                    key={material.id}
                    onClick={() => setKeyboardConfig(prev => ({ ...prev, case: material.id as any }))}
                    className={`p-4 rounded-xl border transition-all duration-200 text-left ${
                      keyboardConfig.case === material.id
                        ? 'bg-white/10 border-white/30 text-white'
                        : 'bg-slate-900/40 border-slate-700/50 text-slate-300 hover:bg-slate-900/60'
                    }`}
                  >
                    <div className="font-medium text-sm mb-1">{material.name}</div>
                    <div className="text-xs opacity-70">{material.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Keycap Profile */}
            <div>
              <h2 className="text-lg font-medium text-white mb-4">Keycap Profile</h2>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { id: 'cherry', name: 'Cherry', desc: 'Low profile, comfortable' },
                  { id: 'oem', name: 'OEM', desc: 'Standard height' },
                  { id: 'sa', name: 'SA', desc: 'High profile, sculpted' },
                  { id: 'xda', name: 'XDA', desc: 'Uniform, flat' },
                ].map((profile) => (
                  <button
                    key={profile.id}
                    onClick={() => setKeyboardConfig(prev => ({ ...prev, keycaps: profile.id as any }))}
                    className={`p-4 rounded-xl border transition-all duration-200 text-left ${
                      keyboardConfig.keycaps === profile.id
                        ? 'bg-white/10 border-white/30 text-white'
                        : 'bg-slate-900/40 border-slate-700/50 text-slate-300 hover:bg-slate-900/60'
                    }`}
                  >
                    <div className="font-medium text-sm mb-1">{profile.name}</div>
                    <div className="text-xs opacity-70">{profile.desc}</div>
                  </button>
                ))}
              </div>
            </div>

          </div>

          {/* Fixed Bottom Actions */}
          <div className="fixed bottom-0 left-0 right-0 bg-slate-950/90 backdrop-blur-sm border-t border-slate-800/50 p-4">
            <div className="flex space-x-3">
              <button 
                onClick={() => setCurrentPage('welcome')}
                className="flex-1 bg-slate-900/60 border border-slate-700/50 text-slate-300 font-medium py-3 px-4 rounded-xl hover:bg-slate-900/80 transition-all duration-200"
              >
                Back
              </button>
              <button 
                onClick={() => setCurrentPage('builder')}
                className="flex-1 bg-white text-slate-950 font-medium py-3 px-4 rounded-xl hover:shadow-lg transition-all duration-200"
              >
                Select Parts
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Builder Page - Shows 3D Keyboard with Basic Config
  if (currentPage === 'builder') {
  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-slate-950 to-zinc-950">
      <div className="pt-4 px-4 pb-24">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setCurrentPage('preferences')}
              className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-700/50 text-slate-300 hover:text-white hover:bg-slate-900/80 transition-all duration-200"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div>
                <h1 className="text-xl font-semibold text-white">Your Keyboard</h1>
                <p className="text-slate-400 text-sm">Based on your preferences</p>
            </div>
          </div>
          
          <button className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-700/50 text-slate-300 hover:text-white hover:bg-slate-900/80 transition-all duration-200">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.1 5H17M9 19.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM20 19.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
            </svg>
          </button>
        </div>

          {/* 3D KeySim Viewer - REAL from GitHub */}
          <div className="mb-8 h-80 rounded-2xl bg-gradient-to-br from-slate-900/60 to-slate-800/60 border border-slate-700/50 backdrop-blur-sm relative overflow-hidden">
            <RealKeysim
              layout="80"
              caseColor={keyboardConfig.case_color}
              keycapColor={keyboardConfig.keycap_color}
              switchColor={keyboardConfig.switch_color}
            />
            
            {/* Auto Color Analysis Loading Overlay */}
            {isAnalyzing && (
              <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center">
                <div className={`border rounded-2xl p-6 text-center ${
                  selectedProducts.case ? 
                    'bg-orange-900/90 border-orange-700/50' : 
                    'bg-violet-900/90 border-violet-700/50'
                }`}>
                  <div className={`w-12 h-12 border-4 rounded-full animate-spin mx-auto mb-4 ${
                    selectedProducts.case ?
                      'border-orange-400/30 border-t-orange-400' :
                      'border-violet-400/30 border-t-violet-400'
                  }`}></div>
                  <h3 className={`font-medium mb-2 ${
                    selectedProducts.case ? 
                      'text-orange-300' : 
                      'text-violet-300'
                  }`}>
                    {selectedProducts.case ? '🏠 Analyzing Case Colors' : '🤖 Analyzing Keycap Colors'}
                  </h3>
                  <p className={`text-sm ${
                    selectedProducts.case ? 
                      'text-orange-400/80' : 
                      'text-violet-400/80'
                  }`}>
                    {selectedProducts.case ? 
                      'AI is detecting case colors and applying them to your keyboard...' :
                      'AI is detecting keycap colors and applying them to your keyboard...'
                    }
                  </p>
                </div>
              </div>
            )}
            
            {/* Touch to rotate hint */}
            <div className="absolute bottom-4 left-4 text-slate-400 text-xs">
              Drag to rotate • Pinch to zoom
            </div>
            
            {/* Debug Mode Toggle */}
            <button
              onClick={() => setDebugMode(!debugMode)}
              className="absolute top-4 right-4 bg-red-600/80 hover:bg-red-600 text-white px-3 py-1 rounded-lg text-xs transition-colors hidden"
              title={debugMode ? "Hide Debug Info" : "Show Debug Info"}
            >
              {debugMode ? "🔧 Debug ON" : "🔧 Debug"}
            </button>
          </div>

          {/* Auto Switch Matcher - Detects user's switch selection and matches sound */}
          <div className="mb-4 hidden">
            <AutoSwitchMatcher
              switchType={keyboardConfig.switches}
              selectedSwitchProduct={selectedProducts.switches}
              onSoundProfileMatched={handleAutoSoundProfileMatch}
              currentSoundProfile={currentSoundProfile}
              enableDebug={debugMode}
              className="shadow-lg"
            />
          </div>

          {/* Hidden sound system - runs in background */}
          <div className="hidden">
            <MultiProfileKeyboardSounds 
              compactMode={true}
              enableAISelector={false}
              externalProfile={currentSoundProfile}
              onProfileChange={handleSoundProfileChange}
              externalAudioEnabled={isAudioEnabled}
              onAudioStateChange={handleAudioStateChange}
              hideAudioControls={true} // Hide all UI controls
              autoInitialize={true}
              className=""
              onSoundPlay={(key) => {
                // Sound played
              }}
              onVirtualKeyPress={(key, code) => {
                // Virtual key press
              }}
            />
          </div>

          {/* Virtual Keyboard */}
          <div className="mb-8">
            <VirtualKeyboard 
              onKeyPress={(key) => {
                // Get the sound component and call its playKeyboardSound function directly
                const soundComponent = window.multiProfileKeyboardSounds;
                if (soundComponent && soundComponent.playKeyboardSound) {
                  soundComponent.playKeyboardSound(key);
                }
              }}
              isAudioEnabled={isAudioEnabled}
              className="shadow-lg"
            />
          </div>

          {/* Component Details */}
          <div className="space-y-4 mb-8 relative z-20">
            <div className="space-y-4">
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
                className={`w-full bg-slate-900/40 border rounded-xl p-4 hover:bg-slate-900/60 transition-all duration-200 text-left group cursor-pointer relative z-30 touch-manipulation ${
                  isAnalyzing 
                    ? 'border-violet-500/50 bg-violet-900/20' 
                    : 'border-slate-700/50 hover:border-blue-500/50'
                }`}
              >
                <div className="flex items-center space-x-2 mb-2">
                  <div className={`w-3 h-3 rounded-full transition-transform ${
                    isAnalyzing 
                      ? 'bg-violet-500 animate-pulse' 
                      : 'bg-blue-500 group-hover:scale-110'
                  }`}></div>
                  <h3 className={`font-medium text-sm transition-colors ${
                    isAnalyzing 
                      ? 'text-violet-300' 
                      : 'text-white group-hover:text-blue-300'
                  }`}>
                    Keycaps {isAnalyzing && '🤖'}
                  </h3>
                  {isAnalyzing ? (
                    <div className="w-3 h-3 border-2 border-violet-400/30 border-t-violet-400 rounded-full animate-spin ml-auto"></div>
                  ) : (
                    <svg className="w-3 h-3 text-slate-500 group-hover:text-blue-400 ml-auto opacity-0 group-hover:opacity-100 transition-all duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  )}
          </div>
                {selectedProducts.keycaps ? (
                  <>
                    <p className="text-slate-300 text-xs font-medium group-hover:text-white transition-colors">{selectedProducts.keycaps.title}</p>
                    {isAnalyzing ? (
                      <p className="text-violet-400 text-xs mt-1 animate-pulse">Analyzing colors...</p>
                    ) : (
                      <p className="text-green-400 text-xs mt-1">${(() => {
                        const product = selectedProducts.keycaps
                        return product.priceRange?.minVariantPrice?.amount ||
                               product.priceRange?.min?.amount ||
                               product.variants?.[0]?.priceV2?.amount ||
                               product.variants?.[0]?.price ||
                               product.price?.amount ||
                               product.price ||
                               'N/A'
                      })()}</p>
                    )}
                  </>
                ) : (
                  <>
                    <p className="text-slate-400 text-xs group-hover:text-slate-300 transition-colors">{keyboardConfig.keycaps.toUpperCase()} Profile</p>
                    <p className="text-slate-500 text-xs mt-1 group-hover:text-blue-400/70 transition-colors">Click to shop</p>
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
                className="w-full bg-slate-900/40 border border-slate-700/50 rounded-xl p-4 hover:bg-slate-900/60 hover:border-amber-500/50 transition-all duration-200 text-left group cursor-pointer relative z-30 touch-manipulation"
              >
                <div className="flex items-center space-x-2 mb-2">
                  <div className="w-3 h-3 bg-amber-500 rounded-full group-hover:scale-110 transition-transform"></div>
                  <h3 className="text-white font-medium text-sm group-hover:text-amber-300 transition-colors">Switches</h3>
                  <svg className="w-3 h-3 text-slate-500 group-hover:text-amber-400 ml-auto opacity-0 group-hover:opacity-100 transition-all duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
          </div>
                {selectedProducts.switches ? (
                  <>
                    <p className="text-slate-300 text-xs font-medium group-hover:text-white transition-colors">{selectedProducts.switches.title}</p>
                    <p className="text-green-400 text-xs mt-1">${(() => {
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
                    <p className="text-slate-400 text-xs group-hover:text-slate-300 transition-colors">{keyboardConfig.switches} Type</p>
                    <p className="text-slate-500 text-xs mt-1 group-hover:text-amber-400/70 transition-colors">Click to shop</p>
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
                className={`w-full bg-slate-900/40 border rounded-xl p-4 hover:bg-slate-900/60 transition-all duration-200 text-left group cursor-pointer relative z-30 touch-manipulation ${
                  isAnalyzing && selectedProducts.case
                    ? 'border-orange-500/50 bg-orange-900/20' 
                    : 'border-slate-700/50 hover:border-slate-400/50'
                }`}
              >
              <div className="flex items-center space-x-2 mb-2">
                  <div className={`w-3 h-3 rounded-full transition-transform ${
                    isAnalyzing && selectedProducts.case
                      ? 'bg-orange-500 animate-pulse' 
                      : 'bg-slate-500 group-hover:scale-110'
                  }`}></div>
                  <h3 className={`font-medium text-sm transition-colors ${
                    isAnalyzing && selectedProducts.case
                      ? 'text-orange-300' 
                      : 'text-white group-hover:text-slate-300'
                  }`}>
                    Case {isAnalyzing && selectedProducts.case && '🏠'}
                  </h3>
                  {isAnalyzing && selectedProducts.case ? (
                    <div className="w-3 h-3 border-2 border-orange-400/30 border-t-orange-400 rounded-full animate-spin ml-auto"></div>
                  ) : (
                    <svg className="w-3 h-3 text-slate-500 group-hover:text-slate-400 ml-auto opacity-0 group-hover:opacity-100 transition-all duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  )}
                </div>
                {selectedProducts.case ? (
                  <>
                    <p className="text-slate-300 text-xs font-medium group-hover:text-white transition-colors">{selectedProducts.case.title}</p>
                    {isAnalyzing && selectedProducts.case ? (
                      <p className="text-orange-400 text-xs mt-1 animate-pulse">Analyzing colors...</p>
                    ) : (
                      <p className="text-green-400 text-xs mt-1">${(() => {
                        const product = selectedProducts.case
                        return product.priceRange?.minVariantPrice?.amount ||
                               product.priceRange?.min?.amount ||
                               product.variants?.[0]?.priceV2?.amount ||
                               product.variants?.[0]?.price ||
                               product.price?.amount ||
                               product.price ||
                               'N/A'
                      })()}</p>
                    )}
                  </>
                ) : (
                  <>
                    <p className="text-slate-400 text-xs group-hover:text-slate-300 transition-colors">{keyboardConfig.case} Material</p>
                    <p className="text-slate-500 text-xs mt-1 group-hover:text-slate-400/70 transition-colors">Click to shop</p>
                  </>
                )}
              </button>
            </div>
          </div>


          {/* DEBUG: Auto Switch Analysis Results */}
          {debugMode && autoSwitchAnalysisResult && (
            <div className="mb-8 p-4 rounded-2xl bg-purple-900/20 border-2 border-purple-500/50">
              <h3 className="text-purple-300 font-bold text-lg mb-4">🤖 DEBUG: Auto Switch Analysis</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-900/60 rounded-xl p-4">
                  <h4 className="text-white font-medium mb-2">📡 Switch Detection</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Input:</span>
                      <span className="text-white">{autoSwitchAnalysisResult.switchInput}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Type:</span>
                      <span className="text-white">{autoSwitchAnalysisResult.switchType}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Analysis:</span>
                      <span className="text-blue-400">{autoSwitchAnalysisResult.analysisType}</span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-slate-900/60 rounded-xl p-4">
                  <h4 className="text-white font-medium mb-2">🎯 AI Match Result</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Matched:</span>
                      <span className="text-green-400">{autoSwitchAnalysisResult.profileDetails?.name || autoSwitchAnalysisResult.matchedProfile}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Confidence:</span>
                      <span className={autoSwitchAnalysisResult.confidence >= 7 ? 'text-green-400' : autoSwitchAnalysisResult.confidence >= 5 ? 'text-yellow-400' : 'text-red-400'}>
                        {autoSwitchAnalysisResult.confidence?.toFixed(1) || 'N/A'}/10
                      </span>
                    </div>
                  </div>
                  
                  <div className="mt-3 p-2 bg-slate-800/50 rounded text-xs">
                    <strong className="text-purple-300">Reasoning:</strong>
                    <p className="text-slate-300 mt-1">
                      {autoSwitchAnalysisResult.reasoning}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="mt-4 text-center">
                <button 
                  onClick={() => {
                    setAutoSwitchAnalysisResult(null);
                  }}
                  className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors text-sm"
                >
                  Clear Analysis Data
                </button>
              </div>
            </div>
          )}

          {/* DEBUG: AI Color Analysis Results */}
          {debugMode && (colorAnalysisResult || previewImage) && (
            <div className="mb-8 p-4 rounded-2xl bg-red-900/20 border-2 border-red-500/50">
              <h3 className="text-red-300 font-bold text-lg mb-4">🔧 DEBUG: AI Color Analysis Results</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Product Image Preview */}
                {previewImage && (
                  <div className="bg-slate-900/60 rounded-xl p-4">
                    <h4 className="text-white font-medium mb-2">📸 Product Image Sent to AI</h4>
                    <img 
                      src={previewImage} 
                      alt="Product analyzed by AI"
                      className="w-full max-h-48 object-contain rounded-lg border border-slate-600"
                    />
                    <p className="text-slate-400 text-xs mt-2">
                      Image size: {previewImage.length.toLocaleString()} characters
                    </p>
                  </div>
                )}
                
                {/* AI Analysis Results */}
                {colorAnalysisResult && (
                  <div className="bg-slate-900/60 rounded-xl p-4">
                    <h4 className="text-white font-medium mb-2">🤖 AI Color Detection Results</h4>
                    <div className="space-y-2">
                      {colorAnalysisResult.primary && (
                        <div className="flex items-center space-x-2">
                          <div 
                            className="w-6 h-6 rounded border border-slate-500"
                            style={{ backgroundColor: colorAnalysisResult.primary.hex }}
                          ></div>
                          <span className="text-white text-sm">
                            Primary: {colorAnalysisResult.primary.name} ({colorAnalysisResult.primary.hex})
                          </span>
                          <span className="text-green-400 text-xs">
                            Confidence: {colorAnalysisResult.primary.confidence}/10
                          </span>
                        </div>
                      )}
                      
                      {colorAnalysisResult.modifier && (
                        <div className="flex items-center space-x-2">
                          <div 
                            className="w-6 h-6 rounded border border-slate-500"
                            style={{ backgroundColor: colorAnalysisResult.modifier.hex }}
                          ></div>
                          <span className="text-white text-sm">
                            Modifier: {colorAnalysisResult.modifier.name} ({colorAnalysisResult.modifier.hex})
                          </span>
                        </div>
                      )}
                      
                      {colorAnalysisResult.accent && (
                        <div className="flex items-center space-x-2">
                          <div 
                            className="w-6 h-6 rounded border border-slate-500"
                            style={{ backgroundColor: colorAnalysisResult.accent.hex }}
                          ></div>
                          <span className="text-white text-sm">
                            Accent: {colorAnalysisResult.accent.name} ({colorAnalysisResult.accent.hex})
                          </span>
                        </div>
                      )}
                    </div>
                    
                    <div className="mt-3 p-2 bg-slate-800/50 rounded text-xs">
                      <strong className="text-blue-300">Raw AI Response:</strong>
                      <pre className="text-slate-300 mt-1 whitespace-pre-wrap">
                        {JSON.stringify(colorAnalysisResult, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="mt-4 text-center">
                <button 
                  onClick={() => {
                    setColorAnalysisResult(null)
                    setPreviewImage(null)
                  }}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm"
                >
                  Clear Debug Data
                </button>
              </div>
            </div>
          )}

          
          {/* Fixed Bottom Actions */}
          <div className="fixed bottom-0 left-0 right-0 bg-slate-950 backdrop-blur-sm border-t border-slate-800/50 p-4">
            <div className="flex space-x-2">
              <button 
                onClick={() => setCurrentPage('customizer')}
                className="flex-1 bg-slate-900/60 border border-slate-700/50 text-slate-300 font-medium py-3 px-3 rounded-xl hover:bg-slate-900/80 transition-all duration-200 text-sm hidden"
              >
                Customize Colors
              </button>
              <button 
                onClick={() => setCurrentPage('case-customizer')}
                className="flex-1 bg-slate-900/60 border border-slate-700/50 text-slate-300 font-medium py-3 px-3 rounded-xl hover:bg-slate-900/80 transition-all duration-200 text-sm hidden"
              >
                Customize Case
              </button>
              <button
                onClick={() => setIsCartOpen(true)}
                className="bg-slate-900/60 border border-slate-700/50 text-slate-300 font-medium py-3 px-3 rounded-xl hover:bg-slate-900/80 transition-all duration-200 flex items-center space-x-1"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.1 5H17M9 19.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM20 19.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                </svg>
              </button>
              <button 
                onClick={handleAddToCart}
                disabled={(!selectedProducts.keycaps && !selectedProducts.switches && !selectedProducts.case) || isAddingToCart}
                className="flex-1 bg-white text-slate-950 font-medium py-3 px-3 rounded-xl hover:shadow-lg transition-all duration-200 text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {isAddingToCart ? (
                  <>
                    <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
                    <span>Adding...</span>
                  </>
                ) : (
                  <span>Add to Cart - ${calculateCartTotal().toFixed(2)}</span>
                )}
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

        {/* Minimal Audio Toggle - Bottom Left */}
        <MinimalAudioToggle
          onAudioStateChange={handleAudioStateChange}
          isAudioEnabled={isAudioEnabled}
          hasSelectedSwitch={hasSelectedSwitch}
          currentSwitchName={getCurrentSwitchName()}
          className=""
        />

        {/* Simple Cart Summary Modal */}
        {isCartOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-slate-950 w-full max-w-md rounded-2xl border border-slate-800/50 overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-slate-800/50">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.1 5H17M9 19.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM20 19.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-white font-semibold text-lg">Cart Summary</h2>
                    <p className="text-slate-400 text-sm">Your keyboard build</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="w-8 h-8 bg-slate-800/50 hover:bg-slate-700/50 rounded-lg flex items-center justify-center transition-all duration-200"
                >
                  <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Cart Items */}
              <div className="p-6 space-y-4">
                {selectedProducts.keycaps && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <span className="text-white text-sm">Keycaps</span>
              </div>
                    <span className="text-green-400 font-medium text-sm">
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
                <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
                      <span className="text-white text-sm">Switches</span>
              </div>
                    <span className="text-green-400 font-medium text-sm">
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
                <div className="w-3 h-3 bg-slate-500 rounded-full"></div>
                      <span className="text-white text-sm">Case</span>
              </div>
                    <span className="text-green-400 font-medium text-sm">
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
                <div className="border-t border-slate-700/50 pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Subtotal</span>
                    <span className="text-white">${calculateCartTotal().toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Tax (8%)</span>
                    <span className="text-white">${(calculateCartTotal() * 0.08).toFixed(2)}</span>
                  </div>
                  <div className="border-t border-slate-700/50 pt-2 flex justify-between">
                    <span className="text-white font-semibold">Total</span>
                    <span className="text-white font-semibold text-lg">${(calculateCartTotal() * 1.08).toFixed(2)}</span>
                  </div>
                </div>

                {/* Cart Action Buttons */}
                <div className="space-y-3">
                  <button 
                    onClick={handleAddToCart}
                    disabled={(!selectedProducts.keycaps && !selectedProducts.switches && !selectedProducts.case) || isAddingToCart}
                    className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 hover:shadow-lg hover:shadow-blue-500/25 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                  >
                    {isAddingToCart ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Adding to Cart...</span>
                      </>
                    ) : (
                      <span>Add All to Cart</span>
                    )}
                  </button>
                  
                  <button 
                    onClick={handleBuyNow}
                    disabled={!selectedProducts.keycaps || isBuying}
                    className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 hover:shadow-lg hover:shadow-green-500/25 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                  >
                    {isBuying ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Processing...</span>
                      </>
                    ) : (
                      <span>Buy Keycaps Now</span>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    )
  }

  // KEYCAP Color Customizer Page (Customize Colors button)
  if (currentPage === 'customizer') {
    
    // Keycap color options
    const keycapColorOptions = [
      { name: 'Blue', value: '#4a90e2' },
      { name: 'White', value: '#ffffff' },
      { name: 'Black', value: '#333333' },
      { name: 'Red', value: '#ff4757' },
      { name: 'Green', value: '#2ed573' },
      { name: 'Purple', value: '#a55eea' },
      { name: 'Orange', value: '#ffa726' },
      { name: 'Pink', value: '#fd79a8' },
      { name: 'Cyan', value: '#00d2d3' },
      { name: 'Yellow', value: '#feca57' },
    ]
    
    const updateKeycapColor = (newColor: string) => {
      console.log('🎨 Manually updating keycap color to:', newColor)
      
      // Update React state
      setKeyboardConfig(prev => ({ ...prev, keycap_color: newColor }))
      
      // Apply to 3D scene - manual selection always uses single color (no analysis result)
      applyKeycapColorToScene(newColor)
    }



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
                <h1 className="text-xl font-semibold text-white">Customize Keycap Colors</h1>
                <p className="text-slate-400 text-sm">Choose your keycap colors</p>
              </div>
            </div>
          </div>

          {/* Current Keycap Color Display */}
          <div className="mb-6">
            <div className="bg-slate-900/60 border border-slate-700/50 rounded-xl p-4">
              <div className="flex items-center space-x-4">
                <div 
                  className="w-12 h-12 rounded-xl border-2 border-slate-600"
                  style={{ backgroundColor: keyboardConfig.keycap_color }}
                ></div>
                <div>
                  <h3 className="text-white font-medium">Current Keycap Color</h3>
                  <p className="text-slate-400 text-sm">{keyboardConfig.keycap_color}</p>
                </div>
              </div>
            </div>
          </div>
            
          {/* Debug Button */}
          <div className="mb-6">
            <button
              onClick={debugScene}
              className="w-full px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-200 font-medium"
            >
              🔍 Debug Scene (Check Console)
            </button>
          </div>

          {/* Keycap Color Options */}
          <div className="mb-8">
            <h3 className="text-white font-medium mb-4">Select Keycap Color</h3>
            <div className="grid grid-cols-5 gap-4">
              {keycapColorOptions.map((color) => (
                <button
                  key={color.value}
                  onClick={() => updateKeycapColor(color.value)}
                  className={`aspect-square rounded-xl border-2 transition-all duration-200 relative ${
                    keyboardConfig.keycap_color === color.value
                      ? 'border-white scale-110 shadow-lg'
                      : 'border-slate-600 hover:border-slate-400 hover:scale-105'
                  }`}
                  style={{ backgroundColor: color.value }}
                >
                  {keyboardConfig.keycap_color === color.value && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <svg className="w-6 h-6 text-white drop-shadow-lg" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                  <span className="sr-only">{color.name}</span>
                </button>
              ))}
            </div>
            <div className="grid grid-cols-5 gap-4 mt-2">
              {keycapColorOptions.map((color) => (
                <p key={`label-${color.value}`} className="text-xs text-slate-400 text-center">
                  {color.name}
                </p>
              ))}
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 mb-6">
            <div className="flex items-start space-x-3">
              <svg className="w-5 h-5 text-blue-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" clipRule="evenodd" />
              </svg>
              <div>
                <h4 className="text-blue-300 font-medium text-sm">Keycap Colors</h4>
                <p className="text-blue-200/80 text-sm">
                  Click any color above to change your keycap colors. The change applies to all the keys on your keyboard.
                </p>
              </div>
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
              Back to Builder
            </button>
            <button 
              onClick={() => setCurrentPage('builder')}
              className="flex-1 bg-green-600 text-white font-medium py-3 px-4 rounded-xl hover:bg-green-700 transition-all duration-200"
            >
              View in 3D
            </button>
          </div>
      </div>
    </div>
  )
}

  // Case Customizer Page
  if (currentPage === 'case-customizer') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-slate-950 to-zinc-950">
        <div className="pt-4 px-4 pb-24">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center space-x-3 mb-2">
              <button
                onClick={() => setCurrentPage('builder')}
                className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-700/50 text-slate-300 hover:text-white hover:bg-slate-900/80 transition-all duration-200"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div>
                <h1 className="text-xl font-semibold text-white">Customize Case Color</h1>
                <p className="text-slate-400 text-sm">Choose your keyboard case color</p>
              </div>
            </div>
          </div>

          {/* Current Case Color Display */}
          <div className="mb-6">
            <div className="bg-slate-900/60 border border-slate-700/50 rounded-xl p-4">
              <div className="flex items-center space-x-4">
                <div 
                  className="w-12 h-12 rounded-xl border-2 border-slate-600"
                  style={{ backgroundColor: keyboardConfig.case_color }}
                ></div>
                <div>
                  <h3 className="text-white font-medium">Current Case Color</h3>
                  <p className="text-slate-400 text-sm">{keyboardConfig.case_color}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Debug Button */}
          <div className="mb-6">
            <button
              onClick={debugScene}
              className="w-full px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-200 font-medium"
            >
              🔍 Debug Scene (Check Console)
            </button>
          </div>
            
          {/* Case Color Options */}
          <div className="mb-8">
            <h3 className="text-white font-medium mb-4">Select New Case Color</h3>
            <div className="grid grid-cols-5 gap-4">
              {caseColorOptions.map((color) => (
                <button
                  key={color.value}
                  onClick={() => updateCaseColor(color.value)}
                  className={`aspect-square rounded-xl border-2 transition-all duration-200 relative ${
                    keyboardConfig.case_color === color.value
                      ? 'border-white scale-110 shadow-lg'
                      : 'border-slate-600 hover:border-slate-400 hover:scale-105'
                  }`}
                  style={{ backgroundColor: color.value }}
                >
                  {keyboardConfig.case_color === color.value && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <svg className="w-6 h-6 text-white drop-shadow-lg" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-10.293a1 1 0 00-1.414-1.414L9 9.586 7.707 8.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </button>
              ))}
            </div>
            
            {/* Color Names */}
            <div className="grid grid-cols-5 gap-4 mt-2">
              {caseColorOptions.map((color) => (
                <p 
                  key={color.value}
                  className={`text-center text-xs ${
                    keyboardConfig.case_color === color.value
                      ? 'text-white font-medium'
                      : 'text-slate-400'
                  }`}
                >
                  {color.name}
                </p>
              ))}
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 mb-6">
            <div className="flex items-start space-x-3">
              <svg className="w-5 h-5 text-blue-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" clipRule="evenodd" />
              </svg>
              <div>
                <h4 className="text-blue-300 font-medium text-sm">Case Color Updates</h4>
                <p className="text-blue-200/80 text-sm">
                  Click any color above to change your keyboard case color. The 3D model will update instantly!
                </p>
              </div>
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
              Back to Builder
            </button>
            <button 
              onClick={() => setCurrentPage('builder')}
              className="flex-1 bg-green-600 text-white font-medium py-3 px-4 rounded-xl hover:bg-green-700 transition-all duration-200"
            >
              Apply & View in 3D
            </button>
        </div>
      </div>
    </div>
  )
  }

  // Cart Confirmation Page
  if (currentPage === 'cart-confirmation') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-slate-950 to-zinc-950 p-4">
        <div className="max-w-md mx-auto pt-12">
          {/* Success Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Added to Cart!</h1>
            <p className="text-slate-400">Your custom keyboard components have been added to your cart.</p>
          </div>

          {/* Cart Summary */}
          {cartConfirmationData && (
            <div className="bg-slate-900/50 rounded-2xl border border-slate-700/50 p-6 mb-6">
              <h3 className="text-white font-semibold mb-4">Cart Summary</h3>
              <div className="space-y-3">
                {cartConfirmationData.items.map((item, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <span className="text-slate-300 text-sm">{item.name}</span>
                    <span className="text-white font-medium">${item.price}</span>
                  </div>
                ))}
                <div className="pt-3 border-t border-slate-700">
                  <div className="flex justify-between items-center">
                    <span className="text-white font-semibold">Total</span>
                    <span className="text-green-400 font-bold text-lg">${cartConfirmationData.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={() => {
                // Navigate to Shopify cart page
                window.location.href = '/cart'
              }}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 hover:shadow-lg hover:shadow-green-600/25 active:scale-95"
            >
              Proceed to Checkout
            </button>
            
            <button
              onClick={() => setCurrentPage('welcome')}
              className="w-full bg-slate-800/60 hover:bg-slate-800/80 border border-slate-700/50 text-slate-300 font-medium py-3 px-6 rounded-xl transition-all duration-200"
            >
              Continue Shopping
            </button>
          </div>

          {/* Additional Info */}
          <div className="mt-8 text-center">
            <p className="text-slate-500 text-sm">
              You can modify quantities and review your full order in the checkout page.
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Privacy Policy Page
  if (currentPage === 'privacy-policy') {
    return <PrivacyPolicy />
  }

  // Terms of Service Page
  if (currentPage === 'terms-of-service') {
    return <TermsOfService />
  }

  // This should never be reached, but just in case
  return null
}