const video = document.getElementById("video");
const debug = document.getElementById("debug");

let landmarker;

function log(msg) {
  debug.innerText = msg;
  console.log(msg);
}

async function startCamera() {
  const stream = await navigator.mediaDevices.getUserMedia({
    video: true,
    audio: false
  });

  video.srcObject = stream;
  await video.play();

  log("camera ready ✔");
}

// ---------------- LOAD FACE MODEL ----------------
async function loadModel() {

  log("loading model...");

  try {
    const vision = await import(
      "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14"
    );

    const fileset = await vision.FilesetResolver.forVisionTasks(
      "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm"
    );

    landmarker = await vision.FaceLandmarker.createFromOptions(fileset, {
      baseOptions: {
        modelAssetPath:
          "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task"
      },
      runningMode: "VIDEO",
      numFaces: 1
    });

    log("model loaded ✔");

  } catch (e) {
    log("MODEL FAILED: " + e.message);
    console.error(e);
  }
}

// ---------------- DETECTION LOOP ----------------
function loop() {

  if (landmarker && video.readyState === 4) {

    const result = landmarker.detectForVideo(video, performance.now());

    if (result.faceLandmarks && result.faceLandmarks.length > 0) {
      log("FACE DETECTED ✔ " + result.faceLandmarks[0].length + " points");
    } else {
      log("no face detected...");
    }
  }

  requestAnimationFrame(loop);
}

// ---------------- MAIN ----------------
async function main() {

  await startCamera();
  await loadModel();

  loop();
}

main();
