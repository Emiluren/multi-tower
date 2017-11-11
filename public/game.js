var momentum = new Vector(0, 0, 0);

var acceleration_rate = 1;
var deacceleration_rate = 0.5;

function update(delta) {
  var speed = delta / 100.0;
  var acceleration = new Vector(0,0,0);

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

  momentum = momentum.add(acceleration).multiply(Math.pow(deacceleration_rate , speed));
  camera.position.x += momentum.x*speed
  camera.position.y += momentum.y*speed
  camera.position.z += momentum.z*speed

  updateWorld(delta);
}

function draw() {
  renderer.render(scene, camera);
}
