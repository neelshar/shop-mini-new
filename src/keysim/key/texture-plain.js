import * as THREE from "../three-compat";
// Removed legend imports since this is a plain texture with no text

const MIP_COUNT = 0;

//generates a PLAIN texture with canvas for key (NO TEXT)
export const keyTexturePlain = (opts) => {
  console.log('🎨 keyTexturePlain (NO TEXT) called for key:', opts.code);
  
  // Texture creation confirmed working
  if (opts.code === 'KC_Q') {
    console.log('✅ Q key texture creation confirmed');
  }
  
  let w = opts.w;
  let h = opts.h;
  let key = opts.code;
  var texture;
  let pxPerU = 128;
  let bg = opts.background; // Background color still needed for canvas

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
  
  // FLIP CANVAS COORDINATE SYSTEM TO MATCH ORIGINAL
  ctx.save();
  ctx.scale(1, -1); // Flip Y axis
  ctx.translate(0, -canvas.height); // Move origin back to top-left
  
  // Draw the same blue background as the text version, but no text
  ctx.fillStyle = '#4a90e2'; // Clear blue background
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Darker blue border for definition (same as text version)
  ctx.strokeStyle = '#2c5aa0'; // Darker blue border
  ctx.lineWidth = 8;
  ctx.strokeRect(4, 4, canvas.width - 8, canvas.height - 8);

  // PLAIN TEXTURE - No gradients, no text, just clean blue background
  // (Background and border already drawn above)

  // Skip all character processing - this is a plain texture with no text
  
  // PLAIN TEXTURE - NO TEXT, NO DOTS, JUST CLEAN BLUE
  console.log('🎨 Plain blue texture (no text) created for key:', key);
  
  // Restore the context state
  ctx.restore();
  
  console.log('✅ Plain texture drawing completed for key:', key);

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
