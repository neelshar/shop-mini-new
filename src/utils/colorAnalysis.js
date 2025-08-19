// Color Analysis System for Keycap Images
// Captures 3D scene, analyzes colors with LLM, and extracts color palettes

export class ColorAnalysisSystem {
  constructor() {
    // Switch to OpenAI GPT-4 Vision - much more browser-friendly
    this.apiKey = import.meta.env.VITE_OPENAI_API_KEY;
    this.apiUrl = 'https://api.openai.com/v1/chat/completions';
    this.model = 'gpt-4o'; // Updated to current model with vision capabilities
    
    console.log('🔧 ColorAnalysisSystem Debug:');
    console.log('  - All Environment variables:', import.meta.env);
    console.log('  - VITE_OPENAI_API_KEY:', import.meta.env.VITE_OPENAI_API_KEY ? 'Found' : 'Missing');
    console.log('  - API Key found:', !!this.apiKey);
    console.log('  - API Key length:', this.apiKey?.length || 0);
    console.log('  - API Key prefix:', this.apiKey?.substring(0, 10) || 'none');
    
    if (!this.apiKey) {
      console.error('❌ OpenAI API key not found in environment variables. Please set VITE_OPENAI_API_KEY in your .env file.');
      console.error('Available environment variables:', Object.keys(import.meta.env));
    } else {
      console.log('✅ OpenAI API key loaded successfully');
    }
  }

