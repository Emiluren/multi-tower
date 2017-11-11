var meshData = {};

var meshLoadList = [
  ['castle', 'assets/Castle.obj'],
  ['test', 'assets/Castle.obj']
];

function loadOBJFiles() {
  var name = meshLoadList[0][0]
  var url = meshLoadList[0][1]
  loader.load(
  	// resource URL
  	url,
  	// called when resource is loaded
  	function ( object ) {
  		meshData.name = [object.children[0].geometry, object.children[0].material];
      meshLoadList.shift();
      if (meshLoadList.length == 0) {
        start2();
      } else {
        loadOBJFiles();
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
}

function createMesh(name) {
  console.log(meshData);
  return new THREE.Mesh(meshData.name[0], meshData.name[1]);
}
