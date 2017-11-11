var running = false;

// Time
var previousTime = new Date().getTime();

function start() {
  // Init three js
  initGraphics();

  // Load object files
  return loadOBJFiles();
}

function start2() {
    console.log("start2");
    // Populate world
    populate();

    // Set up game
    initControls();

    // Loop
    running = true;
    loop();
}

function loop() {

  updateControls();
  update(deltaTime());
  draw();

  // Loop
  if(running)
    requestAnimationFrame(loop);
}

function deltaTime() {
  var currentTime = new Date().getTime();
  delta = currentTime - previousTime;
  previousTime = currentTime;
  return delta;
}
