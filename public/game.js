var adding = false;
var selected = false;

var raycaster = new THREE.Raycaster();
var mouse_pos = new THREE.Vector2();
var tile_pos  = new THREE.Vector2();


var momentum = new THREE.Vector3(0, 0, 0);
var acceleration_rate = 1;
var deacceleration_rate = 0.6;

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
  if (35 < camera.position.y && 0 < momentum.y) momentum.y *= (40 - camera.position.y)/5;
  if (camera.position.y < 6 && momentum.y < 0)  momentum.y *= (camera.position.y - 2 )/5;

  camera.position.x += momentum.x*speed
  camera.position.y += momentum.y*speed
  camera.position.z += momentum.z*speed

  if (adding)
    raycast_toPlane();

  updateWorld(delta);
}

function raycast_toPlane() {
  raycaster.setFromCamera( mouse_pos, camera );
  var intersects = raycaster.intersectObject( plane );
  tile_pos = new THREE.Vector2(Math.round(intersects[0].point.x), Math.round(intersects[0].point.z));
}

function raycast() {
    raycaster.setFromCamera( mouse_pos, camera );
    var intersects = raycaster.intersectObjects ( scene.children );
    return intersects[0];
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
      addingMode();
    }
    else {
        var intersect = raycast();
        var tile = new THREE.Vector2(Math.round(intersect.point.x), Math.round(intersect.point.z)-1);
        var uuid = board[tile.x+","+tile.y];
        var entity;
        if (uuid) {
            entity = entities[uuid[0]];
            $('.sidebar').sidebar('show');
            if (entity) {
                $("#selected_type").text(entity.type);
                selected = entity;
                edat = jQuery.extend({}, entity); // <-- Removing mesh data
                edat.mesh = [];
                $("#entity_data").text(JSON.stringify(edat, null, 2));
            }
        }
        else {
            deselect();
        }
    }
});

function deselect(){
    selected = false;
    $("#entity_data").text('')
    $("#selected_type").text('NONE');
    $('.sidebar').sidebar('hide');
}

function draw() {
  renderer.render(scene, camera);
}
