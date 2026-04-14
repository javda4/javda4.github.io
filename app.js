const video = document.getElementById("video");
const canvas = document.getElementById("overlay");
const ctx = canvas.getContext("2d");
const debug = document.getElementById("debug");

// resize canvas to match display
canvas.width = 400;
canvas.height = 300;

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

// ---------------- RESULTS ----------------

faceMesh.onResults((results) => {

  ctx.clearRect(0,0,canvas.width,canvas.height);

  if(results.multiFaceLandmarks.length > 0){

    const points = results.multiFaceLandmarks[0];

    ctx.fillStyle = "lime";

    for(const p of points){

      const x = p.x * canvas.width;
      const y = p.y * canvas.height;

      ctx.beginPath();
      ctx.arc(x,y,2,0,Math.PI*2);
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
    await faceMesh.send({image: video});
  },
  width: 640,
  height: 480
});

camera.start();

debug.innerText = "camera + facemesh running ✔";
