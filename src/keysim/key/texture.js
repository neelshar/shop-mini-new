import * as THREE from "../three-compat";
import LEGENDS from "../../keysim-config/legends/primary/primary";
import SUBS from "../../keysim-config/legends/subs/subs";
import KeyUtil from "../../keysim-util/keyboard";

const MIP_COUNT = 0;

//genertates a texture with canvas for top of key
export const keyTexture = (opts) => {
  console.log('🎨 keyTexture called for key:', opts.code, 'legend:', opts.legend, 'background:', opts.background, 'opts:', opts);
  
  // Texture creation confirmed working
  if (opts.code === 'KC_Q') {
    console.log('✅ Q key texture creation confirmed');
  }
  
  let w = opts.w;
  let h = opts.h;
  let legend = opts.legend;
  let sublegend = opts.sub;
  let key = opts.code;
  var texture;
  let pxPerU = 128;
  let subColor = opts.subColor || opts.color;
  let fg = opts.color;
  let bg = opts.background;
  
  // SIMPLE CONTRAST CALCULATION FUNCTION
  const getContrastingTextColor = (backgroundColor) => {
    console.log('🔍 getContrastingTextColor input:', backgroundColor, 'type:', typeof backgroundColor);
    
    // If no valid background color, default to white text on dark background
    if (!backgroundColor || typeof backgroundColor !== 'string') {
      console.log('🔍 Invalid background, using white text');
      return '#FFFFFF';
    }
    
    // Convert hex color to RGB
    let hex = backgroundColor.replace('#', '');
    
    // Handle 3-digit hex colors
    if (hex.length === 3) {
      hex = hex.split('').map(char => char + char).join('');
    }
    
    // Parse RGB values
    const r = parseInt(hex.substr(0, 2), 16) || 0;
    const g = parseInt(hex.substr(2, 2), 16) || 0;
    const b = parseInt(hex.substr(4, 2), 16) || 0;
    
    console.log('🔍 RGB values:', { r, g, b, hex, originalBg: backgroundColor });
    
    // Simple brightness calculation (0-255 scale)
    const brightness = (r + g + b) / 3;
    
    console.log('🔍 Calculated brightness:', brightness);
    
    // INVERTED LOGIC: If brightness > 128, use white text
    // If brightness <= 128, use black text
    const result = brightness > 128 ? '#FFFFFF' : '#000000';
    console.log('🔍 Final text color:', result, 'for brightness:', brightness);
    return result;
  };

  //iso enter add extra .25 for overhang
  let isIsoEnter = key === "KC_ENT" && h > 1;
  if (isIsoEnter) {
    w = w + 0.25;
  }

  let canvas = document.createElement("canvas");
  canvas.height = pxPerU * h;
  canvas.width = pxPerU * w;

  //let canvas = new OffscreenCanvas(pxPerU * w, pxPerU * h);

  let ctx = canvas.getContext("2d");
  //draw base color
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Clean keycap rendering without debug borders

  //draw gradient to simulate sculpting
  let gradient;
  if (key === "KC_SPC") {
    //convex
    gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, "rgba(0,0,0,0.15)");
    gradient.addColorStop(0.5, "rgba(128,128,128,0.0)");
    gradient.addColorStop(1, "rgba(255,255,255,0.15)");
  } else {
    //concave
    //simulate slight curve with gradient on face
    gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
    gradient.addColorStop(0, "rgba(255,255,255,0.2)");
    gradient.addColorStop(0.4, "rgba(255,255,255,0.0)");
    gradient.addColorStop(0.6, "rgba(0,0,0,0)");
    gradient.addColorStop(1, "rgba(0,0,0,0.15)");
  }

  //bottom edge highlight
  let shineOpacity = 0.4;
  let shineRight = ctx.createLinearGradient(0, 0, canvas.width, 0);
  shineRight.addColorStop(0, `rgba(255,255,255,${0 * shineOpacity})`);
  shineRight.addColorStop(0.03, `rgba(255,255,255,${0 * shineOpacity})`);
  shineRight.addColorStop(0.07, `rgba(255,255,255,${0.6 * shineOpacity})`);
  shineRight.addColorStop(0.8, `rgba(255,255,255,${0.6 * shineOpacity})`);
  shineRight.addColorStop(0.95, `rgba(255,255,255,${0 * shineOpacity})`);

  //side edge highlight
  let shineBottom = ctx.createLinearGradient(0, 0, 0, canvas.height);
  let highlightRatio = (canvas.width - pxPerU * 0.04) / canvas.width;
  shineBottom.addColorStop(0, `rgba(255,255,255,${0 * shineOpacity})`);
  shineBottom.addColorStop(0.03, `rgba(255,255,255,${0 * shineOpacity})`);
  shineBottom.addColorStop(0.15, `rgba(255,255,255,${0.5 * shineOpacity})`);
  shineBottom.addColorStop(0.5, `rgba(255,255,255,${0.7 * shineOpacity})`);
  shineBottom.addColorStop(0.85, `rgba(255,255,255,${1.1 * shineOpacity})`);
  shineBottom.addColorStop(0.9, `rgba(255,255,255,${0.7 * shineOpacity})`);
  shineBottom.addColorStop(0.95, `rgba(255,255,255,${0 * shineOpacity})`);
  shineBottom.addColorStop(1, `rgba(255,255,255,${0 * shineOpacity})`);

  // TEMPORARILY DISABLE GRADIENTS FOR DEBUGGING
  // //draw gradients
  // ctx.fillStyle = gradient;
  // ctx.fillRect(0, 0, canvas.width, canvas.height);

  // ctx.fillStyle = shineRight;
  // ctx.fillRect(0, canvas.height * 0.97, canvas.width, canvas.height);

  // ctx.fillStyle = shineBottom;
  // ctx.fillRect(canvas.width * highlightRatio, 0, canvas.width, canvas.height);

  // COMPLETE CHARACTER MAPPING - INCLUDING MULTI-CHARACTER KEYS
  const SIMPLE_CHAR_MAP = {
    'KC_A': 'A', 'KC_B': 'B', 'KC_C': 'C', 'KC_D': 'D', 'KC_E': 'E', 'KC_F': 'F',
    'KC_G': 'G', 'KC_H': 'H', 'KC_I': 'I', 'KC_J': 'J', 'KC_K': 'K', 'KC_L': 'L',
    'KC_M': 'M', 'KC_N': 'N', 'KC_O': 'O', 'KC_P': 'P', 'KC_Q': 'Q', 'KC_R': 'R',
    'KC_S': 'S', 'KC_T': 'T', 'KC_U': 'U', 'KC_V': 'V', 'KC_W': 'W', 'KC_X': 'X',
    'KC_Y': 'Y', 'KC_Z': 'Z',
    'KC_1': '1', 'KC_2': '2', 'KC_3': '3', 'KC_4': '4', 'KC_5': '5',
    'KC_6': '6', 'KC_7': '7', 'KC_8': '8', 'KC_9': '9', 'KC_0': '0',
    'KC_ENT': '⏎', 'KC_ESC': 'Esc', 'KC_BSPC': '⌫', 'KC_TAB': 'Tab',
    'KC_SPC': '', 'KC_MINS': '-', 'KC_EQL': '=', 'KC_LBRC': '[', 'KC_RBRC': ']',
    'KC_BSLS': '\\', 'KC_SCLN': ';', 'KC_QUOT': "'", 'KC_GRV': '`',
    'KC_COMM': ',', 'KC_DOT': '.', 'KC_SLSH': '/', 'KC_CAPS': 'Caps',
    'KC_F1': 'F1', 'KC_F2': 'F2', 'KC_F3': 'F3', 'KC_F4': 'F4',
    'KC_F5': 'F5', 'KC_F6': 'F6', 'KC_F7': 'F7', 'KC_F8': 'F8',
    'KC_F9': 'F9', 'KC_F10': 'F10', 'KC_F11': 'F11', 'KC_F12': 'F12',
    'KC_LSFT': 'Shift', 'KC_RSFT': 'Shift', 'KC_LCTL': 'Ctrl', 'KC_RCTL': 'Ctrl',
    'KC_LALT': 'Alt', 'KC_RALT': 'Alt', 'KC_LGUI': 'Super', 'KC_RGUI': 'Super',
    // NAVIGATION AND SPECIAL KEYS WITH PROPER LABELS
    'KC_UP': 'UP', 'KC_DOWN': 'DOWN', 'KC_LEFT': 'LEFT', 'KC_RGHT': 'RIGHT',
    'KC_INS': 'INS', 'KC_DEL': 'DEL', 'KC_HOME': 'HOME', 'KC_END': 'END',
    'KC_PGUP': 'PG UP', 'KC_PGDN': 'PG DN', 'KC_PSCR': 'PSCR', 'KC_SLCK': 'SLCK',
    'KC_PAUS': 'PAUSE', 'KC_NUM': 'NUM', 'KC_MENU': 'MENU'
  };
  
  // Get the simple character
  let mainChar = SIMPLE_CHAR_MAP[key] || key.replace('KC_', '');
  
  console.log('🔤 Simple character mapping:', {
    key,
    mainChar,
    legend,
    available: !!SIMPLE_CHAR_MAP[key]
  });

  // Old font setup removed - using dynamic sizing below
  
  // No debugging elements needed
  let ent_off_x = 0;
  let ent_off_y = 0;
  if (isIsoEnter) {
    ent_off_x = 15;
    ent_off_y = 6;
  }

  // FLIP CANVAS COORDINATE SYSTEM TO FIX UPSIDE-DOWN TEXT
  
  // Save the current context state
  ctx.save();
  
  // Transform coordinate system to flip vertically
  ctx.scale(1, -1); // Flip Y axis
  ctx.translate(0, -canvas.height); // Move origin back to top-left
  
  // Use the actual keycap background color
  ctx.fillStyle = bg; // Use the provided background color
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Add subtle border with darker version of the background
  const borderColor = getContrastingTextColor(bg) === '#FFFFFF' ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.2)';
  ctx.strokeStyle = borderColor;
  ctx.lineWidth = 4;
  ctx.strokeRect(2, 2, canvas.width - 4, canvas.height - 4);
  
  // Set up text properties with DYNAMIC FONT SIZING
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  
  // SMART DYNAMIC FONT SIZING for multi-character keys
  let fontSize = 60; // Default large font for single characters
  
  if (mainChar && mainChar.length > 1) {
    // Base font size by character count
    if (mainChar.length === 2) {
      fontSize = 45; // 2 chars: UP, INS, etc.
    } else if (mainChar.length === 3) {
      fontSize = 36; // 3 chars: DEL, END, etc.
    } else if (mainChar.length === 4) {
      fontSize = 28; // 4 chars: HOME, DOWN, etc.
    } else if (mainChar.length >= 5) {
      fontSize = 24; // 5+ chars: PAUSE, SHIFT, etc.
    }
    
    // Additional scaling based on actual key dimensions
    const maxFontByWidth = (canvas.width * 0.8) / mainChar.length;
    const maxFontByHeight = canvas.height * 0.5;
    
    fontSize = Math.min(fontSize, maxFontByWidth, maxFontByHeight);
    
    // Ensure minimum readable size
    fontSize = Math.max(fontSize, 16);
  }
  
  ctx.font = `bold ${fontSize}px Arial`;
  console.log('🔤 Font size for', mainChar, ':', fontSize + 'px');
  
  // Debug font and text info
  console.log('🖋️ Drawing text:', {
    mainChar,
    fontSize,
    font: ctx.font,
    fillStyle: ctx.fillStyle,
    canvas: { width: canvas.width, height: canvas.height }
  });
  
  // Calculate contrasting text color based on background
  const contrastingTextColor = getContrastingTextColor(bg);
  ctx.fillStyle = contrastingTextColor;
  
  console.log('🎨 Keycap contrast DEBUG:', {
    key: key,
    backgroundColor: bg,
    bgType: typeof bg,
    bgValue: bg,
    calculatedTextColor: contrastingTextColor,
    reason: contrastingTextColor === '#FFFFFF' ? 'bright background -> white text' : 'dark background -> black text'
  });
  
  if (mainChar && mainChar.trim().length > 0) {
    console.log('🔤 Drawing FLIPPED character:', mainChar, 'for key:', key);
    ctx.fillText(mainChar, canvas.width / 2, canvas.height / 2);
  } else {
    console.log('🔤 Drawing fallback "X" for key:', key);
    ctx.fillText('X', canvas.width / 2, canvas.height / 2);
  }
  
  // No accent dots - keep text clean
  
  // Restore the context state
  ctx.restore();
  
  console.log('✅ Text drawing completed for key:', key);

  // Skip sub-characters for now to focus on main legends

  texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  texture.flipY = false; // Don't flip texture since we're flipping the canvas drawing
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  
  console.log('🖼️ Created texture for key:', key, 'texture:', texture, 'canvas size:', canvas.width + 'x' + canvas.height);
  
  // Canvas rendering confirmed working - debug canvas removed to save WebGL resources
  if (key === 'KC_Q') {
    console.log('🎯 Q KEY CANVAS confirmed working - size:', canvas.width + 'x' + canvas.height);
  }
  
  // For debugging: show the canvas in the browser (optional)
  if (key === 'KC_Q') {
    console.log('🎯 DEBUG: Q key canvas for inspection:', canvas);
    // Uncomment next line to see the canvas in the browser for debugging
    // document.body.appendChild(canvas);
  }

  if (MIP_COUNT > 0) {
    // texture.mipmaps[0] = canvas;
    // for (let i = 1; i < MIP_COUNT + 1; i++) {
    //   let scale = 1 / 2 ** i;
    //   let mip_w = opts.w * pxPerU * scale;
    //   let mip_h = opts.h * pxPerU * scale;
    //   let mip_canvas = document.createElement("canvas");
    //   let mip_ctx = mip_canvas.getContext("2d");
    //   mip_canvas.width = mip_w;
    //   mip_canvas.height = mip_h;
    //   mip_ctx.fillStyle = "#ff0000";
    //   mip_ctx.fillRect(0, 0, mip_w, mip_h);
    //   // mip_ctx.scale(scale, scale);
    //   // mip_ctx.drawImage(canvas, 0, 0);
    //   texture.mipmaps[i] = mip_canvas;
    //   if (DEBUG) {
    //     document.body.appendChild(mip_canvas);
    //   }
    // }
  }

  //document.body.appendChild(canvas);

  texture.needsUpdate = true;
  texture.minFilter = THREE.NearestMipmapNearestFilter;
  return texture;
};
