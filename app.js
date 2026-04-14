import vision from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/vision_bundle.mjs";

const {
  FaceLandmarker,
  FilesetResolver
} = vision;

const video = document.getElementById("video");
const canvas = document.getElementById("canvas");

const renderer = new THREE.WebGLRenderer({ canvas, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
camera.position.z = 2;

const geometry = new THREE.BufferGeometry();
const material = new THREE.PointsMaterial({ color: 0x00ff00, size: 0.01 });

const points = new THREE.Points(geometry, material);
scene.add(points);

// ---------------- CAMERA ----------------
async function startCamera() {
  const stream = await navigator.mediaDevices.getUserMedia({ video: true });
  video.srcObject = stream;

  return new Promise(res => video.onloadedmetadata = res);
}

async function main() {

  await startCamera();

  const fileset = await FilesetResolver.forVisionTasks(
    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm"
  );

  const landmarker = await FaceLandmarker.createFromOptions(fileset, {
    baseOptions: {
      modelAssetPath:
        "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task"
    },
    runningMode: "VIDEO",
    numFaces: 1
  });

  function render() {

    const result = landmarker.detectForVideo(video, performance.now());

    if (result.faceLandmarks.length > 0) {

      const pts = [];

      for (const lm of result.faceLandmarks[0]) {
        pts.push(lm.x - 0.5, -(lm.y - 0.5), lm.z);
      }

      geometry.setAttribute(
        "position",
        new THREE.Float32BufferAttribute(pts, 3)
      );
    }

    geometry.attributes.position.needsUpdate = true;

    renderer.render(scene, camera);
    requestAnimationFrame(render);
  }

  render();
}

main();
