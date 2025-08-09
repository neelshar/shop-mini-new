// Export KeySim's default settings for compatibility
import defaultSettings from '../keysim-config/settings_user_default.json'

// Export the default settings as initial_settings for KeySim compatibility
const initial_settings = {
  ...defaultSettings,
  case: {
    ...defaultSettings.case,
    layout: "80" // Use TKL layout instead of 60iso
  }
}

export default initial_settings
