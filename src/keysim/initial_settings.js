// Export KeySim's default settings for compatibility
import defaultSettings from '../keysim-config/settings_user_default.json'

// Export the default settings as initial_settings for KeySim compatibility
const initial_settings = {
  ...defaultSettings,
  case: {
    ...defaultSettings.case,
    layout: "80", // Use TKL layout instead of 60iso
    style: "CASE_1", // Use CASE_1 style (visible case style)
    primaryColor: "#eeeeee", // Default case color
    material: "brushed" // Use brushed material like defaults
  }
}

export default initial_settings
