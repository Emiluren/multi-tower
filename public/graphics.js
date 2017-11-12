// Set up three js
const WIDTH = window.innerWidth;
const HEIGHT = window.innerHeight;

// Set some camera attributes.
const VIEW_ANGLE = 45;
const ASPECT = WIDTH / HEIGHT;
const NEAR = 0.1;
const FAR = 10000;

// Create a WebGL renderer, camera
// and a scene
const renderer = new THREE.WebGLRenderer();
renderer.context.getShaderInfoLog = function () { return '' };
renderer.shadowMapEnabled = true;
const camera =
    new THREE.PerspectiveCamera(
        VIEW_ANGLE,
        ASPECT,
        NEAR,
        FAR
    );

const scene = new THREE.Scene();

// Add the camera to the scene.
scene.add(camera);
camera.rotateX(-1.0);
camera.position.set(0, 8, 4);

// Start the renderer.
renderer.setSize(WIDTH, HEIGHT);

// // set mtl path
// mtlLoader.setPath('assets/');

function initGraphics() {
  // Get the DOM element to attach to
  const container =
      document.querySelector('#container');

  // Attach the renderer-supplied
  // DOM element.
  container.appendChild(renderer.domElement);

  THREEx.WindowResize(renderer, camera);
}

function createHealthbar(x, y, size, elevation) {
  // Red
  var hbg1 = new THREE.PlaneGeometry(size, .1);
  var hbm1 = new THREE.MeshBasicMaterial({color: 0xff0000});
  var hb1  = new THREE.Mesh(hbg1, hbm1);
  hb1.position.y -= .001;
  // Green
  var hbg2 = new THREE.PlaneGeometry(size, .1);
  var hbm2 = new THREE.MeshBasicMaterial({color: 0x00ff00});
  var hb2  = new THREE.Mesh(hbg2, hbm2);
  hb2.position.z += .001;

  // Group
  var group = new THREE.Group();
  group.add(hb1);
  group.add(hb2);
  group.hb_size = size;
  group.position.set(x, elevation, y);

  return group;
}

function updateHealthbar(hb, perc) {
  hb.children[1].scale.x = perc / 100.0;
  hb.children[1].position.x = hb.hb_size * (perc / 100.0 / 2 - .5);
}
