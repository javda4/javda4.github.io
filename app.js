const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const debug = document.getElementById("debug");

// ---------------- THREE ----------------
const renderer = new THREE.WebGLRenderer({ canvas, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

camera.position.z = 2;

// simple cube so we KNOW render works
const geo = new THREE.BoxGeometry();
const mat = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
const cube = new THREE.Mesh(geo, mat);
scene.add(cube);

// ---------------- CAMERA TEST ----------------
async function startCamera() {

  debug.innerText = "requesting camera...";

  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });

    debug.innerText = "camera stream received";

    video.srcObject = stream;

    await video.play();

    debug.innerText = "camera playing ✔";

    console.log("CAMERA OK");

  } catch (err) {
    debug.innerText = "camera failed: " + err.message;
    console.error(err);
  }
}

// ---------------- LOOP ----------------
function loop() {

  cube.rotation.y += 0.01;

  renderer.render(scene, camera);

  requestAnimationFrame(loop);
}

// ---------------- START ----------------
async function main() {

  await startCamera();

  debug.innerText = debug.innerText + " | render loop started";

  loop();
}

main();
