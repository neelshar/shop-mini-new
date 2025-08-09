// Simplified color utility for shop mini compatibility
import initial_settings from "../keysim/initial_settings";
import * as colorConvert from "color-convert";
import COLORWAYS from "../keysim-config/colorways/colorways";

// Basic color manipulation functions
export default class ColorUtil {
  static cachedColorway = null;

  static get colorway() {
    return (
      this.cachedColorway ?? this.getColorway(initial_settings.colorways.active)
    );
  }

  static getColorway(cw_name) {
    cw_name = cw_name || initial_settings.colorways.active;
    let cw = COLORWAYS[cw_name];
    return cw || this.getUserColorway(cw_name) || COLORWAYS['modern_dolch'] || {
      swatches: {
        base: { background: "#777b7e", color: "#e7e7e8" },
        mods: { background: "#505356", color: "#e7e7e8" },
        accent: { background: "#79d1c7", color: "#e7e7e8" }
      },
      override: {}
    };
  }

  static getUserColorway(cw_name) {
    // Simple fallback for custom colorways
    return null;
  }

  static getCaseColor(cw_name) {
    let cw = this.getColorway(cw_name);
    return cw?.case?.color || initial_settings.case.primaryColor;
  }

  static getAccent() {
    const colorway = this.colorway;
    return colorway?.swatches?.accent?.background || "#79d1c7";
  }

  static getTransparentColor(color, alpha = 0.5) {
    // Convert hex to rgba
    const hex = color.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  static addCodeToOverride(code) {
    // Simple implementation for compatibility
    // In the full implementation, this would modify the active colorway
    console.log('addCodeToOverride called with:', code);
  }
  static hexToHsl(hex) {
    try {
      const hsl = colorConvert.hex.hsl(hex);
      return { h: hsl[0], s: hsl[1], l: hsl[2] };
    } catch (error) {
      return { h: 0, s: 0, l: 50 };
    }
  }

  static hslToHex(h, s, l) {
    try {
      return '#' + colorConvert.hsl.hex([h, s, l]);
    } catch (error) {
      return '#808080';
    }
  }

  static lighten(hex, amount = 10) {
    const hsl = this.hexToHsl(hex);
    return this.hslToHex(hsl.h, hsl.s, Math.min(100, hsl.l + amount));
  }

  static darken(hex, amount = 10) {
    const hsl = this.hexToHsl(hex);
    return this.hslToHex(hsl.h, hsl.s, Math.max(0, hsl.l - amount));
  }

  static adjustSaturation(hex, amount = 10) {
    const hsl = this.hexToHsl(hex);
    return this.hslToHex(hsl.h, Math.max(0, Math.min(100, hsl.s + amount)), hsl.l);
  }

  static isValidHex(hex) {
    return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(hex);
  }

  static ensureHex(color) {
    if (this.isValidHex(color)) {
      return color;
    }
    return '#808080'; // fallback gray
  }
}
