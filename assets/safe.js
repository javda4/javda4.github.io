const video = document.getElementById("video");
const canvas = document.getElementById("overlay");
const ctx = canvas.getContext("2d");
const debug = document.getElementById("debug");

// ---------------- DEVICE DETECTION ----------------

const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

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

// ---------------- SYNC SIZE ----------------

function syncCanvasToVideo() {
  const w = video.videoWidth;
  const h = video.videoHeight;

  if (!w || !h) return;

  canvas.width = w;
  canvas.height = h;

  // ---------------- DEVICE MODE ----------------
  if (isMobile) {

    const displayWidth = window.innerWidth * 0.9;
    const displayHeight = displayWidth * (h / w);

    video.style.width = displayWidth + "px";
    video.style.height = displayHeight + "px";

    canvas.style.width = displayWidth + "px";
    canvas.style.height = displayHeight + "px";

  } else {

    const displayWidth = 400;
    const displayHeight = displayWidth * (h / w);

    video.style.width = displayWidth + "px";
    video.style.height = displayHeight + "px";

    canvas.style.width = displayWidth + "px";
    canvas.style.height = displayHeight + "px";
  }
}

// ---------------- RESULTS ----------------

faceMesh.onResults((results) => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (results.multiFaceLandmarks?.length > 0) {
    const points = results.multiFaceLandmarks[0];

    ctx.fillStyle = "lime";

    for (const p of points) {

      // 🔥 FIX: match mirrored video
      const x = (1 - p.x) * canvas.width;
      const y = p.y * canvas.height;

      ctx.beginPath();
      ctx.arc(x, y, 2, 0, Math.PI * 2);
      ctx.fill();
    }

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

// ---------------- INIT ----------------

video.onloadedmetadata = () => {
  syncCanvasToVideo();
  debug.innerText = "camera + facemesh running ✔";
};

// ---------------- HANDLE ROTATION (iPhone fix) ----------------

window.addEventListener("resize", () => {
  syncCanvasToVideo();
});
