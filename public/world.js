
var grid = 0;
var gridStack = 0;
var plane;

var previewTower;

var movingMinions = [];

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
  var g_pi = new THREE.CylinderGeometry( .3, .3, .1, 8 );
  var m_pi = new THREE.MeshPhongMaterial( {color: generate_color(me)} );
  var pi = new THREE.Mesh( g_pi, m_pi );
  previewTower.add(pi);
}

function updateWorld(delta) {
  gridStack = (gridStack + delta / 1000.0) % (Math.PI * 2);
  grid.position.y = .1 + (Math.sin(gridStack) + 1) / 16;

  //updates all the current projectiles
  //console.log("projectiles:",projectiles);
  updateProjectiles(delta).then(deleteCollidedProjectiles);

  // Moving minions
  movingMinions = movingMinions.filter(function(movement) {
    var e_pos = new THREE.Vector3(movement[0].x, 0, movement[0].y);
    var m_pos = movement[0].mesh.position;
    m_pos.x += movement[1].x * delta / 1000.0;
    m_pos.z += movement[1].y * delta / 1000.0;
    if (Math.sign(e_pos.x-m_pos.x) != Math.sign(movement[1].x) ||
          Math.sign(e_pos.z-m_pos.z) != Math.sign(movement[1].y)) {
      m_pos.x = e_pos.x;
      m_pos.z = e_pos.z;
      return false;
    }
    return true;
  });

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
