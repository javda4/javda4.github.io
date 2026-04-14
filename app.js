const video = document.getElementById("video");
const canvas = document.getElementById("canvas");

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

const geometry = new THREE.BufferGeometry();
const material = new THREE.PointsMaterial({
  color: 0x00ff00,
  size: 0.01
});

const cloud = new THREE.Points(geometry, material);
scene.add(cloud);

// ---------------- CAMERA (FORCED SAFE START) ----------------
async function startCamera() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });

    video.srcObject = stream;

    await new Promise((resolve) => {
      video.onloadedmetadata = () => {
        video.play();
        resolve();
      };
    });

    console.log("CAMERA STARTED");
  } catch (err) {
    console.error("CAMERA ERROR:", err);
  }
}

// ---------------- MAIN ----------------
async function main() {

  await startCamera();

  // TEMP DEBUG: confirm loop works BEFORE MediaPipe
  function loop() {

    // simple rotating test so we know render is alive
    cloud.rotation.y += 0.01;

    renderer.render(scene, camera);
    requestAnimationFrame(loop);
  }

  loop();
}

main();
