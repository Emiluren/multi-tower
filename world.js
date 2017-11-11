
function populate() {

  // Create game plane
  var planeGeometry = new THREE.PlaneGeometry(10, 10);
  var planeMaterial = new THREE.MeshBasicMaterial( {color: 0xffff00, side: THREE.DoubleSide} );
  var plane = new THREE.Mesh(planeGeometry, planeMaterial);
  plane.position.z -= 10;
  plane.position.y -= 1;
  plane.rotation.x += Math.PI / 2;
  scene.add(plane);

  // Light
  var directionalLight = new THREE.DirectionalLight( 0xffffff, 0.5 );
  scene.add( directionalLight );

  // load a resource
  loader.load(
  	// resource URL
  	'public/assets/Castle.obj',
  	// called when resource is loaded
  	function ( object ) {
      object.position.z -= 10;
  		scene.add( object );

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
