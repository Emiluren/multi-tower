// Set up three js
const WIDTH = window.innerWidth
const HEIGHT = window.innerHeight

// Set some camera attributes.
const VIEW_ANGLE = 45;
const ASPECT = WIDTH / HEIGHT;
const NEAR = 0.1;
const FAR = 10000;

// Create a WebGL renderer, camera
// and a scene
const renderer = new THREE.WebGLRenderer();
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
camera.rotation.x -= Math.PI / 4;

// Start the renderer.
renderer.setSize(WIDTH, HEIGHT);

// instantiate loaders
var objLoader = new THREE.OBJLoader();
var mtlLoader = new THREE.MTLLoader();

// // set mtl path
// mtlLoader.setPath('assets/');

function initGraphics() {
  // Get the DOM element to attach to
  const container =
      document.querySelector('#container');

  // Attach the renderer-supplied
  // DOM element.
  container.appendChild(renderer.domElement);
}

function showPreview(type){

}