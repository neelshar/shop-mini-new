import * as THREE from "../three-compat";
import { subscribe } from "../store";
import LAYOUTS from "../../keysim-config/layouts/layouts";
import Util from "../../keysim-util/math";
import case_1 from "./case_1";
import case_2 from "./case_2";
import badge from "./badge";
import ColorUtil from "../../keysim-util/color-simple";
import { lightTexture } from "./lightTexture";
import initial_settings from "../initial_settings";

import { TextureLoader } from "three/src/loaders/TextureLoader.js";
import shadowPath from "../../keysim-assets/dist/shadow-key-noise.png";
import noisePath from "../../keysim-assets/dist/noise.png";
import brushedRoughness from "../../keysim-assets/dist/brushed-metal_roughness-512.png";
import brushedAlbedo from "../../keysim-assets/dist/brushed-metal_albedo-512.png";
import brushedAo from "../../keysim-assets/dist/brushed-metal_ao-512.png";

import shadow_path_100 from "../../keysim-assets/shadows/100.png";
import shadow_path_40 from "../../keysim-assets/shadows/40.png";
import shadow_path_60 from "../../keysim-assets/shadows/60.png";
import shadow_path_60hhkb from "../../keysim-assets/shadows/60hhkb.png";
import shadow_path_60iso from "../../keysim-assets/shadows/60iso.png";
import shadow_path_60wkl from "../../keysim-assets/shadows/60wkl.png";
import shadow_path_65 from "../../keysim-assets/shadows/65.png";
import shadow_path_75 from "../../keysim-assets/shadows/75.png";
import shadow_path_80 from "../../keysim-assets/shadows/80.png";
import shadow_path_95 from "../../keysim-assets/shadows/95.png";
import shadow_path_leftnum from "../../keysim-assets/shadows/leftnum.png";
import shadow_path_numpad from "../../keysim-assets/shadows/numpad.png";
import shadow_path_40ortho from "../../keysim-assets/shadows/40ortho.png";
import shadow_path_50ortho from "../../keysim-assets/shadows/50ortho.png";

import nx from "../../keysim-assets/dist/nx.jpg";
import ny from "../../keysim-assets/dist/ny.jpg";
import nz from "../../keysim-assets/dist/nz.jpg";
import px from "../../keysim-assets/dist/px.jpg";
import py from "../../keysim-assets/dist/py.jpg";
import pz from "../../keysim-assets/dist/pz.jpg";

const shadow_paths = {
  shadow_path_100,
  shadow_path_40,
  shadow_path_60,
  shadow_path_60hhkb,
  shadow_path_60iso,
  shadow_path_60wkl,
  shadow_path_65,
  shadow_path_75,
  shadow_path_80,
  shadow_path_95,
  shadow_path_leftnum,
  shadow_path_numpad,
  shadow_path_40ortho,
  shadow_path_50ortho,
};

const MATERIAL_OPTIONS = {
  matte: {
    metalness: 0,
    roughness: 1,
    clearcoat: 0,
    aoMapIntensity: 0.1,
    clearcoatRoughness: 1,
    lightMapIntensity: 0.2,
  },
  brushed: {
    metalness: 0.4,
    aoMapIntensity: 0.4,
    envMapIntensity: 0.1,
  },
  glossy: {
    metalness: 0.8,
    roughness: 0.1,
    aoMapIntensity: 0.4,
    envMapIntensity: 0.5,
  },
};

