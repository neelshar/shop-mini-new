// Export KeySim's default settings for compatibility
import defaultSettings from '../keysim-config/settings_user_default.json'

// Check for saved case color in localStorage
const savedCaseColor = typeof window !== 'undefined' ? localStorage.getItem('keyboardCaseColor') : null
const caseColor = savedCaseColor || "#0066ff" // Default to blue if no saved color

console.log('🎨 Initial settings using case color:', caseColor, savedCaseColor ? '(from localStorage)' : '(default)')

// Export the default settings as initial_settings for KeySim compatibility
const initial_settings = {
  ...defaultSettings,
  case: {
    ...defaultSettings.case,
    layout: "80", // Use TKL layout instead of 60iso
    style: "CASE_1", // Use CASE_1 style (visible case style)
    primaryColor: caseColor, // Use saved color or default
    material: "brushed" // Use brushed material like defaults
  },
  keys: {
    ...defaultSettings.keys,
    legendPrimaryStyle: "cherry", // Make sure legend style is set
    legendSecondaryStyle: "",
    visible: true
  }
}

export default initial_settings
