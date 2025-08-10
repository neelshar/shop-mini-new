import * as THREE from "../three-compat";
import { keyTexture } from "./texture";
import { keyTexturePlain } from "./texture-plain";
// Removed startup dependency for shop mini compatibility
import { TextureLoader } from "three/src/loaders/TextureLoader.js";
import ambiantOcclusionPath from "../../keysim-assets/dist/shadow-key-noise.png";
import lightMapPath from "../../keysim-assets/materials/white.png";
import initial_settings from "../initial_settings";

const loader = new TextureLoader();
const ambiantOcclusionMap = loader.load(ambiantOcclusionPath);
ambiantOcclusionMap.wrapS = THREE.RepeatWrapping;
ambiantOcclusionMap.wrapT = THREE.RepeatWrapping;

const lightMap = loader.load(lightMapPath);
lightMap.wrapS = THREE.RepeatWrapping;
lightMap.wrapT = THREE.RepeatWrapping;

var computed_materials = {}; // FIXED FACE ASSIGNMENT: Top=text(1), Sides=plain(0)

export const KEY_MATERIAL_STATES = {
  DEFAULT: 0,
  ACTIVE: 1,
  HIGHLIGHTED: 2,
};

export const setKeyMaterialState = (mesh, state, isoent) => {
  if (state === KEY_MATERIAL_STATES.DEFAULT) {
    setMaterialIndexes(mesh, 2, 3, isoent);
  }
  if (state === KEY_MATERIAL_STATES.ACTIVE) {
    setMaterialIndexes(mesh, 0, 1, isoent);
  }
  if (state === KEY_MATERIAL_STATES.HIGHLIGHTED) {
    setMaterialIndexes(mesh, 0, 1, isoent);
  }
};

const setMaterialIndexes = (mesh, side, top, isoent) => {
  let threshold = isoent ? 10 : 6;
  
  // Handle BufferGeometry (new Three.js)
  if (mesh.geometry.isBufferGeometry) {
    // For BufferGeometry, we need to set up material groups
    const index = mesh.geometry.getIndex();
    if (index) {
      mesh.geometry.clearGroups();
      
      // PROPER MATERIAL ASSIGNMENT: Top faces = material 1, Side faces = material 0
      const faceCount = index.count / 3;
      for (let i = 0; i < faceCount; i++) {
        // First 6 faces are the top faces (based on geometry.js order)
        if (i < threshold) {
          mesh.geometry.addGroup(i * 3, 3, 1); // Top material (text texture)
        } else {
          mesh.geometry.addGroup(i * 3, 3, 0); // Side material (plain texture)
        }
      }
      console.log('🎯 ASSIGNED', threshold, 'top faces (material 1), remaining side faces (material 0) for', mesh.name || 'unnamed key');
    }
  } 
  // Handle legacy Geometry
  else if (mesh.geometry.faces) {
    // PROPER MATERIAL ASSIGNMENT for legacy geometry
    mesh.geometry.faces.forEach((f, i) => {
      if (i < threshold) {
        f.materialIndex = 1; // Top material (text texture)
      } else {
        f.materialIndex = 0; // Side material (plain texture)
      }
    });
    console.log('🎯 ASSIGNED', threshold, 'top faces (material 1), remaining side faces (material 0) for', mesh.name || 'unnamed key');
    mesh.geometry.groupsNeedUpdate = true;
  }
};

