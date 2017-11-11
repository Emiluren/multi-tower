
var grid = 0;
var gridStack = 0;
var plane;

var previewTower;

function populate() {

  // Create game plane
  var planeGeometry = new THREE.PlaneGeometry(1001, 1001);
  var planeMaterial = new THREE.MeshLambertMaterial( {color: 0xffffff, side: THREE.DoubleSide} );
  plane = new THREE.Mesh(planeGeometry, planeMaterial);
  plane.receiveShadow = true;
  plane.rotation.x += Math.PI / 2;
  scene.add(plane);

  // Light
  var directionalLight = new THREE.DirectionalLight( 0xffe699, 1 );
  directionalLight.position.set(4, 5, 3);
  directionalLight.target = plane;
  directionalLight.castShadow = true;

  // Grid
  grid = new THREE.GridHelper(1001, 1001);
  grid.position.y += .1;
  scene.add(grid);

  scene.add( directionalLight );
  var light = new THREE.AmbientLight( 0x202020 ); // soft white light
  scene.add( light );

  // Load tower
  previewTower = createMesh("tower");

}

function updateWorld(delta) {
  gridStack = (gridStack + delta / 1000.0) % (Math.PI * 2);
  grid.position.y = .1 + (Math.sin(gridStack) + 1) / 16;

  if (adding) {
    previewTower.position.set(tile_pos.x, 0, tile_pos.y);
  }
}

function addingMode() {
  if (adding) {
    scene.add(previewTower);
  } else {
    scene.remove(previewTower);
  }
}
