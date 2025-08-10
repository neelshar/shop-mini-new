import * as THREE from "../three-compat";
import { keyTexture } from "./texture";
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

var computed_materials = {}; // Cache cleared - will force bright green texture regeneration

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
      
      // FORCE ALL FACES TO USE MATERIAL INDEX 0 (which has our green texture)
      const faceCount = index.count / 3;
      for (let i = 0; i < faceCount; i++) {
        // ALWAYS use material index 0 (guaranteed to have our green texture)
        mesh.geometry.addGroup(i * 3, 3, 0);
      }
      console.log('🟢 FORCED', faceCount, 'faces to use top material for', mesh.name || 'unnamed key');
    }
  } 
  // Handle legacy Geometry
  else if (mesh.geometry.faces) {
    // FORCE ALL FACES TO USE MATERIAL INDEX 0 (green texture) for legacy geometry too
    mesh.geometry.faces.forEach((f, i) => {
      f.materialIndex = 0; // ALWAYS use material index 0 (guaranteed to have our green texture)
    });
    console.log('🟢 FORCED', mesh.geometry.faces.length, 'legacy faces to use top material for', mesh.name || 'unnamed key');
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

  let top = computed_materials[textureKey];

  if (computed_materials[key]) {
    return [computed_materials[key].clone(), top];
  }
  let side = new THREE.MeshStandardMaterial({
    aoMap: ambiantOcclusionMap,
    color: opts.background,
    aoMapIntensity: 0.4,
    lightMap: lightMap,
    lightMapIntensity: 0,
  });
  computed_materials[key] = side;
  return [side, top];
};

export const keyMaterials = (opts) => {
  let base = getMaterialSet(opts);
  console.log('🎨 keyMaterials - base materials created for', opts.code);
  
  // Create all 4 materials but use our green texture material for ALL slots
  let materials = [base[1], base[1], base[1], base[1]]; // ALL use our green texture material
  
  console.log('🟢 FORCED all 4 material slots to use green texture material for', opts.code);
  return materials;
};

export const updateMaterials = (mesh, opts) => {
  console.log('🔧 updateMaterials called with opts:', opts);
  let base = getMaterialSet(opts);
  
  // FORCE ALL MATERIAL SLOTS TO USE OUR GREEN TEXTURE MATERIAL
  mesh.material[0] = base[1]; // Green texture
  mesh.material[1] = base[1]; // Green texture  
  mesh.material[2] = base[1]; // Green texture
  mesh.material[3] = base[1]; // Green texture
  
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
