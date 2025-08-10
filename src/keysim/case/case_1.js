import * as THREE from "../three-compat";
import { store } from "../store";
import holes from "./holes";

export default (layout, color) => {
  console.log('🏗️ case_1.js called with layout:', layout?.width + 'x' + layout?.height, 'color:', color);
  
  if (!layout) {
    console.error('❌ CRITICAL: No layout provided to case_1.js!');
    return null;
  }
  
  if (!layout.width || !layout.height) {
    console.error('❌ CRITICAL: Layout missing width/height!', layout);
    return null;
  }
  
  // Check for saved color in localStorage first, then use provided color, then fallback
  const savedColor = typeof window !== 'undefined' ? localStorage.getItem('keyboardCaseColor') : null
  color = savedColor || color || "#0066ff";
  
  console.log('🎨 case_1.js using color:', color, savedColor ? '(from localStorage)' : '(provided/default)')
  
  let cornerRadius = 0.5;
  let bevel = 0.05;
  let bezel = 0.5;
  let height = 1;
  let width = layout.width + bezel * 2;
  let depth = layout.height + bezel * 2;
  let size = store.getState().case.layout;
  let geometry;
  let mesh;
  
  console.log('📏 Case dimensions: width=', width, 'depth=', depth, 'height=', height);
  console.log('🗂️ Store state:', store.getState());

  //create geometry
  let shape = new THREE.Shape();

  //basic outline
  shape.moveTo(0, cornerRadius);
  shape.quadraticCurveTo(0, 0, cornerRadius, 0);
  shape.lineTo(width - cornerRadius, 0);
  shape.quadraticCurveTo(width, 0, width, cornerRadius);
  shape.lineTo(width, depth - cornerRadius);
  shape.quadraticCurveTo(width, depth, width - cornerRadius, depth);
  shape.lineTo(cornerRadius, depth);
  shape.quadraticCurveTo(0, depth, 0, depth - cornerRadius);
  shape.lineTo(0, cornerRadius);

  try {
    shape.holes = holes(size, layout, bezel);
    console.log('🕳️ Shape holes created:', shape.holes?.length || 0, 'holes');

    let extrudeOptions = {
      depth: height,
      steps: 1,
      bevelSegments: 1,
      bevelEnabled: true,
      bevelSize: bevel,
      bevelThickness: bevel,
    };

    console.log('🔨 Creating ExtrudeGeometry with options:', extrudeOptions);
    geometry = new THREE.ExtrudeGeometry(shape, extrudeOptions);
    console.log('✅ ExtrudeGeometry created successfully');
  } catch (error) {
    console.error('❌ Error creating case geometry:', error);
    throw error;
  }
  
  // Handle BufferGeometry compatibility
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
    geometry.faceVertexUvs.push(geometry.faceVertexUvs[0]); //duplicate uvs for ao

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

  console.log('✅ case_1.js: Created mesh with name:', mesh.name, 'position:', mesh.position, 'material color:', color);
  
  return mesh;
};
