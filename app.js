const video = document.getElementById("video");
const overlay = document.getElementById("overlay");
const ctx = overlay.getContext("2d");

const canvas3d = document.getElementById("canvas3d");
const ctx3d = canvas3d.getContext("2d");

const debug = document.getElementById("debug");

// ---------------- FACEMESH ----------------

const faceMesh = new FaceMesh({
  locateFile: (file) =>
    `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`
});

faceMesh.setOptions({
  maxNumFaces: 1,
  refineLandmarks: true,
  minDetectionConfidence: 0.5,
  minTrackingConfidence: 0.5
});

// ---------------- RESIZE ----------------

function resize() {
  const w = video.videoWidth;
  const h = video.videoHeight;

  if (!w || !h) return;

  overlay.width = w;
  overlay.height = h;

  canvas3d.width = canvas3d.clientWidth;
  canvas3d.height = canvas3d.clientHeight;
}

// ---------------- 3D ----------------

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

    const px = cx + x * scale * (1 - z);
    const py = cy + y * scale * (1 - z);

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

    const w = overlay.width;
    const h = overlay.height;

    ctx.fillStyle = "lime";

    for (const p of points) {

      // 🔥 FINAL FIX: PURE VIDEO NORMALIZED SPACE
      const x = (1 - p.x) * w;
      const y = p.y * h;

      ctx.beginPath();
      ctx.arc(x, y, 2, 0, Math.PI * 2);
      ctx.fill();
    }

    draw3D(points);

    debug.innerText = "FACE DETECTED ✔ " + points.length;

  } else {
    debug.innerText = "no face";
  }
});

// ---------------- CAMERA ----------------

const camera = new Camera(video, {
  onFrame: async () => {
    resize();
    await faceMesh.send({ image: video });
  },
  width: 640,
  height: 480
});

camera.start();

video.onloadedmetadata = resize;
