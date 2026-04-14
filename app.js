const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const debug = document.getElementById("debug");

// ---------------- THREE.JS SETUP ----------------
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

// simple object so we know rendering works
const geometry = new THREE.BoxGeometry();
const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);

// ---------------- CAMERA (FIXED VERSION) ----------------
async function startCamera() {
  debug.innerText = "requesting camera...";

  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        width: 1280,
        height: 720
      },
      audio: false
    });

    debug.innerText = "stream received";

    video.srcObject = stream;

    // 🔥 CRITICAL FIXES
    video.muted = true;
    video.playsInline = true;
    video.autoplay = true;

    await video.play();

    video.style.display = "block";
    video.style.visibility = "visible";
    video.style.opacity = "1";
    video.style.zIndex = "9999";

    debug.innerText = "camera playing ✔";

    console.log("VIDEO ELEMENT:", video);

  } catch (err) {
    debug.innerText = "camera failed: " + err.message;
    console.error(err);
  }
}

// ---------------- RENDER LOOP ----------------
function loop() {

  cube.rotation.y += 0.01;

  renderer.render(scene, camera);

  requestAnimationFrame(loop);
}

// ---------------- DEBUG MONITOR ----------------
function startDebug() {
  setInterval(() => {
    debug.innerText =
      "readyState: " + video.readyState +
      " | size: " + video.videoWidth + "x" + video.videoHeight;
  }, 1000);
}

// ---------------- MAIN ----------------
async function main() {

  await startCamera();

  startDebug();

  loop();
}

main();