// Manage the parts of the board: case, keys.
// dispatch updates and determine when they should be reinitialized
export default class CaseManager {
  constructor(opts) {
    this.scene = opts.scene;
    this.layoutName = initial_settings.case.layout;
    this.style = initial_settings.case.style;
    this.color = initial_settings.case.primaryColor;
    this.finish = initial_settings.case.material;
    this.layout = LAYOUTS[this.layoutName];
    this.texScale = 0.1;
    this.bezel = 0.5;
    this.height = 1;
    this.angle = 6;
    this.r = 0.5;
    
    console.log('🏗️ Initializing CaseManager with:', {
      layoutName: this.layoutName,
      style: this.style,
      color: this.color,
      layoutExists: !!this.layout,
      layoutWidth: this.layout?.width,
      layoutHeight: this.layout?.height,
      availableLayouts: Object.keys(LAYOUTS),
      scene: this.scene ? 'Scene exists' : 'NO SCENE!'
    });
    
    if (!this.layout) {
      console.error('❌ CRITICAL: Layout not found for layoutName:', this.layoutName);
      console.log('Available layouts:', Object.keys(LAYOUTS));
    }
    
    this.setup();
  }

  get width() {
    return this.layout.width + this.bezel * 2;
  }
  get depth() {
    return this.layout.height + this.bezel * 2;
  }
  get angleOffset() {
    return Math.sin(Util.toRad(this.angle)) * this.depth;
  }

  setup() {
    console.log('🔧 CaseManager.setup() starting...');
    
    this.group = new THREE.Group();
    this.group.name = "CASE";
    console.log('✅ Group created');
    
    this.loader = new TextureLoader();
    console.log('✅ TextureLoader created');
    
    try {
      console.log('🔧 Loading textures...');
      this.loadTextures();
      console.log('✅ Textures loaded');
    } catch (e) {
      console.warn('⚠️ Texture loading failed:', e);
    }
    
    try {
      console.log('🔧 Creating environment cube map...');
      this.createEnvCubeMap();
      console.log('✅ Environment cube map created');
    } catch (e) {
      console.warn('⚠️ Environment cube map failed:', e);
    }
    
    try {
      console.log('🔧 Creating case shadow...');
      this.createCaseShadow();
      console.log('✅ Case shadow created');
    } catch (e) {
      console.warn('⚠️ Case shadow failed:', e);
    }
    
    try {
      console.log('🔧 Creating badge...');
      this.createBadge();
      console.log('✅ Badge created');
    } catch (e) {
      console.warn('⚠️ Badge creation failed:', e);
    }
    
    try {
      console.log('🔧 Creating plate...');
      this.createPlate();
      console.log('✅ Plate created');
    } catch (e) {
      console.warn('⚠️ Plate creation failed:', e);
    }
    
    // THIS IS THE CRITICAL PART - THE ACTUAL CASE
    try {
      console.log('🔧 Creating CASE (the main keyboard case)...');
      this.createCase();
      console.log('✅ CASE created successfully');
    } catch (e) {
      console.error('❌ CRITICAL: Case creation failed:', e);
      console.error('Error stack:', e.stack);
    }

    //case global position (shadow is out side this.group)
    console.log('🔧 Positioning case group...');
    this.position();
    console.log('✅ Case positioned');
    
    console.log('🔧 Adding group to scene...');
    this.scene.add(this.group);
    console.log('✅ Group added to scene');
    
    console.log('🏠 Case setup complete! Group children count:', this.group.children.length);
    console.log('🏠 Group children:', this.group.children.map(child => child.name || child.type));

    subscribe("case.primaryColor", (state) => {
      this.color = state.case.primaryColor;
      this.updateCaseMaterial();
    });

    subscribe("case.material", (state) => {
      this.finish = state.case.material;
      this.updateCaseMaterial();
    });

    subscribe("case.style", (state) => {
      this.layout = LAYOUTS[state.case.layout];
      this.style = state.case.style;
      this.updateCaseGeometry();
    });

    subscribe("case.layout", (state) => {
      this.layoutName = state.case.layout;
      this.layout = LAYOUTS[state.case.layout];
      this.updateCaseGeometry();
      this.createCaseShadow();
      this.createBadge();
      this.createPlate();
    });

    subscribe("colorways.active", () => {
      this.updateLightMap();
    });

    // Listen for dynamic case color updates from the UI
    document.addEventListener("force_case_color_update", (event) => {
      console.log('🎨 Received case color update event:', event.detail);
      if (event.detail && event.detail.color) {
        this.color = event.detail.color;
        this.updateCaseMaterial(event.detail.color);
        console.log('✅ Case color updated dynamically to:', event.detail.color);
      }
    });

    // Also expose this instance globally for debugging
    window.caseManager = this;
    
    // Expose scene and renderer for instant color updates
    if (this.scene) window.scene = this.scene;
    if (this.renderer) window.renderer = this.renderer;
    
    console.log('✅ Globals exposed: caseManager, scene, renderer');
  }

