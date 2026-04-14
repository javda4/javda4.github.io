let FaceLandmarker, FilesetResolver;

// --------------------
// SAFE IMPORT (fallback system)
// --------------------
try {
  const vision = await import("./assets/vision_bundle.js");
  FaceLandmarker = vision.FaceLandmarker;
  FilesetResolver = vision.FilesetResolver;
} catch (e) {
  console.warn("Local vision_bundle failed, using CDN fallback.");

  const vision = await import(
    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/vision_bundle.mjs"
  );

  FaceLandmarker = vision.FaceLandmarker;
  FilesetResolver = vision.FilesetResolver;
}

// -------------------- DOM
// --------------------
const video = document.getElementById("video");
const canvas = document.getElementById("canvas");

// -------------------- THREE.JS (Matplotlib replacement)
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

const cloud = new THREE.Points(geometry, material);
scene.add(cloud);

// -------------------- CAMERA (OpenCV replacement)
// --------------------
async function startCamera() {
  const stream = await navigator.mediaDevices.getUserMedia({
    video: true
  });

  video.srcObject = stream;

  return new Promise(res => video.onloadedmetadata = res);
}

// -------------------- MAIN LOOP (Python while True equivalent)
// --------------------
async function main() {

  await startCamera();

  // REQUIRED MediaPipe runtime (cannot be local-only safely)
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

    let points = [];

    if (result.faceLandmarks.length > 0) {
      for (const lm of result.faceLandmarks[0]) {
        points.push(lm.x - 0.5, -(lm.y - 0.5), lm.z);
      }

      geometry.setAttribute(
        "position",
        new THREE.Float32BufferAttribute(points, 3)
      );

      geometry.attributes.position.needsUpdate = true;
    }

    renderer.render(scene, camera);
    requestAnimationFrame(loop);
  }

  loop();
}

main();
