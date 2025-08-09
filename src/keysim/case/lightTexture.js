import * as THREE from "../three-compat";
import ColorUtil from "../../keysim-util/color-simple";

export const lightTexture = (accent) => {
  let size = 64;
  var texture;
  let canvas = document.createElement("canvas");
  canvas.height = size;
  canvas.width = size;
  let ctx = canvas.getContext("2d");

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = ColorUtil.getTransparentColor(accent, 0.5);
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  //document.body.appendChild(canvas);
  texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.needsUpdate = true;
  return texture;
};
