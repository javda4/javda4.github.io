const video = document.getElementById("video");
const canvas = document.getElementById("overlay");
const ctx = canvas.getContext("2d");
const debug = document.getElementById("debug");

// ---------------- FACEMESH ----------------

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

// ---------------- RESIZE HELPERS ----------------

function syncCanvasToVideo() {
  const w = video.videoWidth;
  const h = video.videoHeight;

  if (!w || !h) return;

  canvas.width = w;
  canvas.height = h;
}

// ---------------- RESULTS ----------------

faceMesh.onResults((results) => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
    const points = results.multiFaceLandmarks[0];

    // 🔥 FIX: mirror correction for iPhone front camera
    ctx.save();
    ctx.scale(-1, 1);
    ctx.translate(-canvas.width, 0);

    ctx.fillStyle = "lime";

    for (const p of points) {
      const x = p.x * canvas.width;
      const y = p.y * canvas.height;

      ctx.beginPath();
      ctx.arc(x, y, 2, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();

    debug.innerText = "FACE DETECTED ✔ " + points.length;
  } else {
    debug.innerText = "no face";
  }
});

// ---------------- CAMERA ----------------

const camera = new Camera(video, {
  onFrame: async () => {
    syncCanvasToVideo();
    await faceMesh.send({ image: video });
  },
  width: 640,
  height: 480
});

camera.start();

video.onloadedmetadata = () => {
  syncCanvasToVideo();
  debug.innerText = "camera + facemesh running ✔";
};