  /**
   * Capture the current 3D scene as an image
   * @param {THREE.WebGLRenderer} renderer - Three.js renderer
   * @param {Object} options - Capture options
   * @returns {Promise<string>} - Base64 image data URL
   */
  async captureScene(renderer, options = {}) {
    try {
      console.log('📸 Capturing keyboard scene...');
      console.log('🔍 Renderer details:', {
        available: !!renderer,
        domElement: !!renderer?.domElement,
        canvas: !!renderer?.domElement,
        canvasSize: renderer?.domElement ? `${renderer.domElement.width}x${renderer.domElement.height}` : 'N/A'
      });
      
      if (!renderer) {
        throw new Error('Renderer not available');
      }

      if (!renderer.domElement) {
        throw new Error('Renderer DOM element not available');
      }

      // Get the canvas data
      const canvas = renderer.domElement;
      console.log('🖼️ Canvas info:', {
        width: canvas.width,
        height: canvas.height,
        nodeName: canvas.nodeName
      });

      // Force a render before capture to ensure latest frame
      if (window.scene && window.camera) {
        console.log('🔄 Forcing fresh render before capture...');
        renderer.render(window.scene, window.camera);
      }

      const dataURL = canvas.toDataURL('image/png', 0.9);
      
      if (!dataURL || dataURL === 'data:,') {
        throw new Error('Failed to generate canvas data URL');
      }

      console.log('✅ Scene captured successfully, data size:', dataURL.length);
      return dataURL;
    } catch (error) {
      console.error('❌ Failed to capture scene:', error);
      console.error('Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
      throw error;
    }
  }

  /**
   * Crop image to focus on keycap area
   * @param {string} imageDataURL - Base64 image data
   * @param {Object} cropArea - {x, y, width, height} in pixels
   * @returns {Promise<string>} - Cropped image data URL
   */
  async cropKeycapArea(imageDataURL, cropArea = null) {
    return new Promise((resolve, reject) => {
      try {
        console.log('✂️ Cropping keycap area...');
        console.log('🔍 Input image details:', {
          dataURL: imageDataURL ? 'Available' : 'Missing',
          dataURLLength: imageDataURL?.length || 0,
          dataURLPrefix: imageDataURL?.substring(0, 50) + '...'
        });
        
        if (!imageDataURL) {
          throw new Error('No image data provided for cropping');
        }
        
        const img = new Image();
        
        img.onload = () => {
          try {
            console.log('🖼️ Image loaded for cropping:', {
              width: img.width,
              height: img.height,
              naturalWidth: img.naturalWidth,
              naturalHeight: img.naturalHeight
            });
            
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            if (!ctx) {
              throw new Error('Failed to get 2D context for cropping canvas');
            }
            
            // Default crop to center area if not specified
            const crop = cropArea || {
              x: Math.floor(img.width * 0.1),
              y: Math.floor(img.height * 0.2),
              width: Math.floor(img.width * 0.8),
              height: Math.floor(img.height * 0.6)
            };
            
            console.log('✂️ Crop area:', crop);
            
            canvas.width = crop.width;
            canvas.height = crop.height;
            
            // Draw cropped portion
            ctx.drawImage(
              img, 
              crop.x, crop.y, crop.width, crop.height,
              0, 0, crop.width, crop.height
            );
            
            const croppedDataURL = canvas.toDataURL('image/png', 0.9);
            
            if (!croppedDataURL || croppedDataURL === 'data:,') {
              throw new Error('Failed to generate cropped canvas data URL');
            }
            
            console.log('✅ Image cropped successfully, size:', croppedDataURL.length);
            resolve(croppedDataURL);
            
          } catch (error) {
            console.error('❌ Error during cropping process:', error);
            reject(error);
          }
        };
        
        img.onerror = (error) => {
          console.error('❌ Failed to load image for cropping:', error);
          reject(new Error('Failed to load image for cropping: ' + error));
        };
        
        img.src = imageDataURL;
        
      } catch (error) {
        console.error('❌ Failed to crop image:', error);
        reject(error);
      }
    });
  }

  /**
   * Analyze colors using LLM vision API with specific prompts
   * @param {string} imageDataURL - Base64 image data
   * @param {string} analysisType - 'keycaps' or 'case' 
   * @returns {Promise<Object>} - Color analysis results
   */
  async analyzeColorsWithLLM(imageDataURL, analysisType = 'keycaps') {
    console.log(`🤖 Starting LLM color analysis for ${analysisType}...`);
    
    if (!this.apiKey) {
      throw new Error('No API key configured for LLM analysis');
    }

    // Convert data URL to base64 without prefix
    const base64Image = imageDataURL.split(',')[1];
    
    // Check image size (Claude has limits)
    const imageSizeKB = Math.round(base64Image.length * 0.75 / 1024); // Rough base64 to bytes conversion
    console.log('📏 Image size check:', {
      base64Length: base64Image.length,
      estimatedSizeKB: imageSizeKB,
      maxSizeKB: 5000 // Claude's typical limit
    });
    
    if (imageSizeKB > 5000) {
      throw new Error(`Image too large: ${imageSizeKB}KB (max 5000KB). Please select a smaller image.`);
    }
    
    // Generate different prompts based on analysis type
    const getPromptForType = (type) => {
      if (type === 'case') {
        return `Analyze this mechanical keyboard image and identify the KEYBOARD CASE colors (not the keycaps). Focus on:
1. The primary case/housing color (the main body/frame of the keyboard)
2. Any secondary case colors (different colored sections of the case/housing)
3. Any accent colors on the case itself (trim, bezels, or decorative elements)

IMPORTANT: Ignore the keycaps completely - only analyze the keyboard case/housing colors.

For each color, provide:
- A descriptive name
- The hex color code (your best estimate)
- Confidence level (1-10)

Format your response as JSON:
{
  "primary": {"name": "color name", "hex": "#hexcode", "confidence": 8},
  "modifier": {"name": "color name", "hex": "#hexcode", "confidence": 7},
  "accent": {"name": "color name", "hex": "#hexcode", "confidence": 9}
}`;
      } else {
        return `Analyze this keyboard image and identify the keycap colors (not the case). Please provide:
1. The primary keycap color (most common keycaps)
2. Any modifier key colors (different colored keys like Shift, Ctrl, etc.)  
3. Any accent colors (special keys, Enter, etc.)

IMPORTANT: Only analyze the keycaps/keys, ignore the keyboard case/housing.

For each color, provide:
- A descriptive name
- The hex color code (your best estimate)
- Confidence level (1-10)

Format your response as JSON:
{
  "primary": {"name": "color name", "hex": "#hexcode", "confidence": 8},
  "modifier": {"name": "color name", "hex": "#hexcode", "confidence": 7},
  "accent": {"name": "color name", "hex": "#hexcode", "confidence": 9}
}`;
      }
    };

    // OpenAI GPT-4 Vision format with dynamic prompts
    const requestBody = {
      model: this.model,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: getPromptForType(analysisType)
            },
            {
              type: 'image_url',
              image_url: {
                url: imageDataURL // OpenAI accepts full data URLs directly!
              }
            }
          ]
        }
      ],
      max_tokens: 500
    };

    console.log('📤 Sending request to OpenAI GPT-4 Vision...');
    console.log('🔍 Request details:', {
      url: this.apiUrl,
      model: this.model,
      method: 'POST',
      hasApiKey: !!this.apiKey,
      bodySize: JSON.stringify(requestBody).length,
      imageDataSize: imageDataURL.length
    });

    // First test: Simple network connectivity
    console.log('🌐 Testing basic network connectivity...');
    try {
      const testResponse = await fetch('https://httpbin.org/get');
      console.log('✅ Basic network test passed:', testResponse.status);
    } catch (testError) {
      console.error('❌ Basic network test failed:', testError);
      throw new Error(`Network connectivity issue: ${testError.message}`);
    }

    // Second test: Try OpenAI API with minimal request first
    console.log('🔍 Testing OpenAI API with minimal request...');
    const minimalRequest = {
      model: 'gpt-3.5-turbo', // Use cheaper model for test
      messages: [{ role: 'user', content: 'Hello' }],
      max_tokens: 5
    };

    try {
      const testOpenAIResponse = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify(minimalRequest)
      });
      console.log('📡 OpenAI test response status:', testOpenAIResponse.status);
      if (!testOpenAIResponse.ok) {
        const errorText = await testOpenAIResponse.text();
        console.error('❌ OpenAI test failed:', errorText);
        throw new Error(`OpenAI API test failed: ${testOpenAIResponse.status} - ${errorText}`);
      }
      console.log('✅ OpenAI API connectivity test passed');
    } catch (openAITestError) {
      console.error('❌ OpenAI API test failed:', openAITestError);
      throw new Error(`OpenAI API connectivity failed: ${openAITestError.message}`);
    }

    let response;
    try {
      // Now try the full request
      console.log('📤 Sending full image analysis request...');
      response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify(requestBody)
      });
      
      console.log('📡 Fetch completed, response status:', response.status);
      console.log('📡 Response headers:', Object.fromEntries(response.headers.entries()));
      
    } catch (fetchError) {
      console.error('❌ Fetch request failed:', fetchError);
      console.error('❌ Fetch error details:', {
        name: fetchError.name,
        message: fetchError.message,
        stack: fetchError.stack
      });
      throw new Error(`Network request failed: ${fetchError.message}`);
    }

    if (!response.ok) {
      console.error('❌ API response not OK:', {
        status: response.status,
        statusText: response.statusText
      });
      
      let errorText;
      try {
        errorText = await response.text();
        console.error('❌ Error response body:', errorText);
      } catch (textError) {
        console.error('❌ Could not read error response:', textError);
        errorText = 'Could not read error response';
      }
      
      throw new Error(`API request failed: ${response.status} ${response.statusText} - ${errorText}`);
    }

    console.log('📥 Received successful response from OpenAI API');
    
    let result;
    try {
      result = await response.json();
      console.log('📦 Response JSON parsed successfully');
      console.log('📦 Response structure:', {
        hasContent: !!result.content,
        contentLength: result.content?.length,
        firstContentType: result.content?.[0]?.type
      });
    } catch (jsonError) {
      console.error('❌ Failed to parse response JSON:', jsonError);
      throw new Error(`Failed to parse API response: ${jsonError.message}`);
    }
    
    const analysisText = result.choices?.[0]?.message?.content;
    
    if (!analysisText) {
      console.error('❌ No analysis text in response:', result);
      throw new Error('No analysis text returned from OpenAI API');
    }
    
    console.log('🔍 Raw LLM response:', analysisText);
    
    // Extract JSON from response (might be wrapped in markdown or have extra text)
    let colorAnalysis;
    try {
      // First try direct parsing
      colorAnalysis = JSON.parse(analysisText);
      console.log('✅ JSON response parsed directly');
    } catch (directParseError) {
      console.log('⚠️ Direct JSON parsing failed, attempting extraction...');
      
      // Try to extract JSON from markdown code blocks or mixed text
      const jsonMatch = analysisText.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/) || 
                       analysisText.match(/(\{[\s\S]*\})/);
      
      if (jsonMatch) {
        try {
          colorAnalysis = JSON.parse(jsonMatch[1]);
          console.log('✅ JSON extracted and parsed successfully');
        } catch (extractParseError) {
          console.error('❌ Failed to parse extracted JSON:', extractParseError);
          console.error('❌ Extracted text:', jsonMatch[1]);
          throw new Error(`Failed to parse extracted JSON: ${extractParseError.message}`);
        }
      } else {
        console.error('❌ No JSON found in response:', analysisText);
        throw new Error(`No valid JSON found in OpenAI response. Raw response: ${analysisText}`);
      }
    }
    
    console.log('✅ LLM analysis completed:', colorAnalysis);
    return colorAnalysis;
  }


  /**
   * Mock color analysis for testing without API
   */
  getMockColorAnalysis() {
    return {
      primary: { name: 'Light Gray', hex: '#E8E8E8', confidence: 8 },
      modifier: { name: 'Medium Gray', hex: '#B8B8B8', confidence: 7 },
      accent: { name: 'Dark Gray', hex: '#808080', confidence: 9 }
    };
  }

  /**
   * Get product image from selected products (keycaps or case)
   * @param {Object} selectedProducts - Selected products object
   * @returns {Promise<string>} - Product image URL or data URL
   */
  async getProductImage(selectedProducts) {
    console.log('🖼️ Getting product image from selected products...');
    console.log('🔍 Selected products:', selectedProducts);
    
    let targetProduct = null;
    let productType = '';
    
    // Check what type of product is selected (prioritize the one we're analyzing)
    if (selectedProducts?.case) {
      targetProduct = selectedProducts.case;
      productType = 'case';
      console.log('🏠 Using case product for analysis');
    } else if (selectedProducts?.keycaps) {
      targetProduct = selectedProducts.keycaps;
      productType = 'keycaps';
      console.log('🎨 Using keycaps product for analysis');
    }
    
    if (!targetProduct) {
      throw new Error('No keycaps or case selected. Please select a product first.');
    }
    
    console.log(`🔍 ${productType} product:`, targetProduct);
    
    // Try to get product image URL from various possible locations
    const imageUrl = targetProduct.image?.url ||
                     targetProduct.images?.[0]?.url ||
                     targetProduct.featuredImage?.url ||
                     targetProduct.images?.[0]?.src ||
                     targetProduct.image?.src ||
                     targetProduct.src;
    
    if (!imageUrl) {
      // If no image URL, try to capture the 3D scene as fallback
      console.log(`⚠️ No ${productType} image found, falling back to 3D scene capture...`);
      const renderer = window.renderer;
      if (!renderer) {
        throw new Error(`No ${productType} image available and 3D renderer not found`);
      }
      return await this.captureScene(renderer);
    }
    
    console.log(`✅ Found ${productType} image URL:`, imageUrl);
    
    // Convert external image URL to data URL for API
    return await this.loadImageAsDataURL(imageUrl);
  }
  
  /**
   * Load external image URL as data URL
   * @param {string} imageUrl - External image URL
   * @returns {Promise<string>} - Data URL
   */
  async loadImageAsDataURL(imageUrl) {
    return new Promise((resolve, reject) => {
      console.log('📥 Loading external image:', imageUrl);
      
      const img = new Image();
      img.crossOrigin = 'anonymous'; // Enable CORS
      
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          canvas.width = img.width;
          canvas.height = img.height;
          
          ctx.drawImage(img, 0, 0);
          
          const dataURL = canvas.toDataURL('image/png', 0.9);
          console.log('✅ External image loaded as data URL, size:', dataURL.length);
          resolve(dataURL);
        } catch (error) {
          console.error('❌ Failed to convert image to data URL:', error);
          reject(error);
        }
      };
      
      img.onerror = (error) => {
        console.error('❌ Failed to load external image:', error);
        reject(new Error('Failed to load product image: ' + imageUrl));
      };
      
      img.src = imageUrl;
    });
  }

  /**
   * Main function to perform complete color analysis
   * @param {Object} options - Analysis options
   * @returns {Promise<Object>} - Complete analysis results
   */
  async performColorAnalysis(options = {}) {
    console.log('🎨 Starting complete color analysis...');
    
    // 1. Get product image (either from selected product or 3D scene)
    console.log('📸 Step 1: Getting product image...');
    const productImage = await this.getProductImage(options.selectedProducts);
    
    // 2. Crop to keycap area (optional, might not be needed for product images)
    console.log('✂️ Step 2: Processing image...');
    const processedImage = options.skipCropping ? productImage : 
                          await this.cropKeycapArea(productImage, options.cropArea);
    
    // 3. Analyze with LLM
    console.log('🤖 Step 3: Analyzing with Claude AI...');
    const colorAnalysis = await this.analyzeColorsWithLLM(processedImage);
    
    // 4. Return complete results
    const results = {
      timestamp: Date.now(),
      images: {
        original: productImage,
        processed: processedImage
      },
      analysis: colorAnalysis,
      success: true
    };
    
    console.log('✅ Complete color analysis finished successfully');
    return results;
  }

  /**
   * Set API configuration
   * @param {string} apiKey - API key for LLM service
   * @param {string} apiUrl - API endpoint URL
   */
  setApiConfig(apiKey, apiUrl = null) {
    this.apiKey = apiKey;
    if (apiUrl) {
      this.apiUrl = apiUrl;
    }
    console.log('🔧 API configuration updated');
  }
}

// Create and export singleton instance
export const colorAnalysis = new ColorAnalysisSystem();

// Export for direct access
export default colorAnalysis;