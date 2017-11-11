var raycaster = new THREE.Raycaster();
var mouse_pos = new THREE.Vector2();


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

    // Getting mouse mosition
    $(document).mousemove(function(event) {
        mouse_pos.x =  ( event.clientX / window.innerWidth ) * 2 - 1;
        mouse_pos.y =  ( event.clientY / window.innerWidth ) * 2 - 1;
    });

    // Raycast on mouse click
    $(document).click(function () {
        raycaster.setFromCamera( mouse_pos, camera );
        var intersects = raycaster.intersectObjects( scene.children );
        for ( var i = 0; i < intersects.length; i++ ) {
            intersects[ i ].object.material.color.set( 0xff0000 );
        }
    });

  updateWorld(delta);
}

function draw() {
  renderer.render(scene, camera);
}
