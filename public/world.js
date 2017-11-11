
function populate() {

  // Create game plane
  var planeGeometry = new THREE.PlaneGeometry(10, 10);
  var planeMaterial = new THREE.MeshLambertMaterial( {color: 0xffffff, side: THREE.DoubleSide} );
  var plane = new THREE.Mesh(planeGeometry, planeMaterial);
  plane.receiveShadow = true;
  plane.rotation.x += Math.PI / 2;
  scene.add(plane);

  // Light
  var directionalLight = new THREE.DirectionalLight( 0xffe699, 0.5 );
  directionalLight.position.set(4, 5, 3);
  directionalLight.target = plane;
  directionalLight.castShadow = true;

  scene.add( directionalLight );
  var light = new THREE.AmbientLight( 0x202020 ); // soft white light
  scene.add( light );

  // Load castle
  for (var i = 0; i < 10; i++) {
    for (var j = 0; j < 10; j++) {
      if ((i+j) % 2 == 0)
        continue;
      var castle = createMesh("castle");
      castle.castShadow = true;
      castle.receiveShadow = true;
      castle.material = new THREE.MeshLambertMaterial();
      castle.position.x = i - 4.5;
      castle.position.z = j - 4.5;
      scene.add(castle);
    }
  }
}
