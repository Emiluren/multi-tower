var meshData = {};


var meshLoadList = [
  ['castle', 'assets/Castle'],
  ['minion', 'assets/minion_lvl1'],
  ['tower', 'assets/tower_lvl1']
]

function loadOBJFiles() {
  meshLoadList.forEach(function(mesh) {
      name = mesh[0];
      meshData[name] = null;
  });

  return new Promise(function(resolve, reject) {

    meshLoadList.forEach(function(mesh) {

      // instantiate loaders
      var objLoader = new THREE.OBJLoader();
      var mtlLoader = new THREE.MTLLoader();

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
                 let geometryList = [];
                 let mtlList = [];

                 object.children.forEach(function(child) {
                     geometryList.push(child.geometry);
                     mtlList.push(child.material);
                 });


                 meshData[name] = [geometryList, mtlList];

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
    var g = new THREE.Group();

    for (var i = 0; i < meshData[name][0].length; i++) {
        var m = new THREE.Mesh(meshData[name][0][i], meshData[name][1][i]);
        m.castShadow = true;
        m.receiveShadow = true;
        g.add(m);
    }

    return g;
}
