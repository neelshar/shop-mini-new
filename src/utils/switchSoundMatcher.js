// AI-Powered Switch Sound Matching System
// Analyzes user's switch selection and matches to closest available sound profile

export class SwitchSoundMatcher {
  constructor() {
    this.apiKey = import.meta.env.VITE_OPENAI_API_KEY;
    this.apiUrl = 'https://api.openai.com/v1/chat/completions';
    this.model = 'gpt-4o';
    
    console.log('🧠 SwitchSoundMatcher initialized');
    
    if (!this.apiKey) {
      console.error('❌ OpenAI API key not found. Please set VITE_OPENAI_API_KEY in your .env file.');
    } else {
      console.log('✅ OpenAI API key loaded for switch matching');
    }
  }

  /**
   * Available sound profiles with detailed characteristics
   */
  getAvailableSoundProfiles() {
    return {
      'holy-pandas': {
        id: 'holy-pandas',
        name: 'Holy Pandas',
        type: 'tactile',
        characteristics: 'Deep, satisfying thock sound with pronounced tactile bump. Premium tactile feel with heavy bottom-out.',
        soundDescription: 'Deep thocky sound, muted but rich, tactile click without sharpness',
        weight: 'Heavy (67g actuation)',
        manufacturer: 'Drop + Invyr',
        popularityScore: 9.5
      },
      'banana-split': {
        id: 'banana-split',
        name: 'Banana Split (Lubed)',
        type: 'tactile',
        characteristics: 'Smooth, deep tactile switches with reduced wobble. Lubed for premium feel.',
        soundDescription: 'Smooth, muted tactile sound with subtle thock, well-dampened',
        weight: 'Medium-Heavy (62g actuation)',
        manufacturer: 'TheKey.Company',
        popularityScore: 8.5
      },
      'steelseries': {
        id: 'steelseries',
        name: 'SteelSeries Apex Pro TKL',
        type: 'linear',
        characteristics: 'Gaming-focused linear switches with adjustable actuation point. Crisp and responsive.',
        soundDescription: 'Clean, crisp linear sound with mechanical precision, gaming-optimized',
        weight: 'Light-Medium (45g actuation)',
        manufacturer: 'SteelSeries',
        popularityScore: 7.5
      },
      'tealios': {
        id: 'tealios',
        name: 'Tealios V2 on PBT',
        type: 'linear',
        characteristics: 'Premium smooth linear switches, among the smoothest available. Consistent actuation.',
        soundDescription: 'Ultra-smooth linear sound, minimal friction noise, premium feel',
        weight: 'Medium-Heavy (67g actuation)',
        manufacturer: 'ZealPC',
        popularityScore: 9.0
      },
      'mx-speed-silver': {
        id: 'mx-speed-silver',
        name: 'MX Speed Silver',
        type: 'linear',
        characteristics: 'Ultra-fast gaming switches with 1.2mm actuation distance. Speed-optimized.',
        soundDescription: 'Quick, light linear sound with fast return, gaming-focused acoustics',
        weight: 'Light (45g actuation)',
        manufacturer: 'Cherry',
        popularityScore: 7.0
      },
      'cherry-mx-black': {
        id: 'cherry-mx-black',
        name: 'Cherry MX Black PBT',
        type: 'linear',
        characteristics: 'Heavy linear switches with consistent feel throughout. Classic Cherry design.',
        soundDescription: 'Solid, consistent linear sound with heavier dampening',
        weight: 'Heavy (60g actuation)',
        manufacturer: 'Cherry',
        popularityScore: 8.0
      },
      'cherrymx-blue-pbt': {
        id: 'cherrymx-blue-pbt',
        name: 'Cherry MX Blue PBT',
        type: 'clicky',
        characteristics: 'Classic clicky switches with tactile bump and audible click. Iconic mechanical feel.',
        soundDescription: 'Sharp, crisp click with pronounced tactile feedback, classic mechanical sound',
        weight: 'Medium (50g actuation)',
        manufacturer: 'Cherry',
        popularityScore: 8.5
      },
      'cherrymx-brown-pbt': {
        id: 'cherrymx-brown-pbt',
        name: 'Cherry MX Brown PBT',
        type: 'tactile',
        characteristics: 'Gentle tactile switches with subtle bump. Good balance of tactile and quiet operation.',
        soundDescription: 'Soft tactile sound with gentle bump, quiet but present feedback',
        weight: 'Medium (45g actuation)',
        manufacturer: 'Cherry',
        popularityScore: 9.0
      },
      'cherrymx-red-pbt': {
        id: 'cherrymx-red-pbt',
        name: 'Cherry MX Red PBT',
        type: 'linear',
        characteristics: 'Smooth linear switches with no tactile bump. Popular for both gaming and typing.',
        soundDescription: 'Clean linear sound, smooth actuation with minimal noise',
        weight: 'Light-Medium (45g actuation)',
        manufacturer: 'Cherry',
        popularityScore: 9.5
      },
      'topre-purple-hybrid-pbt': {
        id: 'topre-purple-hybrid-pbt',
        name: 'Topre Purple Hybrid PBT',
        type: 'electro-capacitive',
        characteristics: 'Unique electro-capacitive switches with rubber dome feel but mechanical precision.',
        soundDescription: 'Distinctive thock sound, deeper than mechanical, unique rubber-dome hybrid acoustics',
        weight: 'Medium (45g actuation)',
        manufacturer: 'Topre',
        popularityScore: 8.0
      }
    };
  }

