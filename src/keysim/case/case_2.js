import * as THREE from "../three-compat";
import { store } from "../store";
import holes from "./holes";

export default (layout, color) => {
  color = color || "#cccccc";
  let cornerRadius = 0;
  let bevel = 0.04;
  let bezel = 0.25;
  let height = 1;
  let width = layout.width + bezel * 2;
  let depth = layout.height + bezel * 2;
  let size = store.getState().case.layout;
  let geometry;
  let mesh;

  //create geometry
  let shape = new THREE.Shape();

  //basic outline
  shape.moveTo(0, cornerRadius);
  shape.lineTo(width - cornerRadius, 0);
  shape.lineTo(width, depth - cornerRadius);
  shape.lineTo(cornerRadius, depth);
  shape.lineTo(0, cornerRadius);

  shape.holes = holes(size, layout, bezel);

  let extrudeOptions = {
    depth: height,
    steps: 1,
    bevelSegments: 1,
    bevelEnabled: true,
    bevelSize: bevel,
    bevelThickness: bevel,
  };

  geometry = new THREE.ExtrudeGeometry(shape, extrudeOptions);

  // Handle BufferGeometry compatibility for vertex manipulation
  if (geometry.isBufferGeometry) {
    // For BufferGeometry, we need to work with position attributes
    const positionAttribute = geometry.getAttribute('position');
    if (positionAttribute) {
      const positions = positionAttribute.array;
      for (let i = 0; i < positions.length; i += 3) {
        const x = positions[i];
        const y = positions[i + 1];
        const z = positions[i + 2];
        
        if (z > 0.5 && y < 0.7) {
          if (depth > 6) {
            positions[i + 2] = z + 0.67;
          } else if (depth > 5) {
            positions[i + 2] = z + 0.55;
          } else {
            positions[i + 2] = z + 0.5;
          }
        }
      }
      positionAttribute.needsUpdate = true;
    }
  } else {
    // Legacy Geometry approach
    for (let i = 0; i < geometry.vertices.length; i++) {
      let v = geometry.vertices[i];
      if (v.z > 0.5 && v.y < 0.7) {
        if (depth > 6) {
          v.z += 0.67;
        } else if (depth > 5) {
          v.z += 0.55;
        } else {
          v.z += 0.5;
        }
      }
    }
  }

  // Handle BufferGeometry compatibility for face materials
  if (geometry.isBufferGeometry) {
    // For BufferGeometry, duplicate UV coordinates for AO mapping
    const uvAttribute = geometry.getAttribute('uv');
    if (uvAttribute) {
      geometry.setAttribute('uv2', uvAttribute.clone());
    }
    
    // Set up material groups for BufferGeometry
    geometry.clearGroups();
    
    // Get face count
    const index = geometry.getIndex();
    if (index) {
      const faceCount = index.count / 3;
      
      // Simple approach: assume first faces are top/bottom, rest are sides
      for (let i = 0; i < faceCount; i++) {
        const materialIndex = i < faceCount * 0.3 ? 0 : 1;
        geometry.addGroup(i * 3, 3, materialIndex);
      }
    }
  } else {
    // Legacy Geometry approach
    geometry.faceVertexUvs.push(geometry.faceVertexUvs[0]);

    for (let i = 0; i < geometry.faces.length; i++) {
      const f = geometry.faces[i];
      //all faces geneated from the extrusion (side faces)
      if (!f.normal.z) {
        f.materialIndex = 1;
      } else {
        f.materialIndex = 0;
      }
    }
  }

  //create mesh
  mesh = new THREE.Mesh(
    geometry,
    new THREE.MeshBasicMaterial({ color: color })
  );
  mesh.name = "CASE";
  mesh.rotation.x = Math.PI / 2;
  mesh.position.set(-bezel, 0, -bezel);

  return mesh;
};
