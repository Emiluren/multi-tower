
function update(delta) {
  var speed = delta / 100.0;
  if (down("up"))
    camera.position.z -= speed;
  if (down("down"))
    camera.position.z += speed;
  if (down("left"))
    camera.position.x -= speed;
  if (down("right"))
    camera.position.x += speed;
  if (down("ascend"))
    camera.position.y += speed;
  if (down("descend"))
    camera.position.y -= speed;
}

function draw() {
  renderer.render(scene, camera);
}
