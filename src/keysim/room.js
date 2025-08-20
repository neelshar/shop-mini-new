import * as THREE from "./three-compat";
import { store } from "./store";
import { TextureLoader } from "three/src/loaders/TextureLoader.js";
import ThreeUtil from "../keysim-util/three";

// CDN-based texture paths
const CDN_BASE = typeof window !== 'undefined' && window.location 
  ? (import.meta?.env?.VITE_CDN_BASE_URL || '') 
  : '';

const getTexturePath = (path) => {
  const cleanPath = path.replace('../../keysim-assets/', '');
  return CDN_BASE ? `${CDN_BASE}/textures/keysim-assets/${cleanPath}` : `/keysim-assets/${cleanPath}`;
};

const wallShadowPath = getTexturePath('dist/shadow-wall.png');

export default class Room {
  constructor(options) {
    this.options = options || {};
    this.setup();
  }

  setup() {
    //back wall
    let loader = new TextureLoader();
    this.wall = ThreeUtil.createBox(130, 50, 1, 0, 20, -20, this.options.color);
    //Fake ambiant occlusion on wall
    let wallShadowTexture = loader.load(wallShadowPath);
    wallShadowTexture.repeat.set(1, 8);
    let wallShadowMaterial = new THREE.MeshBasicMaterial({
      color: "#ffffff",
      map: wallShadowTexture,
      transparent: true,
    });
    wallShadowMaterial.opacity = 0.1;
    let wallShadowPlane = new THREE.Mesh(
      new THREE.PlaneGeometry(130, 50),
      wallShadowMaterial
    );
    wallShadowPlane.material.side = THREE.DoubleSide;
    wallShadowPlane.position.z = -19.4;
    wallShadowPlane.position.y = 20;

    //desk surface
    let desk_depth = 60;
    this.desk = ThreeUtil.createBox(
      130,
      1,
      desk_depth,
      0,
      -0.6,
      desk_depth / 2 - 15,
      this.options.color
    );
    // Enable shadow receiving on the desk
    this.desk.receiveShadow = true;

    //add to scene
    this.options.scene.add(this.desk, this.wall, wallShadowPlane);

    var self = this;
    // Listen for the event.
    document.addEventListener("board_changed", function (e) {
      self.updateColor(e.detail);
    });

    store.subscribe(() => {
      let state = store.getState();
      if (!state.settings.sceneAutoColor) {
        this.updateColor(state.settings.sceneColor);
      }
    });
  }

  updateColor(color) {
    this.wall.material.color.set(color);
    this.desk.material.color.set(color);
  }
}
