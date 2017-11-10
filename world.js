
function populate() {

  // Create game plane
  var planeGeometry = new THREE.PlaneGeometry(10, 10);
  var planeMaterial = new THREE.MeshBasicMaterial( {color: 0xffff00, side: THREE.DoubleSide} );
  var plane = new THREE.Mesh(planeGeometry, planeMaterial);
  plane.position.z -= 10;
  plane.position.y -= 1;
  scene.add(plane);

  // Light
  var directionalLight = new THREE.DirectionalLight( 0xffffff, 0.5 );
  scene.add( directionalLight );
}
