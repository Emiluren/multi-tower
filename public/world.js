
function populate() {

  // Create game plane
  var planeGeometry = new THREE.PlaneGeometry(10, 10);
  var planeMaterial = new THREE.MeshLambertMaterial( {color: 0xffffff, side: THREE.DoubleSide} );
  var plane = new THREE.Mesh(planeGeometry, planeMaterial);
  plane.receiveShadow = true;
  plane.rotation.x += Math.PI / 2;
  scene.add(plane);

  // Light
  var directionalLight = new THREE.DirectionalLight( 0xffe699, 1 );
  directionalLight.position.set(4, 5, 3);
  directionalLight.target = plane;
  directionalLight.castShadow = true;

  scene.add( directionalLight );
  var light = new THREE.AmbientLight( 0x202020 ); // soft white light
  scene.add( light );

  // Load castle

  var castle = createMesh("castle");
    console.log(castle.children);
    castle.children.forEach(function(child) {
        child.castShadow = true;
        child.receiveShadow = true;
    });
    castle.position.x = 0;
    castle.position.z = -4.5;
    castle.rotation.y = Math.PI;
    scene.add(castle);


}
