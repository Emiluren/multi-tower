var meshData = {};


var meshLoadList = [
  ['castle', 'assets/Castle'],
  ['test', 'assets/Castle']
];

function loadOBJFiles() {
  meshLoadList.forEach(function(mesh) {
      name = mesh[0];
      meshData[name] = null;
  });
  
  return new Promise(function(resolve, reject) {
    meshLoadList.forEach(function(mesh) {
      let name = mesh[0];
      let url = mesh[1] + ".obj";
      let mtlUrl = mesh[1] + ".mtl";
      
      mtlLoader.load(mtlUrl, function(materials) {
         materials.preload();
         objLoader.setMaterials(materials);
         
         objLoader.load(
             // resource URL
             url,
             // called when resource is loaded
             function ( object ) {
                 console.log("materials:",materials);
                 meshData[name] = [object.children[0].geometry, object.children[0].material];
                 
                 if (Object.values(meshData).every((x) => x != null)) {
                     resolve(meshData);
                 }
             },
             // called when loading is in progresses
             function ( xhr ) {
                 
                 console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
                 
             },
             // called when loading has errors
             function ( error ) {
                 
                 console.log( 'An error happened' );
                 
             }
         );
      });
    });
  });
}

function createMesh(name) {
    
    return new THREE.Mesh(meshData[name][0], meshData[name][1]);
}