  position() {
    this.group.rotation.x = Util.toRad(this.angle);
    this.group.position.x = -this.layout.width / 2;
    this.group.position.y = this.angleOffset + this.height;
  }

  loadTextures() {
    this.aoNoiseTexture = this.loader.load(noisePath);
    this.aoNoiseTexture.wrapS = THREE.RepeatWrapping;
    this.aoNoiseTexture.wrapT = THREE.RepeatWrapping;

    this.aoShadowTexture = this.loader.load(shadowPath);
    this.aoShadowTexture.wrapS = THREE.RepeatWrapping;
    this.aoShadowTexture.wrapT = THREE.RepeatWrapping;

    this.roughnessMap = this.loader.load(brushedRoughness);
    this.roughnessMap.wrapS = THREE.RepeatWrapping;
    this.roughnessMap.wrapT = THREE.RepeatWrapping;
    this.roughnessMap.repeat.x = this.texScale;
    this.roughnessMap.repeat.y = this.texScale;
    this.roughnessMap.rotation = Math.PI / 2;

    this.albedoMap = this.loader.load(brushedAlbedo);
    this.albedoMap.wrapS = THREE.RepeatWrapping;
    this.albedoMap.wrapT = THREE.RepeatWrapping;
    this.albedoMap.repeat.x = this.texScale;
    this.albedoMap.repeat.y = this.texScale;
    this.albedoMap.rotation = Math.PI / 2;

    this.ao = this.loader.load(brushedAo);
    this.ao.wrapS = THREE.RepeatWrapping;
    this.ao.wrapT = THREE.RepeatWrapping;
    this.ao.repeat.x = this.texScale;
    this.ao.repeat.y = this.texScale;
    this.ao.rotation = Math.PI / 2;

    this.lightTexture = lightTexture(ColorUtil.getAccent());
  }

  createPlate() {
    if (this.plate) this.group.remove(this.plate);
    let geometry_plate = new THREE.PlaneGeometry(
      this.width - this.bezel * 2,
      this.depth - this.bezel * 2
    );
    let material_plate = new THREE.MeshLambertMaterial({
      color: "black",
    });
    this.plate = new THREE.Mesh(geometry_plate, material_plate);
    this.plate.rotateX(-Math.PI / 2);
    this.plate.name = "IGNORE";
    this.plate.layers.enable(1);
    this.plate.position.set(
      this.width / 2 - this.bezel,
      -0.5,
      this.depth / 2 - this.bezel
    );
    this.group.add(this.plate);
  }

  createBadge() {
    if (this.badgeMesh) this.group.remove(this.badgeMesh);
    if (this.layout.width > 18) {
      let w = this.layout.width;
      let bw = 3;
      bw = w > 19 ? 4 : bw;
      bw = w > 21 ? 4 : bw;
      let bx = 15.25;
      bx = w > 19 ? 15.5 : bx;
      bx = w > 21 ? 18.5 : bx;
      this.badgeMesh = badge(bw, this.cubemap);
      this.badgeMesh.position.x += bx;
      this.group.add(this.badgeMesh);
    }
  }

  createEnvCubeMap() {
    this.cubemap = new THREE.CubeTextureLoader().load([py, ny, pz, nz, px, nx]);
  }