//generate top and side materials for a single color set
const getMaterialSet = (opts, offset) => {
  let key = `mat${opts.background}`;
  let textureKey = `tex${opts.code}_${opts.legend}_${opts.background}`;

  // Check if we already have this texture to prevent recreation
  if (!computed_materials[textureKey]) {
    console.log('🎨 FORCING TEXTURE APPLICATION for', opts.code);
    let legendTexture = keyTexture(opts);
    
    // Use MeshBasicMaterial for guaranteed visibility (no lighting dependencies)
    let top = new THREE.MeshBasicMaterial({
      map: legendTexture,
      transparent: false,
      opacity: 1.0,
      side: THREE.DoubleSide, // Render both sides
    });
    
    // Force texture properties for maximum visibility
    top.map.minFilter = THREE.LinearFilter;
    top.map.magFilter = THREE.LinearFilter;
    top.map.needsUpdate = true;
    top.needsUpdate = true;
    
    computed_materials[textureKey] = top;
    console.log('✅ FORCED texture material created for', opts.code, 'texture size:', legendTexture.image?.width, 'x', legendTexture.image?.height);
  } else {
    console.log('♻️ Reusing existing texture for', opts.code);
  }

  let topMaterial = computed_materials[textureKey];

  // Create side material with plain texture (no text)
  let sideKey = `side${opts.code}_${opts.background}`;
  
  if (!computed_materials[sideKey]) {
    console.log('🎨 Creating SIDE material (plain texture, no text) for', opts.code);
    let plainTexture = keyTexturePlain(opts);
    
    let sideMaterial = new THREE.MeshBasicMaterial({
      map: plainTexture,
      transparent: false,
      opacity: 1.0,
    });
    
    // Force texture properties
    sideMaterial.map.minFilter = THREE.LinearFilter;
    sideMaterial.map.magFilter = THREE.LinearFilter;
    sideMaterial.map.needsUpdate = true;
    sideMaterial.needsUpdate = true;
    
    computed_materials[sideKey] = sideMaterial;
    console.log('✅ Side material (plain texture) created for', opts.code);
  }
  
  let sideMaterial = computed_materials[sideKey];
  
  console.log('🎯 TWO TEXTURES READY:', {
    side: 'Plain blue texture (no text)', 
    top: 'Blue texture + black text'
  });
  
  return [sideMaterial, topMaterial];
};

export const keyMaterials = (opts) => {
  let base = getMaterialSet(opts);
  console.log('🎯 FIXED FACE ASSIGNMENT for', opts.code, 'TIMESTAMP:', Date.now());
  
  // PROPER ASSIGNMENT: Top face = text texture, All sides = plain texture
  let materials = [base[0], base[1], base[0], base[0]]; // Sides=plain, Top=text
  
  console.log('🎯 ASSIGNED: Top face gets text, sides get plain texture for', opts.code);
  return materials;
};

export const updateMaterials = (mesh, opts) => {
  console.log('🔧 updateMaterials called with opts:', opts);
  let base = getMaterialSet(opts);
  
  // PROPER ASSIGNMENT: Top face = text texture, All sides = plain texture
  mesh.material[0] = base[0]; // Plain texture (side)
  mesh.material[1] = base[1]; // Text texture (top)
  mesh.material[2] = base[0]; // Plain texture (side)  
  mesh.material[3] = base[0]; // Plain texture (side)
  
  setKeyMaterialState(mesh, KEY_MATERIAL_STATES.DEFAULT, opts.isIsoEnt);
  
  // Force material updates
  for (let i = 0; i < 4; i++) {
    if (mesh.material[i]) {
      mesh.material[i].needsUpdate = true;
    }
  }
  mesh.geometry.groupsNeedUpdate = true;
  
  console.log('🟢 FORCED all material slots to use green texture for', opts.code);
  console.log('🎨 Material[0] has map:', mesh.material[0].map ? 'YES' : 'NO');
};

export const updateActiveMaterials = (mesh, opts) => {
  opts.color = initial_settings.keys.activeColor;
  opts.background = initial_settings.keys.activeBackground;
  let active = getMaterialSet(opts);
  mesh.material[0] = active[0];
  mesh.material[1] = active[1];
  setKeyMaterialState(mesh, KEY_MATERIAL_STATES.DEFAULT, opts.isIsoEnt);
};

//simulate highlighting by toggling lightmap intensity
export const enableHighlight = (key_mesh, layer) => {
  key_mesh.material.forEach((m) => (m.lightMapIntensity = 0.2));
};
export const disableHighlight = (key_mesh, layer) => {
  key_mesh.material.forEach((m) => (m.lightMapIntensity = 0));
};
