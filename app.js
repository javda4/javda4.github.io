const video = document.getElementById("video");
const overlay = document.getElementById("overlay");
const ctx = overlay.getContext("2d");

const canvas3d = document.getElementById("canvas3d");
const ctx3d = canvas3d.getContext("2d");

const debug = document.getElementById("debug");

// ---------------- FACE MESH ----------------

const faceMesh = new FaceMesh({
  locateFile: (file) => {
    return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`;
  }
});

faceMesh.setOptions({
  maxNumFaces: 1,
  refineLandmarks: true,
  minDetectionConfidence: 0.5,
  minTrackingConfidence: 0.5
});

// ---------------- RESIZE (CRITICAL FIX) ----------------

function resizeAll() {

  // 🔥 USE DISPLAY SIZE (NOT video.videoWidth)
  const rect = video.getBoundingClientRect();

  overlay.width = rect.width;
  overlay.height = rect.height;

  canvas3d.width = canvas3d.clientWidth;
  canvas3d.height = canvas3d.clientHeight;
}

// ---------------- 3D RENDER ----------------

function draw3D(points) {
  ctx3d.clearRect(0, 0, canvas3d.width, canvas3d.height);

  const w = canvas3d.width;
  const h = canvas3d.height;

  const cx = w / 2;
  const cy = h / 2;

  const scale = Math.min(w, h) * 0.6;

  ctx3d.fillStyle = "cyan";

  for (const p of points) {

    const x = (p.x - 0.5);
    const y = (p.y - 0.5);
    const z = p.z || 0;

    const px = cx + (x * scale) * (1 - z);
    const py = cy + (y * scale) * (1 - z);

    ctx3d.beginPath();
    ctx3d.arc(px, py, 2, 0, Math.PI * 2);
    ctx3d.fill();
  }
}

// ---------------- RESULTS ----------------

faceMesh.onResults((results) => {

  ctx.clearRect(0, 0, overlay.width, overlay.height);

  if (results.multiFaceLandmarks?.length > 0) {

    const points = results.multiFaceLandmarks[0];

    const rect = video.getBoundingClientRect();

    // ---------------- 2D LEFT SIDE ----------------
    ctx.fillStyle = "lime";

    for (const p of points) {

      // 🔥 FIX: mirror + correct display mapping
      const x = (1 - p.x) * rect.width;
      const y = p.y * rect.height;

      ctx.beginPath();
      ctx.arc(x, y, 2, 0, Math.PI * 2);
      ctx.fill();
    }

    // ---------------- 3D RIGHT SIDE ----------------
    draw3D(points);

    debug.innerText = "FACE DETECTED ✔ " + points.length;

  } else {
    debug.innerText = "no face";
  }
});

// ---------------- CAMERA ----------------

const camera = new Camera(video, {
  onFrame: async () => {
    resizeAll();
    await faceMesh.send({ image: video });
  },
  width: 640,
  height: 480
});

camera.start();

// ---------------- INIT ----------------

video.onloadedmetadata = () => {
  resizeAll();
  debug.innerText = "running ✔";
};

window.addEventListener("resize", resizeAll);
