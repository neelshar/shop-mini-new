import React, { useState } from 'react';
import { switchSoundMatcher } from '../utils/switchSoundMatcher.js';

interface AISwitchSoundSelectorProps {
  onProfileSelected: (profileId: string, analysisResult: any) => void;
  className?: string;
  currentProfile?: string;
}

export function AISwitchSoundSelector({ 
  onProfileSelected, 
  className = '', 
  currentProfile 
}: AISwitchSoundSelectorProps) {
  const [userInput, setUserInput] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleAnalyzeSwitch = async (useAI: boolean = true) => {
    if (!userInput.trim()) return;
    
    setIsAnalyzing(true);
    setAnalysisResult(null);
    
    try {
      console.log(`🔍 ${useAI ? 'AI' : 'Local'} analysis for:`, userInput);
      
      let result;
      if (useAI) {
        result = await switchSoundMatcher.findMatchingProfile(userInput);
      } else {
        result = switchSoundMatcher.getQuickLocalMatch(userInput);
      }
      
      setAnalysisResult(result);
      
      // Automatically apply the suggested profile
      onProfileSelected(result.matchedProfile, result);
      
    } catch (error) {
      console.error('❌ Analysis failed:', error);
      setAnalysisResult({
        error: error.message,
        matchedProfile: 'cherrymx-brown-pbt',
        confidence: 1.0,
        reasoning: 'Analysis failed, using fallback profile'
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 8) return 'text-green-400';
    if (confidence >= 6) return 'text-yellow-400';
    if (confidence >= 4) return 'text-orange-400';
    return 'text-red-400';
  };

  const getConfidenceDescription = (confidence: number) => {
    if (confidence >= 8) return 'Excellent Match';
    if (confidence >= 6) return 'Good Match';
    if (confidence >= 4) return 'Fair Match';
    return 'Approximate Match';
  };

  return (
    <div className={`p-6 bg-gradient-to-br from-purple-900/30 to-blue-900/30 rounded-xl border border-purple-500/30 ${className}`}>
      {/* Header */}
      <div className="mb-4">
        <h3 className="text-xl font-bold text-white mb-2">🧠 AI Switch Sound Matcher</h3>
        <p className="text-slate-300 text-sm">
          Tell us what switch you want, and our AI will find the closest matching sound profile!
        </p>
      </div>

      {/* Input Section */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            What switch are you looking for?
          </label>
          <input
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !isAnalyzing) {
                handleAnalyzeSwitch(true);
              }
            }}
            placeholder="e.g., Cherry MX Red, Gateron Yellow, Kailh Box White, etc."
            className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:border-purple-500 focus:outline-none"
            disabled={isAnalyzing}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => handleAnalyzeSwitch(true)}
            disabled={!userInput.trim() || isAnalyzing}
            className="flex items-center space-x-2 bg-purple-600 hover:bg-purple-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            {isAnalyzing ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Analyzing...</span>
              </>
            ) : (
              <>
                <span>🤖</span>
                <span>AI Analysis</span>
              </>
            )}
          </button>

          <button
            onClick={() => handleAnalyzeSwitch(false)}
            disabled={!userInput.trim() || isAnalyzing}
            className="flex items-center space-x-2 bg-slate-600 hover:bg-slate-700 disabled:bg-slate-700 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            <span>⚡</span>
            <span>Quick Match</span>
          </button>

          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center space-x-2 bg-slate-700 hover:bg-slate-600 text-white px-3 py-2 rounded-lg font-medium transition-colors text-sm"
          >
            <span>{showAdvanced ? '🔽' : '🔽'}</span>
            <span>Advanced</span>
          </button>
        </div>

        {/* Advanced Options */}
        {showAdvanced && (
          <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-600">
            <h4 className="text-white font-medium mb-2">🔧 Advanced Options</h4>
            <div className="space-y-2">
              <button
                onClick={() => {
                  const commonSwitches = [
                    'Cherry MX Red', 'Cherry MX Blue', 'Cherry MX Brown', 
                    'Gateron Red', 'Holy Panda', 'Zealios V2', 'Kailh Box White',
                    'Gateron Yellow', 'Durock Koala', 'Boba U4T'
                  ];
                  const randomSwitch = commonSwitches[Math.floor(Math.random() * commonSwitches.length)];
                  setUserInput(randomSwitch);
                }}
                className="text-purple-400 hover:text-purple-300 text-sm underline"
              >
                Try random popular switch
              </button>
              
              <button
                onClick={() => {
                  console.log('🔧 Testing local patterns...');
                  const testSwitches = ['Cherry MX Blue', 'Holy Panda', 'MX Red', 'Gateron Yellow'];
                  testSwitches.forEach(sw => {
                    const result = switchSoundMatcher.getQuickLocalMatch(sw);
                    console.log(`Local match for "${sw}":`, result);
                  });
                }}
                className="text-green-400 hover:text-green-300 text-sm underline ml-4"
              >
                🔧 Test local patterns
              </button>
              
              <div className="text-slate-400 text-xs">
                <p>💡 <strong>Tips:</strong></p>
                <ul className="mt-1 space-y-1 ml-4">
                  <li>• Include manufacturer: "Cherry MX", "Gateron", "Kailh"</li>
                  <li>• Mention type: "linear", "tactile", "clicky"</li>
                  <li>• Add details: "lubed", "silent", "heavy"</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Analysis Results */}
      {analysisResult && (
        <div className="mt-6 p-4 bg-slate-900/60 rounded-xl border border-slate-600">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-white font-medium">🎯 Analysis Results</h4>
            {analysisResult.isLocalMatch && (
              <span className="text-yellow-400 text-xs bg-yellow-900/30 px-2 py-1 rounded">
                Quick Match
              </span>
            )}
          </div>

          {analysisResult.error ? (
            <div className="text-red-400 text-sm">
              ❌ Error: {analysisResult.error}
            </div>
          ) : (
            <>
              {/* Matched Profile */}
              <div className="mb-4 p-3 bg-green-900/20 border border-green-500/30 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-green-300 font-medium">
                    ✅ Best Match: {analysisResult.profileDetails?.name || analysisResult.matchedProfile}
                  </span>
                  <span className={`text-sm font-medium ${getConfidenceColor(analysisResult.confidence)}`}>
                    {getConfidenceDescription(analysisResult.confidence)} ({analysisResult.confidence.toFixed(1)}/10)
                  </span>
                </div>
                
                <div className="text-slate-300 text-sm space-y-1">
                  <p><strong>Type:</strong> {analysisResult.switchType}</p>
                  {analysisResult.profileDetails && (
                    <>
                      <p><strong>Sound:</strong> {analysisResult.profileDetails.soundDescription}</p>
                      <p><strong>Feel:</strong> {analysisResult.profileDetails.characteristics}</p>
                    </>
                  )}
                </div>
              </div>

              {/* Reasoning */}
              <div className="mb-4">
                <h5 className="text-slate-300 font-medium mb-2">🤔 Why this match?</h5>
                <p className="text-slate-400 text-sm">{analysisResult.reasoning}</p>
              </div>

              {/* Key Factors */}
              {analysisResult.keyFactors && analysisResult.keyFactors.length > 0 && (
                <div className="mb-4">
                  <h5 className="text-slate-300 font-medium mb-2">🔑 Key Factors</h5>
                  <div className="flex flex-wrap gap-2">
                    {analysisResult.keyFactors.map((factor, index) => (
                      <span 
                        key={index}
                        className="bg-blue-900/30 text-blue-300 px-2 py-1 rounded text-xs"
                      >
                        {factor}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Alternative Options */}
              {analysisResult.alternativeOptions && analysisResult.alternativeOptions.length > 0 && (
                <div>
                  <h5 className="text-slate-300 font-medium mb-2">🔄 Alternative Options</h5>
                  <div className="flex flex-wrap gap-2">
                    {analysisResult.alternativeOptions.map((altId, index) => {
                      const profiles = switchSoundMatcher.getAvailableSoundProfiles();
                      const altProfile = profiles[altId];
                      return (
                        <button
                          key={index}
                          onClick={() => onProfileSelected(altId, { ...analysisResult, matchedProfile: altId })}
                          className="bg-slate-700 hover:bg-slate-600 text-slate-300 px-2 py-1 rounded text-xs transition-colors"
                        >
                          {altProfile?.name || altId}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Current Profile Indicator */}
      {currentProfile && (
        <div className="mt-4 p-3 bg-slate-800/30 rounded-lg border border-slate-500/30">
          <div className="text-slate-400 text-sm">
            <span className="text-slate-300 font-medium">Currently Active:</span> {currentProfile}
          </div>
        </div>
      )}
    </div>
  );
}