  createCaseShadow() {
    if (this.shadow) this.scene.remove(this.shadow);
    let sh_w = this.style === "CASE_1" ? 32.7 : 32;
    let sh_h = this.style === "CASE_1" ? 33 : 31.5;
    let sh_o = this.style === "CASE_1" ? 0 : -0.05;
    let shadowTex = this.loader.load(
      shadow_paths[`shadow_path_${this.layoutName}`]
    );
    let shadowMat = new THREE.MeshBasicMaterial({
      map: shadowTex,
    });
    this.shadow = new THREE.Mesh(
      new THREE.PlaneGeometry(sh_w, sh_h),
      shadowMat
    );
    this.shadow.position.z = this.depth / 2 - this.bezel + sh_o;
    this.shadow.position.y = 0.01;
    this.shadow.material.side = THREE.DoubleSide;
    this.shadow.rotateX(-Math.PI / 2);
    this.scene.add(this.shadow);
  }

  getCaseMesh(layout = this.layout, style = this.style) {
    let mesh;
    console.log('🔍 Creating case mesh with style:', JSON.stringify(style), 'layout:', layout?.width, 'x', layout?.height, 'color:', this.color);
    console.log('🔍 Style comparison: style === "CASE_1"?', style === "CASE_1", 'style === "CASE_2"?', style === "CASE_2");
    
    if (style === "CASE_1") {
      console.log('🏗️ Using CASE_1 style');
      mesh = case_1(layout, this.color);
    } else if (style === "CASE_2") {
      console.log('🏗️ Using CASE_2 style');
      mesh = case_2(layout, this.color);
    } else {
      console.log('🏗️ Using CASE_2 style (fallback for unknown style)');
      mesh = case_2(layout, this.color);
    }
    
    console.log('✅ Case mesh created:', mesh ? mesh.name : 'null', 'mesh object:', mesh);
    return mesh;
  }

  createCase() {
    console.log('🏠 Creating case with current style:', this.style);
    
    try {
      this.case = this.getCaseMesh();
      if (this.case) {
        console.log('🔧 About to update case material...');
        this.updateCaseMaterial();
        console.log('🔧 About to add case to group...');
        this.group.add(this.case);
        console.log('✅ Case added to group! Case mesh:', this.case.name, 'Position:', this.case.position);
        console.log('✅ Group children count after adding case:', this.group.children.length);
        
      } else {
        console.error('❌ Failed to create case mesh!');
      }
    } catch (error) {
      console.error('❌ ERROR in createCase():', error);
      console.error('Error stack:', error.stack);
    }
  }

  updateCaseGeometry() {
    let mesh = this.getCaseMesh();
    this.case.geometry = mesh.geometry;
    this.case.position.set(mesh.position.x, mesh.position.y, mesh.position.z);
    this.position();
  }

  updateLightMap() {
    this.lightTexture = lightTexture(ColorUtil.getAccent());
    this.case.material[1].lightMap = this.lightTexture;
  }

  updateCaseMaterial(color = this.color, finish = this.finish) {
    console.log('🔧 updateCaseMaterial called with color:', color, 'finish:', finish);
    
    // Update the instance color
    this.color = color;
    
    if (!this.case) {
      console.log('⚠️ No case mesh found to update');
      return;
    }
    
    // Create a simple, reliable material that won't become transparent
    let material = new THREE.MeshBasicMaterial({
          color: color,
      transparent: false,
      opacity: 1.0
    });
    
    // Set the material (works for both single material and material array setups)
    this.case.material = material;
    
    console.log('✅ Case material updated successfully with color:', color);
    
    // Force a render update
    if (material.needsUpdate !== undefined) {
      material.needsUpdate = true;
    }
    
    // Force scene re-render by marking everything as needing update
    if (this.scene) {
      this.scene.traverse((child) => {
        if (child.material) {
          child.material.needsUpdate = true;
        }
      });
      
      // Trigger a manual render if possible
      if (window.threeRenderer) {
        window.threeRenderer.render(this.scene, window.threeCamera);
      }
    }
    
    // Also dispatch a render event
    document.dispatchEvent(new CustomEvent('force_three_render'));
  }
}
