var me = "";
var my_castle;
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


  if (down('to_castle') && my_castle) {
      goToCastle();
  }
  else {
      acceleration.multiplyScalar(1 + 0.5 * (camera.position.y / 60));
      momentum = momentum.add(acceleration).multiplyScalar(Math.pow(deacceleration_rate, speed));
      if (60 < camera.position.y && 0 < momentum.y) momentum.y *= (65 - camera.position.y) / 5;
      if (camera.position.y < 6 && momentum.y < 0) momentum.y *= (camera.position.y - 2 ) / 5;
  }

  camera.position.x += momentum.x*speed
  camera.position.y += momentum.y*speed
  camera.position.z += momentum.z*speed

  if (adding)
    raycast_toPlane();

  updateWorld(delta);
}


var hammertime = new Hammer(renderer.domElement, {});
hammertime.on('pan', function(ev) {
    momentum.x -= ev.velocityX*0.5;
    momentum.z -= ev.velocityY*0.5;
});
hammertime.get('pinch').set({ enable: true });
hammertime.on('pinch', function(ev) {
    momentum.y += ev.scale;
});

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

function goToCastle() {
    console.log('go to castle: '+my_castle.x+' '+my_castle.y);
    if (my_castle) {
        camera.position.x = my_castle.x + 0;
        camera.position.z = my_castle.y + 4;
        camera.position.y = 8;
        momentum.set(0,0,0);
    }
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
        if (intersect) {
            var tile = new THREE.Vector2(Math.round(intersect.point.x), Math.round(intersect.point.z) - 1);
            var uuid = board[tile.x + "," + tile.y];
            var entity;
            if (uuid) {
                entity = entities[uuid[0]];
                $('.sidebar').sidebar('show');
                if (entity) {
                    selected = entity;
                    edat = jQuery.extend({}, entity); // <-- Removing mesh data
                    edat.mesh = [];
                    $("#entity_data").text(JSON.stringify(edat, null, 2));

                    $("#selected_type").text(entity.type);
                    if (entity.player_name == me) {
                        $("#selected_type").addClass('green');
                        $("#selected_type").removeClass('red');
                    }
                    else {
                        $("#selected_type").addClass('red');
                        $("#selected_type").removeClass('green');
                    }
                }
            }
            else {
                deselect();
            }
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
