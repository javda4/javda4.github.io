const video = document.getElementById("video");
const canvas = document.getElementById("overlay");
const ctx = canvas.getContext("2d");
const debug = document.getElementById("debug");

let landmarker;

function log(msg){
  debug.innerText = msg;
  console.log(msg);
}

// ---------------- CAMERA ----------------
async function startCamera(){

  log("requesting camera...");

  const stream = await navigator.mediaDevices.getUserMedia({
    video:true,
    audio:false
  });

  video.srcObject = stream;

  await video.play();

  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;

  log("camera ready ✔");
}


// ---------------- LOAD MODEL ----------------
async function loadModel(){

  log("loading vision wasm...");

  const fileset = await FilesetResolver.forVisionTasks(
    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm"
  );

  log("loading face model...");

  landmarker = await FaceLandmarker.createFromOptions(fileset,{
    baseOptions:{
      modelAssetPath:"./assets/face_landmarker.task"
    },
    runningMode:"VIDEO",
    numFaces:1
  });

  log("model loaded ✔");
}


// ---------------- DRAW LANDMARKS ----------------
function drawFace(points){

  ctx.clearRect(0,0,canvas.width,canvas.height);

  ctx.fillStyle="lime";

  for(const p of points){

    const x = p.x * canvas.width;
    const y = p.y * canvas.height;

    ctx.beginPath();
    ctx.arc(x,y,2,0,Math.PI*2);
    ctx.fill();
  }
}


// ---------------- MAIN LOOP ----------------
function loop(){

  if(landmarker && video.readyState===4){

    const result = landmarker.detectForVideo(video,performance.now());

    if(result.faceLandmarks && result.faceLandmarks.length>0){

      const points = result.faceLandmarks[0];

      drawFace(points);

      debug.innerText="FACE DETECTED ✔ points: "+points.length;

    }else{

      ctx.clearRect(0,0,canvas.width,canvas.height);
      debug.innerText="no face detected";
    }
  }

  requestAnimationFrame(loop);
}


// ---------------- MAIN ----------------
async function main(){

  await startCamera();
  await loadModel();

  loop();
}

main();
