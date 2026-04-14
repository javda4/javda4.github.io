const video = document.getElementById("video");
const canvas = document.getElementById("canvas");

// -------------------- CAMERA (always runs first)
// --------------------
async function startCamera() {
  const stream = await navigator.mediaDevices.getUserMedia({ video: true });
  video.srcObject = stream;
  await video.play();
}

// -------------------- THREE.JS (matplotlib replacement)
// --------------------
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

const points = new THREE.Points(geometry, material);
scene.add(points);

// -------------------- LOAD MEDIA PIPE SAFELY
// --------------------
let FaceLandmarker;
let FilesetResolver;

async function loadMediaPipe() {
  try {
    const vision = await import(
      "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/vision_bundle.mjs"
    );

    FaceLandmarker = vision.FaceLandmarker;
    FilesetResolver = vision.FilesetResolver;

    console.log("MediaPipe loaded");
  } catch (e) {
    console.error("MediaPipe failed:", e);
    return false;
  }

  return true;
}

// -------------------- MAIN LOOP
// --------------------
async function main() {

  await startCamera();

  const mpOK = await loadMediaPipe();

  if (!mpOK) {
    console.warn("Running camera only mode");
    return;
  }

  const fileset = await FilesetResolver.forVisionTasks(
    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm"
  );

  const landmarker = await FaceLandmarker.createFromOptions(fileset, {
    baseOptions: {
      modelAssetPath: "./assets/face_landmarker.task"
    },
    runningMode: "VIDEO",
    numFaces: 1
  });

  function loop() {

    const result = landmarker.detectForVideo(video, performance.now());

    let pts = [];

    if (result.faceLandmarks?.length > 0) {
      for (const lm of result.faceLandmarks[0]) {
        pts.push(lm.x - 0.5, -(lm.y - 0.5), lm.z);
      }

      geometry.setAttribute(
        "position",
        new THREE.Float32BufferAttribute(pts, 3)
      );

      geometry.attributes.position.needsUpdate = true;
    }

    renderer.render(scene, camera);
    requestAnimationFrame(loop);
  }

  loop();
}

main();
