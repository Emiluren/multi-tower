var adding = false;

var raycaster = new THREE.Raycaster();
var mouse_pos = new THREE.Vector2();
var tile_pos  = new THREE.Vector2();


var momentum = new THREE.Vector3(0, 0, 0);
var acceleration_rate = 1;
var deacceleration_rate = 0.5;

function update(delta) {

  // Moving camera

  var speed = delta / 100.0;
  var acceleration = new THREE.Vector3(0,0,0);

  if (down("up"))
      acceleration.z -= speed*acceleration_rate;
  if (down("down"))
      acceleration.z += speed*acceleration_rate;
  if (down("left"))
      acceleration.x -= speed*acceleration_rate;
  if (down("right"))
      acceleration.x += speed*acceleration_rate;
  if (down("ascend"))
      acceleration.y += speed*acceleration_rate;
  if (down("descend"))
      acceleration.y -= speed*acceleration_rate;

  momentum = momentum.add(acceleration).multiplyScalar(Math.pow(deacceleration_rate , speed));
  camera.position.x += momentum.x*speed
  camera.position.y += momentum.y*speed
  camera.position.z += momentum.z*speed

  if(adding)
    raycast();

  updateWorld(delta);
}

function raycast() {
  raycaster.setFromCamera( mouse_pos, camera );
  var intersects = raycaster.intersectObject( plane );
  tile_pos = new THREE.Vector2(Math.round(intersects[0].point.x), Math.round(intersects[0].point.z));
}

// Getting mouse position
$(document).mousemove(function(event) {
    mouse_pos.x =  ( event.clientX / window.innerWidth ) * 2 - 1;
    mouse_pos.y =  -( event.clientY / window.innerHeight ) * 2 + 1;
});

// Raycast on mouse click
$(renderer.domElement).click(function () {
    if (adding) {
      request_create_tower(tile_pos.x, tile_pos.y);
      adding = false;
      addingMode();
    }
});

function draw() {
  renderer.render(scene, camera);
}