  /**
   * Analyze user's switch choice and find the best matching sound profile
   * @param {string} userSwitchName - The switch name the user selected
   * @param {string} context - Additional context (optional)
   * @returns {Promise<Object>} - Matching result with profile and reasoning
   */
  async findMatchingProfile(userSwitchName, context = '') {
    if (!this.apiKey) {
      throw new Error('OpenAI API key not configured');
    }

    try {
      console.log('🧠 Analyzing switch:', userSwitchName);
      
      const availableProfiles = this.getAvailableSoundProfiles();
      const profilesJson = JSON.stringify(availableProfiles, null, 2);

      const prompt = `You are an expert mechanical keyboard switch analyst. A user has selected a switch called "${userSwitchName}"${context ? ` with additional context: ${context}` : ''}.

Your task is to analyze this switch and find the BEST MATCHING sound profile from our available options.

AVAILABLE SOUND PROFILES:
${profilesJson}

ANALYSIS REQUIREMENTS:
1. Analyze the user's switch type (linear, tactile, clicky, or other)
2. Consider the switch characteristics (weight, manufacturer, sound profile)
3. Match to the CLOSEST available sound profile
4. Consider sound similarity as the PRIMARY factor
5. Factor in switch type compatibility

RESPONSE FORMAT - RETURN ONLY THE JSON OBJECT, NO OTHER TEXT:
{
  "matchedProfile": "profile-id",
  "confidence": 8.5,
  "reasoning": "Detailed explanation of why this profile was chosen",
  "switchType": "linear|tactile|clicky|electro-capacitive",
  "keyFactors": ["factor1", "factor2", "factor3"],
  "alternativeOptions": ["profile-id-2", "profile-id-3"]
}

CRITICAL REQUIREMENTS:
- ONLY return the JSON object above
- NO markdown formatting, NO code blocks, NO additional text
- matchedProfile MUST be one of the available profile IDs
- confidence should be 1-10 scale (number, not string)
- reasoning should explain the sound/feel similarity
- Consider both sound characteristics AND switch type`;

      const requestBody = {
        model: this.model,
        messages: [
          {
            role: 'system',
            content: 'You are a mechanical keyboard switch expert. You MUST respond with ONLY a valid JSON object. NO markdown, NO code blocks, NO additional text. Just the raw JSON object.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 1000,
        temperature: 0.3 // Lower temperature for more consistent matching
      };

      console.log('🚀 Sending request to OpenAI...');
      
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ OpenAI API Error:', errorText);
        throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('✅ OpenAI Response received');

      if (!data.choices || !data.choices[0] || !data.choices[0].message) {
        throw new Error('Invalid response format from OpenAI');
      }

      const analysisText = data.choices[0].message.content.trim();
      console.log('📄 Raw AI analysis:', analysisText);

      // Parse the JSON response with improved error handling
      let analysisResult;
      try {
        // Try to extract JSON from the response if it's wrapped in markdown or other text
        let jsonText = analysisText;
        
        // Look for JSON within code blocks
        const jsonMatch = analysisText.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/);
        if (jsonMatch) {
          jsonText = jsonMatch[1];
        } else {
          // Look for JSON object directly
          const directJsonMatch = analysisText.match(/\{[\s\S]*\}/);
          if (directJsonMatch) {
            jsonText = directJsonMatch[0];
          }
        }
        
        console.log('🔍 Attempting to parse JSON:', jsonText);
        analysisResult = JSON.parse(jsonText);
        
      } catch (parseError) {
        console.error('❌ Failed to parse AI response as JSON:', parseError);
        console.error('Raw response:', analysisText);
        
        // Try to extract key information manually from text response
        const manualParse = this.extractInfoFromText(analysisText, availableProfiles);
        if (manualParse.matchedProfile) {
          analysisResult = manualParse;
          console.log('✅ Manual parsing successful:', analysisResult);
        } else {
          // Final fallback to a safe default
          analysisResult = {
            matchedProfile: 'cherrymx-brown-pbt',
            confidence: 6.0,
            reasoning: 'AI response parsing failed, defaulting to versatile Cherry MX Brown profile',
            switchType: 'tactile',
            keyFactors: ['parsing_fallback'],
            alternativeOptions: ['cherrymx-red-pbt', 'holy-pandas']
          };
        }
      }

      // Validate the matched profile exists
      if (!availableProfiles[analysisResult.matchedProfile]) {
        console.warn('⚠️ AI suggested invalid profile, using fallback');
        analysisResult.matchedProfile = 'cherrymx-brown-pbt';
        analysisResult.confidence = Math.max(1.0, analysisResult.confidence - 2.0);
        analysisResult.reasoning = `Original suggestion was invalid. ${analysisResult.reasoning}`;
      }

      // Add profile details to the result
      analysisResult.profileDetails = availableProfiles[analysisResult.matchedProfile];
      
      console.log('🎯 Final matching result:', analysisResult);
      
      return analysisResult;

    } catch (error) {
      console.error('❌ Switch matching failed:', error);
      
      // Return a safe fallback result
      return {
        matchedProfile: 'cherrymx-brown-pbt',
        confidence: 5.0,
        reasoning: `Error occurred during AI analysis: ${error.message}. Defaulted to Cherry MX Brown as a versatile option.`,
        switchType: 'tactile',
        keyFactors: ['error_fallback'],
        alternativeOptions: ['cherrymx-red-pbt', 'holy-pandas'],
        profileDetails: this.getAvailableSoundProfiles()['cherrymx-brown-pbt'],
        error: error.message
      };
    }
  }

  /**
   * Extract information from text response when JSON parsing fails
   * @param {string} text - The AI response text
   * @param {Object} availableProfiles - Available profiles to match against
   * @returns {Object} - Extracted information or null
   */
  extractInfoFromText(text, availableProfiles) {
    try {
      const textLower = text.toLowerCase();
      
      // Look for profile mentions
      let matchedProfile = null;
      let confidence = 6.0;
      let reasoning = 'Extracted from text analysis due to JSON parsing failure';
      
      // Check for direct profile mentions
      for (const [profileId, profile] of Object.entries(availableProfiles)) {
        const profileNameLower = profile.name.toLowerCase();
        if (textLower.includes(profileNameLower)) {
          matchedProfile = profileId;
          break;
        }
        
        // Check for partial matches
        const keywords = profileNameLower.split(' ');
        if (keywords.length > 1 && keywords.every(keyword => textLower.includes(keyword))) {
          matchedProfile = profileId;
          break;
        }
      }
      
      // Extract confidence if mentioned
      const confidenceMatch = text.match(/confidence[:\s]*(\d+(?:\.\d+)?)/i);
      if (confidenceMatch) {
        confidence = parseFloat(confidenceMatch[1]);
      }
      
      // Extract switch type
      let switchType = 'tactile';
      if (textLower.includes('linear')) switchType = 'linear';
      if (textLower.includes('clicky')) switchType = 'clicky';
      if (textLower.includes('tactile')) switchType = 'tactile';
      
      if (matchedProfile) {
        return {
          matchedProfile,
          confidence,
          reasoning,
          switchType,
          keyFactors: ['text_extraction'],
          alternativeOptions: ['cherrymx-red-pbt', 'holy-pandas']
        };
      }
      
      return null;
    } catch (error) {
      console.error('❌ Text extraction failed:', error);
      return null;
    }
  }

  /**
   * Get a quick local match without AI (for fallback or testing)
   * @param {string} userSwitchName - The switch name the user selected
   * @returns {Object} - Basic matching result
   */
  getQuickLocalMatch(userSwitchName) {
    const switchLower = userSwitchName.toLowerCase();
    const availableProfiles = this.getAvailableSoundProfiles();
    
    // Simple keyword matching for common switches
    const patterns = {
      'holy panda': 'holy-pandas',
      'mx blue': 'cherrymx-blue-pbt',
      'mx brown': 'cherrymx-brown-pbt',
      'mx red': 'cherrymx-red-pbt',
      'mx black': 'cherry-mx-black',
      'mx silver': 'mx-speed-silver',
      'speed silver': 'mx-speed-silver',
      'tealios': 'tealios',
      'banana split': 'banana-split',
      'topre': 'topre-purple-hybrid-pbt',
      'steelseries': 'steelseries'
    };

    for (const [pattern, profileId] of Object.entries(patterns)) {
      if (switchLower.includes(pattern)) {
        return {
          matchedProfile: profileId,
          confidence: 7.0,
          reasoning: `Local pattern match for "${pattern}" in "${userSwitchName}"`,
          switchType: availableProfiles[profileId].type,
          keyFactors: ['keyword_match'],
          alternativeOptions: [],
          profileDetails: availableProfiles[profileId],
          isLocalMatch: true
        };
      }
    }

    // Default fallback
    return {
      matchedProfile: 'cherrymx-brown-pbt',
      confidence: 4.0,
      reasoning: `No pattern match found for "${userSwitchName}". Using Cherry MX Brown as versatile default.`,
      switchType: 'tactile',
      keyFactors: ['default_fallback'],
      alternativeOptions: ['cherrymx-red-pbt', 'holy-pandas'],
      profileDetails: availableProfiles['cherrymx-brown-pbt'],
      isLocalMatch: true
    };
  }
}

// Create and export a singleton instance
export const switchSoundMatcher = new SwitchSoundMatcher();