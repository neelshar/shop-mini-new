import React, { useEffect, useState, useRef } from 'react';
import { switchSoundMatcher } from '../utils/switchSoundMatcher.js';

interface AutoSwitchMatcherProps {
  // Switch selection from keyboard config
  switchType: 'linear' | 'tactile' | 'clicky';
  selectedSwitchProduct: any | null; // The actual selected switch product
  
  // Callback when AI matches a sound profile
  onSoundProfileMatched: (profileId: string, analysisResult: any) => void;
  
  // Current active sound profile for comparison
  currentSoundProfile: string;
  
  className?: string;
  enableDebug?: boolean;
}

export function AutoSwitchMatcher({
  switchType,
  selectedSwitchProduct,
  onSoundProfileMatched,
  currentSoundProfile,
  className = '',
  enableDebug = false
}: AutoSwitchMatcherProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [lastAnalysisResult, setLastAnalysisResult] = useState<any>(null);
  const [analysisHistory, setAnalysisHistory] = useState<any[]>([]);
  const lastAnalyzedSwitch = useRef<string | null>(null);

  // Extract switch name from product or use switch type
  const getCurrentSwitchName = () => {
    if (selectedSwitchProduct) {
      // Try to extract from product title, handle, or name
      return selectedSwitchProduct.title || 
             selectedSwitchProduct.handle || 
             selectedSwitchProduct.name || 
             selectedSwitchProduct.productType ||
             `${switchType} switch`;
    }
    return `${switchType} switch`;
  };

  // Automatic analysis when switch selection changes
  useEffect(() => {
    const currentSwitchName = getCurrentSwitchName();
    
    // Skip if no real change or currently analyzing
    if (currentSwitchName === lastAnalyzedSwitch.current || isAnalyzing) {
      return;
    }
    
    // Skip generic switch types unless no specific product is selected
    if (!selectedSwitchProduct && (currentSwitchName.includes('switch') && currentSwitchName.split(' ').length <= 2)) {
      console.log('⏭️ Skipping generic switch type:', currentSwitchName);
      return;
    }

    console.log('🔄 Auto-analyzing switch change:', currentSwitchName);
    analyzeCurrentSwitch();

  }, [switchType, selectedSwitchProduct, isAnalyzing]);

  const analyzeCurrentSwitch = async () => {
    const switchName = getCurrentSwitchName();
    lastAnalyzedSwitch.current = switchName;
    
    setIsAnalyzing(true);
    
    try {
      console.log('🤖 Auto-analyzing switch:', switchName);
      
      // Use AI analysis for specific products, local matching for generic types
      let result;
      if (selectedSwitchProduct && selectedSwitchProduct.title) {
        // Use AI for specific product names
        result = await switchSoundMatcher.findMatchingProfile(switchName);
        result.analysisType = 'ai';
      } else {
        // Use quick local matching for generic switch types
        result = switchSoundMatcher.getQuickLocalMatch(switchName);
        result.analysisType = 'local';
      }
      
      result.timestamp = Date.now();
      result.switchInput = switchName;
      result.hasSpecificProduct = !!selectedSwitchProduct;
      
      setLastAnalysisResult(result);
      setAnalysisHistory(prev => [result, ...prev].slice(0, 10)); // Keep last 10
      
      // Auto-apply the matched sound profile and unmute audio
      onSoundProfileMatched(result.matchedProfile, result);
      
      console.log('✅ Auto-analysis complete:', result);
      
    } catch (error) {
      console.error('❌ Auto-analysis failed:', error);
      
      const fallbackResult = {
        matchedProfile: 'cherrymx-brown-pbt',
        confidence: 3.0,
        reasoning: `Auto-analysis failed: ${error.message}. Using versatile Brown switches.`,
        switchType: switchType,
        analysisType: 'fallback',
        timestamp: Date.now(),
        switchInput: switchName,
        hasSpecificProduct: !!selectedSwitchProduct,
        error: error.message
      };
      
      setLastAnalysisResult(fallbackResult);
      
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getAnalysisStatusColor = (result: any) => {
    if (result.error) return 'text-red-400';
    if (result.confidence >= 8) return 'text-green-400';
    if (result.confidence >= 6) return 'text-yellow-400';
    if (result.confidence >= 4) return 'text-orange-400';
    return 'text-red-400';
  };

  const getAnalysisTypeIcon = (result: any) => {
    if (result.analysisType === 'ai') return '🤖';
    if (result.analysisType === 'local') return '⚡';
    return '🔄';
  };

  if (!enableDebug && !lastAnalysisResult) {
    return null; // Hidden when no debug and no results
  }

  return (
    <div className={`p-4 bg-gradient-to-br from-indigo-900/30 to-purple-900/30 rounded-xl border border-indigo-500/30 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-indigo-300 font-medium text-sm">
          🧠 Auto Switch Matcher
        </h4>
        {isAnalyzing && (
          <div className="flex items-center space-x-2 text-indigo-400">
            <div className="w-3 h-3 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-xs">Analyzing...</span>
          </div>
        )}
      </div>

      {/* Current Switch Detection */}
      <div className="mb-3 p-3 bg-slate-800/40 rounded-lg border border-slate-600/50">
        <div className="text-slate-300 text-xs font-medium mb-1">
          📡 Detected Switch
        </div>
        <div className="text-white text-sm">
          {getCurrentSwitchName()}
        </div>
        <div className="text-slate-400 text-xs mt-1">
          Source: {selectedSwitchProduct ? 'Product Selection' : 'Switch Type Preference'}
        </div>
      </div>

      {/* Latest Analysis Result */}
      {lastAnalysisResult && (
        <div className="mb-3 p-3 bg-slate-900/40 rounded-lg border border-slate-600/50">
          <div className="flex items-center justify-between mb-2">
            <div className="text-slate-300 text-xs font-medium">
              {getAnalysisTypeIcon(lastAnalysisResult)} Latest Match
            </div>
            <div className={`text-xs ${getAnalysisStatusColor(lastAnalysisResult)}`}>
              {lastAnalysisResult.confidence?.toFixed(1) || 'N/A'}/10
            </div>
          </div>
          
          <div className="text-white text-sm font-medium mb-1">
            {lastAnalysisResult.profileDetails?.name || lastAnalysisResult.matchedProfile}
          </div>
          
          <div className="text-slate-400 text-xs">
            {lastAnalysisResult.reasoning}
          </div>

          {lastAnalysisResult.error && (
            <div className="mt-2 text-red-400 text-xs">
              ❌ {lastAnalysisResult.error}
            </div>
          )}
        </div>
      )}

      {/* Current vs Matched Profile Comparison */}
      {lastAnalysisResult && (
        <div className="mb-3 p-3 bg-slate-800/30 rounded-lg border border-slate-600/30">
          <div className="text-slate-300 text-xs font-medium mb-2">
            🔊 Sound Profile Status
          </div>
          
          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-400">Matched:</span>
              <span className="text-white">{lastAnalysisResult.profileDetails?.name || lastAnalysisResult.matchedProfile}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-slate-400">Active:</span>
              <span className={currentSoundProfile === lastAnalysisResult.matchedProfile ? 'text-green-400' : 'text-yellow-400'}>
                {currentSoundProfile}
              </span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-slate-400">Status:</span>
              <span className={currentSoundProfile === lastAnalysisResult.matchedProfile ? 'text-green-400' : 'text-yellow-400'}>
                {currentSoundProfile === lastAnalysisResult.matchedProfile ? '✅ Synchronized' : '🔄 Applied'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Debug: Analysis History */}
      {enableDebug && analysisHistory.length > 0 && (
        <div className="p-3 bg-slate-900/20 rounded-lg border border-slate-700/30">
          <div className="text-slate-300 text-xs font-medium mb-2">
            📊 Analysis History ({analysisHistory.length})
          </div>
          <div className="space-y-1 max-h-32 overflow-y-auto">
            {analysisHistory.slice(0, 5).map((analysis, index) => (
              <div key={analysis.timestamp} className="text-xs flex justify-between items-center">
                <span className="text-slate-400 truncate flex-1 mr-2">
                  {getAnalysisTypeIcon(analysis)} {analysis.switchInput}
                </span>
                <span className={`${getAnalysisStatusColor(analysis)} font-medium`}>
                  {analysis.confidence?.toFixed(1) || 'ERR'}
                </span>
                <span className="text-slate-500 ml-2">
                  {new Date(analysis.timestamp).toLocaleTimeString().split(':').slice(0, 2).join(':')}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Manual Re-analysis Button */}
      {enableDebug && (
        <div className="mt-3 flex space-x-2">
          <button
            onClick={() => analyzeCurrentSwitch()}
            disabled={isAnalyzing}
            className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-600 text-white text-xs py-2 px-3 rounded-lg font-medium transition-colors"
          >
            {isAnalyzing ? 'Analyzing...' : '🔄 Re-analyze'}
          </button>
          
          <button
            onClick={() => {
              setAnalysisHistory([]);
              setLastAnalysisResult(null);
            }}
            className="bg-slate-600 hover:bg-slate-700 text-white text-xs py-2 px-3 rounded-lg font-medium transition-colors"
          >
            🗑️ Clear
          </button>
        </div>
      )}
    </div>
  );
}